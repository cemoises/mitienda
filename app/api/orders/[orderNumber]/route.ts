import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { updateOrderStatus } from "@/lib/orders-repository";
import { sendOrderEmail } from "@/lib/email";
import type { Carrier, OrderStatus } from "@/lib/order";

type FulfillmentRequestBody = {
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: Carrier;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  const { orderNumber } = await params;
  const body = (await request.json()) as FulfillmentRequestBody;

  if (!body.status) {
    return NextResponse.json({ error: "Falta el nuevo estado de la orden." }, { status: 400 });
  }

  if (body.status === "Enviado" && !body.trackingNumber) {
    return NextResponse.json(
      { error: "El número de tracking es obligatorio para marcar la orden como enviada." },
      { status: 400 }
    );
  }

  const { order, error } = await updateOrderStatus(decodeURIComponent(orderNumber), {
    status: body.status,
    trackingNumber: body.trackingNumber,
    carrier: body.carrier,
  });

  if (error || !order) {
    return NextResponse.json({ error: error ?? "No se pudo actualizar la orden." }, { status: 500 });
  }

  if (body.status === "Enviado") {
    // El email no debe hacer fallar la actualización de la orden si Resend falla.
    await sendOrderEmail({ order, type: "shipping_update" });
  }

  return NextResponse.json({ order });
}
