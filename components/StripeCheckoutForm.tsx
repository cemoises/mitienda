"use client";

import { useState, FormEvent } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

type StripeCheckoutFormProps = {
  disabled?: boolean;
  onBeforeConfirm: () => boolean;
  onSuccess: (paymentIntentId: string) => void;
};

export default function StripeCheckoutForm({
  disabled,
  onBeforeConfirm,
  onSuccess,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || isProcessing || disabled) return;
    if (!onBeforeConfirm()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "No se pudo procesar el pago. Intentá de nuevo.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
      return;
    }

    setErrorMessage("El pago no pudo completarse. Intentá de nuevo.");
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl bg-black p-6">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {errorMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isProcessing && <Spinner />}
        {isProcessing ? "Procesando pago..." : "Completar Pedido"}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
