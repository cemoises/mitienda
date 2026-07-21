import { NextResponse } from "next/server";
import { generateOrderNumber, type Order, type ShippingAddress } from "@/lib/order";
import type { CartItem } from "@/context/CartContext";
import { insertOrder } from "@/lib/orders-repository";

const SKRILL_PAY_TO_EMAIL = process.env.SKRILL_PAY_TO_EMAIL || "pagos@cemoises.com";
const SKRILL_MERCHANT_ID = process.env.SKRILL_MERCHANT_ID || "demo-merchant-id";

type SkrillCheckoutRequestBody = {
  email: string;
  shipping: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SkrillCheckoutRequestBody;

  if (!body.email || !body.shipping || !body.items?.length || !body.total || body.total <= 0) {
    return NextResponse.json({ error: "Datos del pedido incompletos o inválidos." }, { status: 400 });
  }

  const order: Order = {
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    email: body.email,
    shipping: body.shipping,
    items: body.items,
    subtotal: body.subtotal,
    discount: body.discount,
    total: body.total,
    couponCode: body.couponCode,
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
