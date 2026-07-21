import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { insertOrder, listOrders } from "@/lib/orders-repository";
import type { Order } from "@/lib/order";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const order = (await request.json()) as Order;
  const { error } = await insertOrder(order);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ orders: [], configured: false });
  }

  const { orders, error } = await listOrders();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ orders, configured: true });
}
