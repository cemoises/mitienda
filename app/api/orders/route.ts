import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { insertOrder, listOrders } from "@/lib/orders-repository";
import type { Order } from "@/lib/order";

// Protegido por proxy.ts (requiere sesión admin) — esta ruta expone PII de
// clientes (nombre, dirección, teléfono, email) y ya no debe ser pública.

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY)." },
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
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ orders: [], configured: false });
  }

  const { orders, error } = await listOrders();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ orders, configured: true });
}
