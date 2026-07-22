import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateOrderStatus } from "@/lib/orders-repository";
import { decrementStock } from "@/lib/products-repository";
import { sendOrderEmail } from "@/lib/email";

const PAGOPAR_PRIVATE_KEY = process.env.PAGOPAR_PRIVATE_KEY || "demo-private-key";

// Pagopar notifica el resultado de un pago con un POST JSON. La forma
// documentada envuelve el resultado en un array "resultado"; algunos envíos
// de prueba mandan el objeto plano, así que aceptamos ambas formas.
type PagoparNotification = {
  hash_pedido?: string;
  token?: string;
  pedido?: string;
  pagado?: boolean | string;
};

type PagoparNotificationBody =
  | PagoparNotification
  | { resultado?: PagoparNotification[] };

function extractNotification(body: PagoparNotificationBody): PagoparNotification | null {
  if ("resultado" in body && Array.isArray(body.resultado)) {
    return body.resultado[0] ?? null;
  }
  return body as PagoparNotification;
}

// Token entrante = sha1(PAGOPAR_PRIVATE_KEY + hash_pedido). Sin
// PAGOPAR_PRIVATE_KEY configurada (más allá del fallback demo), o sin
// coincidencia exacta, la notificación se rechaza: así prevenimos que
// cualquiera falsifique un aviso de pago aprobado.
function isValidPagoparToken(hashPedido: string, incomingToken: string): boolean {
  const expected = crypto
    .createHash("sha1")
    .update(`${PAGOPAR_PRIVATE_KEY}${hashPedido}`)
    .digest("hex");
  return expected === incomingToken;
}

function isPaid(pagado: boolean | string | undefined): boolean {
  return pagado === true || pagado === "true";
}

export async function POST(request: Request) {
  let body: PagoparNotificationBody;

  try {
    body = (await request.json()) as PagoparNotificationBody;
  } catch (error) {
    console.error("[WEBHOOK_PAGOPAR_ERROR] Body de notificación no es JSON válido.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ respuesta: false, resultado: "Body inválido" }, { status: 400 });
  }

  const notification = extractNotification(body);
  const hashPedido = notification?.hash_pedido;
  const token = notification?.token;
  const orderNumber = notification?.pedido;

  if (!hashPedido || !token || !orderNumber) {
    console.error("[WEBHOOK_PAGOPAR_ERROR] Notificación incompleta.", { notification });
    return NextResponse.json({ respuesta: false, resultado: "Notificación incompleta" }, { status: 400 });
  }

  if (!isValidPagoparToken(hashPedido, token)) {
    console.error("[WEBHOOK_PAGOPAR_ERROR] Token de seguridad inválido.", {
      orderNumber,
      hashPedido,
    });
    return NextResponse.json({ respuesta: false, resultado: "Token inválido" }, { status: 400 });
  }

  if (!isPaid(notification?.pagado)) {
    // No es un error: Pagopar también notifica intentos rechazados/pendientes.
    // Se deja registrado para poder auditar el ciclo de vida completo del pago.
    console.info("[WEBHOOK_PAGOPAR_INFO] Notificación de Pagopar con pago no confirmado.", {
      orderNumber,
      pagado: notification?.pagado,
    });
    return NextResponse.json({ respuesta: true, resultado: "OK" }, { status: 200 });
  }

  const { order, error } = await updateOrderStatus(orderNumber, {
    status: "Pagado",
    transactionId: hashPedido,
  });

  if (error || !order) {
    console.error("[WEBHOOK_PAGOPAR_ERROR] No se pudo marcar la orden como Pagado.", {
      orderNumber,
      error,
    });
    return NextResponse.json({ respuesta: false, resultado: "No se pudo actualizar la orden" }, { status: 500 });
  }

  const { error: stockError } = await decrementStock(
    order.items.map((item) => ({ id: item.id, quantity: item.quantity }))
  );

  if (stockError) {
    console.error("[WEBHOOK_PAGOPAR_ERROR] No se pudo descontar stock para la orden pagada.", {
      orderNumber: order.orderNumber,
      error: stockError,
    });
  }

  // Los emails no deben bloquear ni hacer fallar la confirmación del webhook
  // ante Pagopar: se envían en paralelo y se loguea cada fallo (mismo
  // patrón que app/api/webhooks/skrill/route.ts).
  const [customerResult, adminResult] = await Promise.allSettled([
    sendOrderEmail({ order, type: "customer" }),
    sendOrderEmail({ order, type: "admin" }),
  ]);

  for (const [label, result] of [
    ["customer", customerResult],
    ["admin", adminResult],
  ] as const) {
    if (result.status === "rejected") {
      console.error(`[WEBHOOK_PAGOPAR_ERROR] Excepción al enviar email de tipo "${label}".`, {
        orderNumber: order.orderNumber,
        reason: result.reason,
      });
    } else if (result.value.error) {
      console.error(`[WEBHOOK_PAGOPAR_ERROR] Fallo al enviar email de tipo "${label}".`, {
        orderNumber: order.orderNumber,
        error: result.value.error,
      });
    }
  }

  return NextResponse.json({ respuesta: true, resultado: "OK" }, { status: 200 });
}
