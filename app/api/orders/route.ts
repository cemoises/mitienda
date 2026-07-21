import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Order } from "@/lib/order";

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

export async function POST(request: Request) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      { error: "Supabase no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const order = (await request.json()) as Order;
  const { error } = await supabase.from("orders").insert(toRow(order));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ orders: [], configured: false });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: (data as OrderRow[]).map(fromRow),
    configured: true,
  });
}
