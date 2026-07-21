import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { deleteProduct, updateProduct, type ProductInput } from "@/lib/products-repository";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const input = (await request.json()) as ProductInput;

  if (!input.name || input.price === undefined || input.stock === undefined) {
    return NextResponse.json({ error: "Datos del producto incompletos." }, { status: 400 });
  }

  const { product, error } = await updateProduct(id, input);

  if (error || !product) {
    return NextResponse.json(
      { error: error ?? "No se pudo actualizar el producto." },
      { status: 500 }
    );
  }

  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const { error } = await deleteProduct(id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
