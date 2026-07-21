import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const { amount } = (await request.json()) as { amount?: number };

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "El monto del pedido es inválido." }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
