"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex w-fit items-center rounded-full border border-black/15">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center text-lg text-black transition-colors hover:bg-gray-100"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-semibold text-black">{quantity}</span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-11 w-11 items-center justify-center text-lg text-black transition-colors hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => addItem(product, quantity)}
        className="flex-1 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
      >
        Añadir al Carrito
      </button>
    </div>
  );
}
