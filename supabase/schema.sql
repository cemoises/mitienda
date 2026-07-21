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
  payment_method text not null default 'skrill',
  transaction_id text not null default '',
  status text not null default 'Pendiente de Pago',
  tracking_number text,
  carrier text
);

-- Migración idempotente: agrega las columnas de fulfillment si la tabla
-- "orders" ya existía de una versión anterior (ej. en tu proyecto de Supabase
-- ya desplegado). Ejecutar este bloque es seguro aunque las columnas ya existan.
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists carrier text;

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

-- Permite que el webhook de Skrill marque la orden como 'Pagado'.
-- IMPORTANTE: en producción, mové esta escritura a una SUPABASE_SERVICE_ROLE_KEY
-- server-only (sin exponerla al cliente) y eliminá esta policy pública de UPDATE,
-- para que solo el backend confiable pueda modificar el estado de una orden.
create policy "Allow public updates" on orders
  for update
  using (true)
  with check (true);

-- =====================================================================
-- Tabla de productos para el Panel de Administración (/admin/products).
-- =====================================================================

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  stock integer not null default 0,
  category text not null default '',
  image_url text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- IMPORTANTE: /admin/products no tiene autenticación propia (es un enlace
-- discreto, igual que /admin/orders). Estas policies públicas alcanzan para
-- una demo, pero en producción real deberías protegerlas con un rol
-- autenticado o mover las escrituras a una SUPABASE_SERVICE_ROLE_KEY server-only.
create policy "Allow public reads" on products
  for select
  using (true);

create policy "Allow public inserts" on products
  for insert
  with check (true);

create policy "Allow public updates" on products
  for update
  using (true)
  with check (true);

create policy "Allow public deletes" on products
  for delete
  using (true);

-- Semilla con el catálogo actual de PARABOX (Desk & Focus), para que el
-- panel no arranque vacío. Se puede borrar o editar libremente desde /admin/products.
insert into products (name, description, price, stock, category, image_url, status)
select * from (values
  ('Lámpara LED Bar para Monitor',
   'Ilumina tu escritorio sin reflejos ni fatiga visual. Se acopla a la parte superior de tu monitor y proyecta una luz uniforme y cálida.',
   49::numeric, 25, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
   'active'),
  ('Soporte para Laptop en Aluminio',
   'Eleva tu pantalla a la altura ideal para una postura correcta. Aluminio sólido, plegable y portátil.',
   59::numeric, 40, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
   'active'),
  ('Organizador Magnético de Cables',
   'Dile adiós al caos de cables. Cierre magnético discreto que se integra a la estética de tu escritorio.',
   24::numeric, 60, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
   'active'),
  ('Mat de Escritorio Minimalista',
   'Una base uniforme para tu teclado, mouse y taza de café. Cuero vegano premium resistente al agua.',
   35::numeric, 30, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
   'active')
) as seed(name, description, price, stock, category, image_url, status)
where not exists (select 1 from products);
