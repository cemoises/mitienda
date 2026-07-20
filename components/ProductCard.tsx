"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-sm font-semibold text-black">{product.name}</h3>

        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-black/50">{product.rating.toFixed(1)}</span>
        </div>

        <p className="text-lg font-bold text-black">${product.price.toFixed(2)} USD</p>

        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-auto w-full rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
        >
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Calificación: ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(rating);
        return (
          <svg
            key={index}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-black"
          >
            <path d="M12 2.5l2.9 6.02 6.6.87-4.8 4.6 1.2 6.51L12 17.6l-5.9 3.9 1.2-6.51-4.8-4.6 6.6-.87L12 2.5z" strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
}
