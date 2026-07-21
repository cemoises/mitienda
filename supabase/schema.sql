-- Ejecutar en el SQL Editor de Supabase.
-- Este script es idempotente: se puede correr varias veces sin romper nada.

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

alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists carrier text;

alter table orders enable row level security;

-- =====================================================================
-- SEGURIDAD: orders no tiene NINGUNA policy pública.
-- =====================================================================
-- La tabla "orders" contiene PII de clientes (nombre, dirección, teléfono,
-- email) y no debe ser legible ni escribible con la clave anon (la que
-- vive en el bundle de JS del navegador). Todo insert/select/update pasa
-- por rutas server-side (app/api/checkout/skrill, app/api/webhooks/skrill,
-- app/api/orders/*) usando SUPABASE_SERVICE_ROLE_KEY, que en Supabase
-- bypassea RLS automáticamente — por eso no hace falta (ni conviene)
-- declarar policies "para service_role": simplemente no declarar policies
-- públicas ya deja a la tabla en default-deny para anon/authenticated.
drop policy if exists "Allow public inserts" on orders;
drop policy if exists "Allow public reads" on orders;
drop policy if exists "Allow public updates" on orders;

-- =====================================================================
-- Tabla de productos para el Panel de Administración (/admin/products)
-- y para el storefront público (que ahora lee el catálogo desde acá).
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
  rating numeric not null default 4.8,
  review_count integer not null default 0,
  benefits jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table products add column if not exists rating numeric not null default 4.8;
alter table products add column if not exists review_count integer not null default 0;
alter table products add column if not exists benefits jsonb not null default '[]'::jsonb;

alter table products enable row level security;

-- SELECT sí es público a propósito: es el catálogo de la tienda, cualquier
-- visitante anónimo tiene que poder listar y ver productos sin loguearse.
drop policy if exists "Allow public reads" on products;
create policy "Allow public reads" on products
  for select
  using (true);

-- =====================================================================
-- SEGURIDAD: sin policies públicas de escritura en products.
-- =====================================================================
-- Crear/editar/borrar productos solo puede hacerlo el backend autenticado
-- como admin, usando SUPABASE_SERVICE_ROLE_KEY (bypassea RLS). La clave
-- anon pública ya no puede insertar, actualizar ni borrar productos.
drop policy if exists "Allow public inserts" on products;
drop policy if exists "Allow public updates" on products;
drop policy if exists "Allow public deletes" on products;

-- =====================================================================
-- Descuento atómico de stock al confirmarse el pago de una orden.
-- =====================================================================
-- Se ejecuta como una única sentencia UPDATE (no lee-modifica-escribe desde
-- la app), así dos webhooks concurrentes descontando el mismo producto no
-- pisan el valor uno del otro. Si el stock llega a 0, el producto pasa
-- automáticamente a 'out_of_stock' para que la tienda deje de venderlo.
-- security definer: corre con los permisos del dueño de la función, no los
-- del rol que la invoca, para no depender de policies adicionales.
create or replace function decrement_product_stock(product_id uuid, qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update products
  set
    stock = greatest(stock - qty, 0),
    status = case when (stock - qty) <= 0 and status = 'active' then 'out_of_stock' else status end
  where id = product_id;
$$;

-- Semilla con el catálogo actual de PARABOX (Desk & Focus), para que el
-- panel no arranque vacío. Se puede borrar o editar libremente desde /admin/products.
insert into products (name, description, price, stock, category, image_url, status, rating, review_count, benefits)
select * from (values
  ('Lámpara LED Bar para Monitor',
   'Ilumina tu escritorio sin reflejos ni fatiga visual. Se acopla a la parte superior de tu monitor y proyecta una luz uniforme y cálida.',
   49::numeric, 25, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
   'active', 4.8::numeric, 96,
   '["Iluminación asimétrica sin reflejos en pantalla","Control táctil de brillo y temperatura de color","Diseño ultra delgado en aluminio anodizado","Plug & Play vía USB-C"]'::jsonb),
  ('Soporte para Laptop en Aluminio',
   'Eleva tu pantalla a la altura ideal para una postura correcta. Aluminio sólido, plegable y portátil.',
   59::numeric, 40, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
   'active', 4.9::numeric, 142,
   '["Materiales de alta calidad en aluminio sólido","Diseño ergonómico ajustable en altura","Plegable y portátil, ideal para viajar","Compatible con laptops de 10\" a 17\""]'::jsonb),
  ('Organizador Magnético de Cables',
   'Dile adiós al caos de cables. Cierre magnético discreto que se integra a la estética de tu escritorio.',
   24::numeric, 60, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
   'active', 4.7::numeric, 78,
   '["Cierre magnético de alta resistencia","Set de 6 unidades en silicona premium","Plug & Play, sin herramientas ni instalación","Diseño minimalista en negro mate"]'::jsonb),
  ('Mat de Escritorio Minimalista',
   'Una base uniforme para tu teclado, mouse y taza de café. Cuero vegano premium resistente al agua.',
   35::numeric, 30, 'PARABOX Desk & Focus',
   'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
   'active', 4.9::numeric, 61,
   '["Cuero vegano premium resistente al agua","Diseño ergonómico de bordes cosidos","Base antideslizante de alta durabilidad","Disponible en negro y gris piedra"]'::jsonb)
) as seed(name, description, price, stock, category, image_url, status, rating, review_count, benefits)
where not exists (select 1 from products);
