"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import type { Product } from "@/lib/products";

type CartContextValue = {
  itemCount: number;
  addItem: (product: Product) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const value = useMemo<CartContextValue>(
    () => ({
      itemCount,
      addItem: () => setItemCount((count) => count + 1),
    }),
    [itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
