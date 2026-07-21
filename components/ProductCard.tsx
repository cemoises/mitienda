"use client";

import Image from "next/image";
import Link from "next/link";
import type { AdminProduct } from "@/lib/products-repository";
import { useCart } from "@/context/CartContext";
import Stars from "@/components/Stars";
import { trackAddToCart } from "@/lib/analytics";

export default function ProductCard({ product }: { product: AdminProduct }) {
  const { addItem } = useCart();
  const isOutOfStock = product.status === "out_of_stock";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-[var(--color-surface)]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
        />
        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-black transition-colors hover:text-black/70">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-black/50">{product.rating.toFixed(1)}</span>
        </div>

        <p className="text-lg font-bold text-black">${product.price.toFixed(2)} USD</p>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            addItem(product);
            trackAddToCart(product);
          }}
          className="mt-auto w-full rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30 disabled:hover:bg-black/30"
        >
          {isOutOfStock ? "Agotado" : "Añadir al Carrito"}
        </button>
      </div>
    </div>
  );
}
