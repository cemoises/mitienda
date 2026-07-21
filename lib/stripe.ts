import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(stripeSecretKey);

export const stripe: Stripe | null = isStripeConfigured
  ? new Stripe(stripeSecretKey as string)
  : null;
