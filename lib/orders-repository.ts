import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/lib/order";

type OrderRow = {
  order_number: string;
  created_at: string;
  email: string;
  shipping: Order["shipping"];
  items: Order["items"];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  payment_method: Order["paymentMethod"];
  transaction_id: string;
  status: Order["status"];
};

function toRow(order: Order): OrderRow {
  return {
    order_number: order.orderNumber,
    created_at: order.createdAt,
    email: order.email,
    shipping: order.shipping,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    coupon_code: order.couponCode,
    payment_method: order.paymentMethod,
    transaction_id: order.transactionId,
    status: order.status,
  };
}

function fromRow(row: OrderRow): Order {
  return {
    orderNumber: row.order_number,
    createdAt: row.created_at,
    email: row.email,
    shipping: row.shipping,
    items: row.items,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    couponCode: row.coupon_code,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    status: row.status,
  };
}

export async function insertOrder(order: Order): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: "Supabase no está configurado en este entorno." };
  }

  const { error } = await supabase.from("orders").insert(toRow(order));
  return { error: error?.message ?? null };
}

export async function listOrders(): Promise<{ orders: Order[]; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { orders: [], error: null };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: error.message };
  }

  return { orders: (data as OrderRow[]).map(fromRow), error: null };
}

export async function updateOrderStatus(
  orderNumber: string,
  updates: { status: OrderStatus; transactionId?: string }
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: "Supabase no está configurado en este entorno." };
  }

  const payload: Record<string, unknown> = { status: updates.status };
  if (updates.transactionId !== undefined) {
    payload.transaction_id = updates.transactionId;
  }

  const { error } = await supabase.from("orders").update(payload).eq("order_number", orderNumber);
  return { error: error?.message ?? null };
}
