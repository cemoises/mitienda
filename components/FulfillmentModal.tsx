"use client";

import { useState, FormEvent } from "react";
import type { Carrier, Order } from "@/lib/order";

const CARRIERS: Carrier[] = ["DHL", "FedEx", "Cainiao / AliExpress Standard", "Otro"];

type FulfillmentModalProps = {
  order: Order;
  onClose: () => void;
  onSuccess: (order: Order) => void;
};

function formatShippingAddress(order: Order): string {
  const { firstName, lastName, address, city, postalCode, country, phone } = order.shipping;
  return [
    `${firstName} ${lastName}`,
    address,
    `${city}, ${postalCode}`,
    country,
    `Tel: ${phone}`,
  ].join("\n");
}

export default function FulfillmentModal({ order, onClose, onSuccess }: FulfillmentModalProps) {
  const [carrier, setCarrier] = useState<Carrier>("DHL");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(formatShippingAddress(order));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFormError("No se pudo copiar la dirección. Copiala manualmente.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Enviado", trackingNumber, carrier }),
      });

      const data = (await response.json()) as { order?: Order; error?: string };

      if (!response.ok || !data.order) {
        throw new Error(data.error ?? "No se pudo procesar el envío.");
      }

      onSuccess(data.order);
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo procesar el envío.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-black">Procesar con Proveedor</h2>
            <p className="text-xs text-black/50">Orden {order.orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-black/50 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-black/60">Dirección de Envío del Cliente</p>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-gray-100"
            >
              {copied ? "¡Copiado!" : "Copiar Dirección"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-xl border border-black/10 bg-[var(--color-surface)] px-4 py-3 font-sans text-sm text-black">
            {formatShippingAddress(order)}
          </pre>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="carrier" className="text-xs font-medium text-black/60">
              Transportista
            </label>
            <select
              id="carrier"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value as Carrier)}
              className={inputClasses}
            >
              {CARRIERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="trackingNumber" className="text-xs font-medium text-black/60">
              Número de Tracking
            </label>
            <input
              id="trackingNumber"
              type="text"
              required
              placeholder="Ej: LX123456789CN"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              className={inputClasses}
            />
          </div>

          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Enviando..." : "Marcar como Enviado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black";

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
