import type { CartItem } from "@/context/CartContext";

export type OrderSummary = {
  orderNumber: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
};

const STORAGE_KEY = "parabox_last_order";

export function generateOrderNumber(): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `#PBX-${random}`;
}

export function saveLastOrder(order: OrderSummary) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function readLastOrder(): OrderSummary | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrderSummary;
  } catch {
    return null;
  }
}
