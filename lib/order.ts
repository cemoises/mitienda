import type { CartItem } from "@/context/CartContext";

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
};

export type OrderStatus = "Pagado";

export type PaymentMethod = "card";

export type Order = {
  orderNumber: string;
  createdAt: string;
  email: string;
  shipping: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: OrderStatus;
};

const LAST_ORDER_KEY = "parabox_last_order";
const ALL_ORDERS_KEY = "parabox_all_orders";

export function generateOrderNumber(): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `#PBX-${random}`;
}

export function saveLastOrder(order: Order) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
}

export function readLastOrder(): Order | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export function saveOrderToHistory(order: Order) {
  if (typeof window === "undefined") return;
  const orders = readAllOrders();
  window.localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify([order, ...orders]));
}

export function readAllOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ALL_ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

export function clearAllOrders() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ALL_ORDERS_KEY);
}
