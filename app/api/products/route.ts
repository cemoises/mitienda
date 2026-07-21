import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createProduct, listProducts, type ProductInput } from "@/lib/products-repository";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ products: [], configured: false });
  }

  const { products, error } = await listProducts();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ products, configured: true });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const input = (await request.json()) as ProductInput;

  if (!input.name || input.price === undefined || input.stock === undefined) {
    return NextResponse.json({ error: "Datos del producto incompletos." }, { status: 400 });
  }

  const { product, error } = await createProduct(input);

  if (error || !product) {
    return NextResponse.json({ error: error ?? "No se pudo crear el producto." }, { status: 500 });
  }

  return NextResponse.json({ product }, { status: 201 });
}
