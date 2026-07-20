"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { trackInitiateCheckout } from "@/lib/analytics";

export default function CartDrawer() {
  const { items, itemCount, totalPrice, isOpen, setIsOpen, removeItem, updateQuantity } =
    useCart();

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={() => setIsOpen(false)}
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <h2 className="text-lg font-bold text-black">
            Tu Carrito <span className="text-black/40">({itemCount})</span>
          </h2>
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-black transition-colors hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-base font-medium text-black/60">Tu carrito está vacío</p>
            <Link
              href="/#destacados"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-black/10 py-5 first:pt-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface)]">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-black">{item.name}</p>
                      <button
                        type="button"
                        aria-label={`Eliminar ${item.name}`}
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 rounded-full p-1 text-black/40 transition-colors hover:bg-gray-100 hover:text-black"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <p className="text-sm text-black/50">${item.price.toFixed(2)} USD</p>

                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-black/15">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-black transition-colors hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-black transition-colors hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-black/10 px-6 py-5">
              <div className="mb-1 flex items-center justify-between text-base font-semibold text-black">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)} USD</span>
              </div>
              <p className="mb-4 text-xs text-black/50">
                Envío gratis e impuestos calculados al pagar.
              </p>
              <Link
                href="/checkout"
                onClick={() => {
                  setIsOpen(false);
                  trackInitiateCheckout(totalPrice);
                }}
                className="block w-full rounded-full bg-black px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-black/80"
              >
                Proceder al Pago
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
    </svg>
  );
}
