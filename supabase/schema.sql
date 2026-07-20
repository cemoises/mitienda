-- Ejecutar en el SQL Editor de Supabase para crear la tabla de órdenes de PARABOX.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  created_at timestamptz not null default now(),
  email text not null,
  shipping jsonb not null,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  coupon_code text,
  status text not null default 'Pendiente de Despacho'
);

alter table orders enable row level security;

-- Permite insertar órdenes desde el checkout público (clave anon).
create policy "Allow public inserts" on orders
  for insert
  with check (true);

-- Permite leer órdenes desde el panel admin (clave anon).
-- En producción, restringí esta policy a un rol autenticado.
create policy "Allow public reads" on orders
  for select
  using (true);
