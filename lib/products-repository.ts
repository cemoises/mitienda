import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ProductStatus = "active" | "draft";

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  status: ProductStatus;
  createdAt: string;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  status: ProductStatus;
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  status: ProductStatus;
  created_at: string;
};

function fromRow(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    category: row.category,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toRow(input: ProductInput) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    category: input.category,
    image_url: input.imageUrl,
    status: input.status,
  };
}

export async function listProducts(): Promise<{
  products: AdminProduct[];
  error: string | null;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { products: [], error: null };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { products: [], error: error.message };
  }

  return { products: (data as ProductRow[]).map(fromRow), error: null };
}

export async function createProduct(
  input: ProductInput
): Promise<{ product: AdminProduct | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { product: null, error: "Supabase no está configurado en este entorno." };
  }

  const { data, error } = await supabase
    .from("products")
    .insert(toRow(input))
    .select("*")
    .single();

  if (error || !data) {
    return { product: null, error: error?.message ?? "No se pudo crear el producto." };
  }

  return { product: fromRow(data as ProductRow), error: null };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<{ product: AdminProduct | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { product: null, error: "Supabase no está configurado en este entorno." };
  }

  const { data, error } = await supabase
    .from("products")
    .update(toRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return { product: null, error: error?.message ?? "No se pudo actualizar el producto." };
  }

  return { product: fromRow(data as ProductRow), error: null };
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: "Supabase no está configurado en este entorno." };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error: error?.message ?? null };
}
