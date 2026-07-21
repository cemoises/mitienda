"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { saveLastOrder, saveOrderToHistory, type Order, type ShippingAddress } from "@/lib/order";
import { trackInitiateCheckout } from "@/lib/analytics";

const COUNTRIES = [
  "Estados Unidos",
  "Canadá",
  "España",
  "Alemania",
  "Francia",
  "Italia",
  "Países Bajos",
  "Portugal",
  "Irlanda",
];

const COUPON_CODE = "PARABOX10";
const COUPON_DISCOUNT_RATE = 0.1;

export default function CheckoutPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { items, totalPrice, clearCart } = useCart();

  const [email, setEmail] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const discount = appliedCoupon ? totalPrice * COUPON_DISCOUNT_RATE : 0;
  const total = totalPrice - discount;

  const isCartEmpty = items.length === 0;

  useEffect(() => {
    if (!isCartEmpty) {
      trackInitiateCheckout(total);
    }
    // Se dispara una sola vez al entrar a checkout con items en el carrito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartEmpty]);

  const handleApplyCoupon = () => {
    const normalized = couponInput.trim().toUpperCase();
    if (normalized === COUPON_CODE) {
      setAppliedCoupon(normalized);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError("Cupón inválido. Probá con PARABOX10.");
    }
  };

  const getShippingFromForm = (): ShippingAddress | null => {
    if (!formRef.current) return null;
    const formData = new FormData(formRef.current);
    return {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      country: String(formData.get("country") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCartEmpty || isSubmitting) return;

    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    const shipping = getShippingFromForm();
    if (!shipping) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/checkout/skrill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          items,
          subtotal: totalPrice,
          discount,
          total,
          couponCode: appliedCoupon,
        }),
      });

      const data = (await response.json()) as {
        redirectUrl?: string;
        order?: Order;
        error?: string;
      };

      if (!response.ok || !data.redirectUrl || !data.order) {
        throw new Error(data.error ?? "No se pudo iniciar el pago con Skrill.");
      }

      saveLastOrder(data.order);
      saveOrderToHistory(data.order);
      clearCart();

      window.location.href = data.redirectUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo iniciar el pago con Skrill."
      );
      setIsSubmitting(false);
    }
  };

  if (isCartEmpty) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold text-black">Tu carrito está vacío</h1>
            <p className="text-sm text-black/60">
              Agregá productos a tu carrito antes de continuar con el pago.
            </p>
            <Link
              href="/#destacados"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              Explorar Productos
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-10 text-3xl font-bold tracking-tight text-black">Checkout</h1>

          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div className="flex flex-col gap-10">
              <FormSection title="Información de Contacto">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" htmlFor="email">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="tu@email.com"
                      className={inputClasses}
                    />
                  </Field>
                  <Field label="Teléfono" htmlFor="phone">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+1 555 123 4567"
                      className={inputClasses}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Dirección de Envío">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre" htmlFor="firstName">
                    <input id="firstName" name="firstName" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Apellido" htmlFor="lastName">
                    <input id="lastName" name="lastName" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Dirección" htmlFor="address" full>
                    <input id="address" name="address" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Ciudad" htmlFor="city">
                    <input id="city" name="city" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="País" htmlFor="country">
                    <select id="country" name="country" required defaultValue="" className={inputClasses}>
                      <option value="" disabled>
                        Seleccioná un país
                      </option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Código Postal" htmlFor="postalCode">
                    <input id="postalCode" name="postalCode" type="text" required className={inputClasses} />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Método de Pago">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-black">
                    Tarjeta de Crédito / Débito Internacional (Visa, Mastercard, AMEX - Vía Skrill)
                  </span>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Pago seguro con Skrill
                  </span>
                </div>

                <div className="rounded-2xl bg-black p-6">
                  <div className="flex items-start gap-3">
                    <LockIconWhite />
                    <p className="text-sm leading-relaxed text-white/70">
                      Al hacer clic en <span className="font-semibold text-white">Completar Pedido</span>{" "}
                      serás redirigido a la pasarela segura de Skrill para ingresar los datos de tu
                      tarjeta y confirmar el pago. Al finalizar, volverás automáticamente a PARABOX.
                    </p>
                  </div>
                </div>
              </FormSection>

              {submitError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-center text-sm text-red-600">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? "Redirigiendo a Skrill..." : "Completar Pedido"}
              </button>
            </div>

            <aside className="h-fit rounded-2xl border border-black/10 bg-[var(--color-surface)] p-6">
              <h2 className="mb-5 text-sm font-semibold text-black">Resumen del Pedido</h2>

              <ul className="mb-5 flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-0.5">
                      <p className="text-sm font-medium text-black">{item.name}</p>
                      <p className="text-xs text-black/50">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="self-center text-sm font-semibold text-black">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mb-5 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Código de cupón"
                  className="w-full rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="shrink-0 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                >
                  Aplicar
                </button>
              </div>
              {couponError && <p className="mb-4 -mt-2 text-xs text-red-600">{couponError}</p>}
              {appliedCoupon && (
                <p className="mb-4 -mt-2 text-xs text-green-700">
                  Cupón {appliedCoupon} aplicado: -10%
                </p>
              )}

              <div className="flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
                <div className="flex items-center justify-between text-black/70">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-black/70">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-green-700">
                    <span>Descuento</span>
                    <span>-${discount.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-black/10 pt-2 text-base font-bold text-black">
                  <span>Total</span>
                  <span>${total.toFixed(2)} USD</span>
                </div>
              </div>

              <p className="mt-5 flex items-center gap-2 text-xs text-black/45">
                <LockIcon />
                Pagos encriptados con SSL de 256 bits
              </p>
            </aside>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold text-black">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-black/60">
        {label}
      </label>
      {children}
    </div>
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

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LockIconWhite() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-white/70">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
