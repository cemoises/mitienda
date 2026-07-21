import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";

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
  rating: number;
  reviewCount: number;
  benefits: string[];
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
  rating?: number;
  reviewCount?: number;
  benefits?: string[];
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
  rating: number;
  review_count: number;
  benefits: string[];
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
    rating: row.rating,
    reviewCount: row.review_count,
    benefits: row.benefits ?? [],
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
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    ...(input.reviewCount !== undefined ? { review_count: input.reviewCount } : {}),
    ...(input.benefits !== undefined ? { benefits: input.benefits } : {}),
  };
}

// Lecturas: van con la clave pública (anon). El catálogo de la tienda tiene
// que poder listarse sin login — la policy de SELECT en Supabase es pública
// a propósito (ver supabase/schema.sql).
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

export async function getProductById(id: string): Promise<AdminProduct | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return null;
  }

  return fromRow(data as ProductRow);
}

// Escrituras: requieren el cliente service_role. Desde que las policies
// públicas de insert/update/delete se eliminaron (ver schema.sql), la clave
// anon ya no puede modificar el catálogo aunque alguien la lea del bundle.
export async function createProduct(
  input: ProductInput
): Promise<{ product: AdminProduct | null; error: string | null }> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      product: null,
      error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const { data, error } = await supabaseAdmin
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
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      product: null,
      error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const { data, error } = await supabaseAdmin
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
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      error: "El acceso administrativo a Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  return { error: error?.message ?? null };
}
