import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

// Cliente privilegiado, SOLO para uso server-side (rutas API / repositorios).
// SUPABASE_SERVICE_ROLE_KEY nunca debe tener el prefijo NEXT_PUBLIC_ ni
// llegar al bundle del cliente: bypassea Row Level Security por completo.
export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl as string, serviceRoleKey as string, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
