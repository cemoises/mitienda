import type { AdminProduct } from "@/lib/products-repository";

type FbqFn = (...args: unknown[]) => void;
type TtqTrackFn = (event: string, payload?: Record<string, unknown>) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    ttq?: { track: TtqTrackFn };
  }
}

function emit(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function") {
    window.fbq("track", event, payload);
  }

  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track(event, payload);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, payload ?? {});
  }
}

export function trackPageView() {
  emit("PageView");
}

export function trackAddToCart(product: AdminProduct, quantity = 1) {
  emit("AddToCart", {
    content_id: product.id,
    content_name: product.name,
    value: product.price * quantity,
    currency: "USD",
    quantity,
  });
}

export function trackInitiateCheckout(total: number) {
  emit("InitiateCheckout", {
    value: total,
    currency: "USD",
  });
}

export function trackPurchase(orderId: string, total: number) {
  emit("Purchase", {
    content_ids: [orderId],
    value: total,
    currency: "USD",
  });
}
