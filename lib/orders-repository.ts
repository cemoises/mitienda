import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import type { Carrier, Order, OrderStatus } from "@/lib/order";

// La tabla "orders" no tiene NINGUNA policy pública de Supabase (ver
// supabase/schema.sql): contiene PII de clientes. Todo acceso, incluyendo
// lecturas, pasa exclusivamente por el cliente service_role server-side.

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
  tracking_number: string | null;
  carrier: string | null;
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
    tracking_number: order.trackingNumber ?? null,
    carrier: order.carrier ?? null,
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
    trackingNumber: row.tracking_number ?? undefined,
    carrier: (row.carrier as Carrier | null) ?? undefined,
  };
}

const NOT_CONFIGURED_ERROR =
  "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY).";

export async function insertOrder(order: Order): Promise<{ error: string | null }> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const { error } = await supabaseAdmin.from("orders").insert(toRow(order));
  return { error: error?.message ?? null };
}

export async function listOrders(): Promise<{ orders: Order[]; error: string | null }> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { orders: [], error: null };
  }

  const { data, error } = await supabaseAdmin
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
  updates: {
    status: OrderStatus;
    transactionId?: string;
    trackingNumber?: string;
    carrier?: Carrier;
  }
): Promise<{ order: Order | null; error: string | null }> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { order: null, error: NOT_CONFIGURED_ERROR };
  }

  const payload: Record<string, unknown> = { status: updates.status };
  if (updates.transactionId !== undefined) {
    payload.transaction_id = updates.transactionId;
  }
  if (updates.trackingNumber !== undefined) {
    payload.tracking_number = updates.trackingNumber;
  }
  if (updates.carrier !== undefined) {
    payload.carrier = updates.carrier;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(payload)
    .eq("order_number", orderNumber)
    .select("*")
    .single();

  if (error || !data) {
    return { order: null, error: error?.message ?? "No se pudo actualizar la orden." };
  }

  return { order: fromRow(data as OrderRow), error: null };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return fromRow(data as OrderRow);
}
