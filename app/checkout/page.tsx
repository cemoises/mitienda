"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { generateOrderNumber, saveLastOrder } from "@/lib/order";

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
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [email, setEmail] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discount = appliedCoupon ? totalPrice * COUPON_DISCOUNT_RATE : 0;
  const total = totalPrice - discount;

  const isCartEmpty = items.length === 0;

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCartEmpty || isSubmitting) return;

    setIsSubmitting(true);

    window.setTimeout(() => {
      const orderNumber = generateOrderNumber();

      saveLastOrder({
        orderNumber,
        email,
        items,
        subtotal: totalPrice,
        discount,
        total,
        couponCode: appliedCoupon,
      });

      clearCart();
      router.push("/order-success");
    }, 1200);
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

          <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
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
                    <input id="firstName" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Apellido" htmlFor="lastName">
                    <input id="lastName" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Dirección" htmlFor="address" full>
                    <input id="address" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Ciudad" htmlFor="city">
                    <input id="city" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="País" htmlFor="country">
                    <select id="country" required defaultValue="" className={inputClasses}>
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
                    <input id="postalCode" type="text" required className={inputClasses} />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Método de Pago">
                <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  Modo Simulación / Prueba
                </span>

                <div className="flex flex-col gap-3">
                  <PaymentOption
                    id="card"
                    label="Tarjeta de Crédito/Débito (Demo)"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <PaymentOption
                    id="paypal"
                    label="PayPal (Demo)"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                </div>
              </FormSection>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? "Procesando pedido..." : "Completar Pedido Simulado"}
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

function PaymentOption({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
        checked ? "border-black bg-black/[0.03]" : "border-black/15"
      }`}
    >
      <input
        id={id}
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-black"
      />
      <span className="text-sm font-medium text-black">{label}</span>
    </label>
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
