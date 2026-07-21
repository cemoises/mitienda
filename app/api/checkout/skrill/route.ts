import { NextResponse } from "next/server";
import { generateOrderNumber, type Order, type ShippingAddress } from "@/lib/order";
import { insertOrder } from "@/lib/orders-repository";
import { getProductById } from "@/lib/products-repository";

const SKRILL_PAY_TO_EMAIL = process.env.SKRILL_PAY_TO_EMAIL || "pagos@cemoises.com";
const SKRILL_MERCHANT_ID = process.env.SKRILL_MERCHANT_ID || "demo-merchant-id";

const COUPON_CODE = "PARABOX10";
const COUPON_DISCOUNT_RATE = 0.1;
const MAX_ITEM_QUANTITY = 20;

type RequestedItem = {
  id: string;
  quantity: number;
};

type SkrillCheckoutRequestBody = {
  email: string;
  shipping: ShippingAddress;
  items: RequestedItem[];
  couponCode: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SkrillCheckoutRequestBody;

  if (!body.email || !body.shipping || !body.items?.length) {
    return NextResponse.json({ error: "Datos del pedido incompletos o inválidos." }, { status: 400 });
  }

  // Nunca confiamos en precios/totales que manda el cliente: recalculamos
  // todo server-side contra el catálogo real en Supabase. Esto es lo único
  // que determina cuánto se le cobra al cliente en Skrill.
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
      return NextResponse.json(
        { error: `Uno de los productos de tu carrito ya no está disponible.` },
        { status: 409 }
      );
    }

    subtotal += product.price * quantity;
    verifiedItems.push({ ...product, quantity });
  }

  const appliedCoupon =
    typeof body.couponCode === "string" && body.couponCode.trim().toUpperCase() === COUPON_CODE
      ? COUPON_CODE
      : null;
  const discount = appliedCoupon ? subtotal * COUPON_DISCOUNT_RATE : 0;
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
    couponCode: appliedCoupon,
    paymentMethod: "skrill",
    transactionId: "",
    status: "Pendiente de Pago",
  };

  const { error } = await insertOrder(order);

  if (error) {
    return NextResponse.json(
      { error: `No se pudo iniciar el pago: ${error}` },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;

  const skrillParams = new URLSearchParams({
    pay_to_email: SKRILL_PAY_TO_EMAIL,
    merchant_id: SKRILL_MERCHANT_ID,
    transaction_id: order.orderNumber,
    return_url: `${origin}/order-success`,
    cancel_url: `${origin}/checkout`,
    status_url: `${origin}/api/webhooks/skrill`,
    amount: order.total.toFixed(2),
    currency: "USD",
    payment_methods: "ACC",
    language: "ES",
    pay_from_email: order.email,
    detail1_description: "Orden",
    detail1_text: order.orderNumber,
  });

  const redirectUrl = `https://pay.skrill.com/?${skrillParams.toString()}`;

  return NextResponse.json({ redirectUrl, orderNumber: order.orderNumber, order }, { status: 201 });
}
