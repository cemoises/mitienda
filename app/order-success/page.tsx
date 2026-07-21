"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readLastOrder, type Order } from "@/lib/order";
import { trackPurchase } from "@/lib/analytics";

export default function OrderSuccessPage() {
  const [order] = useState<Order | null>(() => readLastOrder());

  useEffect(() => {
    if (order) {
      trackPurchase(order.orderNumber, order.total);
    }
    // Se dispara una sola vez al mostrar la confirmación de una orden existente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold text-black">No encontramos ninguna orden reciente</h1>
            <Link
              href="/"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              Volver a la Tienda
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
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <CheckBadge />

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            ¡Gracias por tu compra!
          </h1>

          {order && (
            <>
              <p className="mt-3 text-base text-black/60">
                Tu orden <span className="font-semibold text-black">{order.orderNumber}</span> fue
                confirmada. Enviamos un recibo a{" "}
                <span className="font-semibold text-black">{order.email || "tu correo"}</span>.
              </p>

              <div className="mt-10 w-full rounded-2xl border border-black/10 bg-[var(--color-surface)] p-6 text-left">
                <h2 className="mb-5 text-sm font-semibold text-black">Resumen de tu pedido</h2>

                <ul className="flex flex-col gap-4">
                  {order.items.map((item) => (
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

                <div className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
                  <div className="flex items-center justify-between text-black/70">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)} USD</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex items-center justify-between text-green-700">
                      <span>Descuento {order.couponCode ? `(${order.couponCode})` : ""}</span>
                      <span>-${order.discount.toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-black/10 pt-2 text-base font-bold text-black">
                    <span>Total pagado</span>
                    <span>${order.total.toFixed(2)} USD</span>
                  </div>
                </div>

                <p className="mt-4 border-t border-black/10 pt-4 text-xs text-black/40">
                  ID de transacción: <span className="font-mono">{order.transactionId}</span>
                </p>
              </div>
            </>
          )}

          <Link
            href="/"
            className="mt-10 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
          >
            Volver a la Tienda
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

function CheckBadge() {
  return (
    <span className="relative flex h-20 w-20 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </span>
  );
}
