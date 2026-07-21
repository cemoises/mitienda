// Fuente única de verdad para cupones: la usan tanto el checkout (server,
// autoritativo) como la UI del carrito (cliente, solo para feedback
// instantáneo). No hay datos sensibles acá, es seguro importarlo en ambos.

export type Coupon = {
  code: string;
  discountRate: number;
};

const COUPONS: Coupon[] = [{ code: "PARABOX10", discountRate: 0.1 }];

export function findCoupon(code: string | null | undefined): Coupon | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((coupon) => coupon.code === normalized) ?? null;
}
