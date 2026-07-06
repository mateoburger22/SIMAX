-- ============================================================================
-- 02-policies.sql  ·  Row Level Security (RLS) de SIMAX
-- ----------------------------------------------------------------------------
-- RLS = seguridad a nivel de FILA: la base decide, fila por fila, si el
-- usuario que hace la consulta puede verla/modificarla.
--
-- IMPORTANTE: al activar RLS en una tabla, por defecto se NIEGA TODO. Recién
-- las políticas (`policy`) abren accesos puntuales. Sin políticas, ni siquiera
-- el usuario dueño puede leer.
--
-- `auth.uid()` es una función de Supabase que devuelve el id del usuario
-- autenticado en la petición actual (o null si es anónimo).
--   · USING        -> condición para LEER/afectar filas existentes (select/update/delete)
--   · WITH CHECK    -> condición que deben cumplir las filas NUEVAS (insert/update)
-- ============================================================================

-- Activamos RLS en las cinco tablas.
alter table public.profiles    enable row level security;
alter table public.productos   enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ----------------------------------------------------------------------------
-- productos: catálogo PÚBLICO. Cualquiera (logueado o no) puede leer.
-- Nadie puede insertar/editar/borrar desde el cliente (eso queda para el
-- panel de Supabase o, más adelante, un rol admin).
-- ----------------------------------------------------------------------------
create policy "Productos: lectura pública"
    on public.productos
    for select
    using (true);

-- ----------------------------------------------------------------------------
-- profiles: cada usuario solo ve y edita SU propio perfil.
-- ----------------------------------------------------------------------------
create policy "Perfil: ver el propio"
    on public.profiles
    for select
    using (auth.uid() = id);

create policy "Perfil: actualizar el propio"
    on public.profiles
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- cart_items: cada usuario administra solo SU propio carrito. Habilitamos
-- las cuatro operaciones (select, insert, update, delete) restringidas al
-- propio user_id, porque el carrito es estado vivo: se agrega, se cambia
-- cantidad y se borra desde la web.
-- ----------------------------------------------------------------------------
create policy "Carrito: ver el propio"
    on public.cart_items
    for select
    using (auth.uid() = user_id);

create policy "Carrito: agregar al propio"
    on public.cart_items
    for insert
    with check (auth.uid() = user_id);

create policy "Carrito: actualizar el propio"
    on public.cart_items
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Carrito: borrar del propio"
    on public.cart_items
    for delete
    using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- orders: cada usuario solo ve y crea SUS órdenes (user_id = su id).
-- ----------------------------------------------------------------------------
create policy "Órdenes: ver las propias"
    on public.orders
    for select
    using (auth.uid() = user_id);

create policy "Órdenes: crear las propias"
    on public.orders
    for insert
    with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- order_items: un item es accesible si pertenece a una orden del usuario.
-- Lo resolvemos con un EXISTS contra orders (subconsulta correlacionada).
-- ----------------------------------------------------------------------------
create policy "Items: ver los de mis órdenes"
    on public.order_items
    for select
    using (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and o.user_id = auth.uid()
        )
    );

create policy "Items: crear en mis órdenes"
    on public.order_items
    for insert
    with check (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and o.user_id = auth.uid()
        )
    );
