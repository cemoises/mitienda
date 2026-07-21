import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateOrderStatus } from "@/lib/orders-repository";
import { decrementStock } from "@/lib/products-repository";
import { sendOrderEmail } from "@/lib/email";

const SKRILL_MERCHANT_ID = process.env.SKRILL_MERCHANT_ID || "demo-merchant-id";

// Skrill firma cada notificación con un MD5 calculado a partir de campos fijos
// + el secret word configurado en el panel del merchant. Referencia:
// https://www.skrill.com/en/skrill-for-business/integration-3/other-integrations/quick-checkout/
//
// SIN fallback: si SKRILL_SECRET_WORD no está seteada, cualquiera que haya
// leído este archivo (el repo es público) podría calcular una firma válida
// contra un secreto conocido y marcar órdenes como "Pagado" gratis. Preferimos
// que el webhook falle explícitamente antes que aceptar ese riesgo.
function isValidSkrillSignature(fields: Record<string, string>): boolean {
  const secretWord = process.env.SKRILL_SECRET_WORD;
  if (!secretWord) return false;

  const { transaction_id, mb_amount, mb_currency, status, md5sig } = fields;
  if (!md5sig || !transaction_id || !mb_amount || !mb_currency || !status) return false;

  const secretHash = crypto
    .createHash("md5")
    .update(secretWord)
    .digest("hex")
    .toUpperCase();

  const signatureBase = `${SKRILL_MERCHANT_ID}${transaction_id}${secretHash}${mb_amount}${mb_currency}${status}`;
  const expectedSignature = crypto.createHash("md5").update(signatureBase).digest("hex").toUpperCase();

  return expectedSignature === md5sig.toUpperCase();
}

export async function POST(request: Request) {
  if (!process.env.SKRILL_SECRET_WORD) {
    console.error("[WEBHOOK_ERROR] Falta SKRILL_SECRET_WORD en el entorno, webhook rechazado.");
    return NextResponse.json(
      { error: "Webhook no configurado: falta SKRILL_SECRET_WORD en el entorno." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    fields[key] = String(value);
  });

  if (!isValidSkrillSignature(fields)) {
    console.error("[WEBHOOK_ERROR] Firma de Skrill inválida.", {
      transactionId: fields.transaction_id,
      status: fields.status,
    });
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const orderNumber = fields.transaction_id;
  const skrillTransactionId = fields.mb_transaction_id ?? "";
  const status = fields.status;

  // status "2" = pago procesado exitosamente (documentación de Skrill Quick Checkout).
  if (status === "2" && orderNumber) {
    const { order, error } = await updateOrderStatus(orderNumber, {
      status: "Pagado",
      transactionId: skrillTransactionId,
    });

    if (error || !order) {
      console.error("[ORDER_ERROR] No se pudo marcar la orden como Pagado.", {
        orderNumber,
        error,
      });
    } else {
      const { error: stockError } = await decrementStock(
        order.items.map((item) => ({ id: item.id, quantity: item.quantity }))
      );

      if (stockError) {
        console.error("[STOCK_ERROR] No se pudo descontar stock para la orden pagada.", {
          orderNumber: order.orderNumber,
          error: stockError,
        });
      }

      // Los emails no deben bloquear ni hacer fallar la confirmación del
      // webhook ante Skrill: se envían en paralelo y se loguea cada fallo.
      const [customerResult, adminResult] = await Promise.allSettled([
        sendOrderEmail({ order, type: "customer" }),
        sendOrderEmail({ order, type: "admin" }),
      ]);

      for (const [label, result] of [
        ["customer", customerResult],
        ["admin", adminResult],
      ] as const) {
        if (result.status === "rejected") {
          console.error(`[EMAIL_ERROR] Excepción al enviar email de tipo "${label}".`, {
            orderNumber: order.orderNumber,
            reason: result.reason,
          });
        } else if (result.value.error) {
          console.error(`[EMAIL_ERROR] Fallo al enviar email de tipo "${label}".`, {
            orderNumber: order.orderNumber,
            error: result.value.error,
          });
        }
      }
    }
  } else if (status !== "2") {
    // No es un error: Skrill también notifica pagos pendientes/cancelados.
    // Lo dejamos registrado para poder auditar el ciclo de vida completo del pago.
    console.info("[WEBHOOK_INFO] Notificación de Skrill con status no exitoso.", {
      orderNumber,
      status,
    });
  }

  return new NextResponse("OK", { status: 200 });
}
