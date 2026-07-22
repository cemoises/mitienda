import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { generateOrderNumber, type Order, type ShippingAddress } from "@/lib/order";
import { insertOrder } from "@/lib/orders-repository";
import { getProductById } from "@/lib/products-repository";
import { findCoupon } from "@/lib/coupons";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const PAGOPAR_PUBLIC_KEY = process.env.PAGOPAR_PUBLIC_KEY || "demo-public-key";
const PAGOPAR_PRIVATE_KEY = process.env.PAGOPAR_PRIVATE_KEY || "demo-private-key";
const PAGOPAR_API_URL = "https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion";

const MAX_ITEM_QUANTITY = 20;
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

type RequestedItem = {
  id: string;
  quantity: number;
};

type PagoparCheckoutRequestBody = {
  email: string;
  shipping: ShippingAddress;
  items: RequestedItem[];
  couponCode: string | null;
};

type PagoparIniciarTransaccionResponse = {
  respuesta?: boolean;
  resultado?: Array<{ hash_pedido?: string; hash?: string }>;
  hash?: string;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(`checkout:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    console.error("[RATE_LIMIT_ERROR] Demasiados intentos de checkout desde la misma IP.", { ip });
    return NextResponse.json(
      { error: "Demasiados intentos de compra. Probá de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as PagoparCheckoutRequestBody;

  if (!body.email || !body.shipping || !body.items?.length) {
    return NextResponse.json({ error: "Datos del pedido incompletos o inválidos." }, { status: 400 });
  }

  // Nunca confiamos en precios/totales que manda el cliente: recalculamos
  // todo server-side contra el catálogo real en Supabase, igual que en el
  // checkout de Skrill (ver app/api/checkout/skrill/route.ts).
  const verifiedItems: Order["items"] = [];
  let subtotal = 0;

  for (const requestedItem of body.items) {
    if (!requestedItem?.id) {
      return NextResponse.json({ error: "Producto inválido en el carrito." }, { status: 400 });
    }

    const quantity = Math.min(
      MAX_ITEM_QUANTITY,
      Math.max(1, Math.floor(Number(requestedItem.quantity) || 1))
    );

    const product = await getProductById(requestedItem.id);

    if (!product || product.status !== "active") {
      console.error("[ORDER_ERROR] Intento de compra de producto no disponible.", {
        productId: requestedItem.id,
        status: product?.status ?? "not_found",
        ip,
      });
      return NextResponse.json(
        { error: "Uno de los productos de tu carrito ya no está disponible." },
        { status: 409 }
      );
    }

    if (product.stock < quantity) {
      console.error("[ORDER_ERROR] Intento de compra con stock insuficiente.", {
        productId: requestedItem.id,
        requested: quantity,
        stock: product.stock,
        ip,
      });
      return NextResponse.json(
        { error: `No queda stock suficiente de "${product.name}".` },
        { status: 409 }
      );
    }

    subtotal += product.price * quantity;
    verifiedItems.push({ ...product, quantity });
  }

  const appliedCoupon = findCoupon(body.couponCode);
  const discount = appliedCoupon ? subtotal * appliedCoupon.discountRate : 0;
  const total = subtotal - discount;

  if (total <= 0) {
    return NextResponse.json({ error: "El total del pedido es inválido." }, { status: 400 });
  }

  const order: Order = {
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    email: body.email,
    shipping: body.shipping,
    items: verifiedItems,
    subtotal,
    discount,
    total,
    couponCode: appliedCoupon?.code ?? null,
    paymentMethod: "pagopar",
    transactionId: "",
    status: "Pendiente de Pago",
  };

  const { error: insertError } = await insertOrder(order);

  if (insertError) {
    console.error("[ORDER_ERROR] No se pudo insertar la orden en Supabase.", {
      orderNumber: order.orderNumber,
      error: insertError,
    });
    return NextResponse.json(
      { error: `No se pudo iniciar el pago: ${insertError}` },
      { status: 503 }
    );
  }

  // Formato de monto que espera Pagopar: entero sin decimales (Guaraníes).
  // Acá el monto es USD con centavos; lo mandamos como string con 2
  // decimales fijos para que el token firmado y el body coincidan byte a
  // byte, y se puede ajustar la moneda/formato una vez definida contra la
  // cuenta real de Pagopar.
  const montoTotal = order.total.toFixed(2);

  // Token de seguridad: sha1(PAGOPAR_PRIVATE_KEY + order_id + total_monto),
  // según lo especificado para la integración. NUNCA se computa en el
  // cliente: la clave privada no debe salir del servidor.
  const token = crypto
    .createHash("sha1")
    .update(`${PAGOPAR_PRIVATE_KEY}${order.orderNumber}${montoTotal}`)
    .digest("hex");

  const origin = new URL(request.url).origin;

  const pagoparPayload = {
    token_publico: PAGOPAR_PUBLIC_KEY,
    token,
    id_pedido_comercio: order.orderNumber,
    monto_total: montoTotal,
    tipo_pedido: "VENTA-COMERCIO",
    descripcion_resumen: `Orden ${order.orderNumber} — PARABOX`,
    fecha_maxima_pago: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    url_retorno: `${origin}/order-success`,
    url_error: `${origin}/checkout`,
    url_cancelacion: `${origin}/checkout`,
    url_notificacion: `${origin}/api/webhooks/pagopar`,
    comprador: {
      ruc: "",
      email: order.email,
      telefono: order.shipping.phone,
      nombre: order.shipping.firstName,
      apellido: order.shipping.lastName,
      direccion: order.shipping.address,
      documento: "",
      tipo_documento: "",
      direccion_referencia: `${order.shipping.city}, ${order.shipping.country}`,
      direccion_complemento: order.shipping.postalCode,
    },
    items: verifiedItems.map((item) => ({
      nombre: item.name,
      cantidad: item.quantity,
      precio_total: (item.price * item.quantity).toFixed(2),
      categoria: item.category,
      url_imagen: item.imageUrl,
    })),
  };

  let pagoparResponse: PagoparIniciarTransaccionResponse;

  try {
    const response = await fetch(PAGOPAR_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([pagoparPayload]),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[ORDER_ERROR] Pagopar respondió con error al iniciar la transacción.", {
        orderNumber: order.orderNumber,
        status: response.status,
        detail,
      });
      return NextResponse.json(
        { error: "No se pudo iniciar el pago con Pagopar." },
        { status: 502 }
      );
    }

    pagoparResponse = (await response.json()) as PagoparIniciarTransaccionResponse;
  } catch (error) {
    console.error("[ORDER_ERROR] Excepción al iniciar la transacción con Pagopar.", {
      orderNumber: order.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "No se pudo iniciar el pago con Pagopar." }, { status: 502 });
  }

  const hash = pagoparResponse.resultado?.[0]?.hash_pedido ?? pagoparResponse.resultado?.[0]?.hash ?? pagoparResponse.hash;

  if (!hash) {
    console.error("[ORDER_ERROR] Pagopar no devolvió un hash de transacción válido.", {
      orderNumber: order.orderNumber,
      response: pagoparResponse,
    });
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Pagopar." },
      { status: 502 }
    );
  }

  const redirectUrl = `https://www.pagopar.com/pagar/${hash}`;

  return NextResponse.json({ redirectUrl, orderNumber: order.orderNumber, order }, { status: 201 });
}
