-- ============================================================================
-- 01-schema.sql  ·  Estructura de tablas de SIMAX
-- ----------------------------------------------------------------------------
-- Supabase ya trae el esquema `auth` con la tabla auth.users (la maneja el
-- propio sistema de autenticación). Nosotros creamos las tablas de NEGOCIO en
-- el esquema `public` y las vinculamos a auth.users por el id del usuario.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: datos públicos/extendidos de cada usuario registrado.
-- No guardamos la contraseña ni el email acá: eso vive en auth.users (cifrado).
-- El id es el MISMO uuid que en auth.users (relación 1 a 1).
-- on delete cascade: si se borra el usuario, se borra su perfil.
-- ----------------------------------------------------------------------------
create table public.profiles (
    id         uuid primary key references auth.users (id) on delete cascade,
    full_name  text,
    created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- productos: el catálogo. Reemplaza al archivo data/productos.js.
-- `price` es un entero en pesos (sin decimales), igual que en el front.
-- `sku` es único: identifica comercialmente cada cinta.
-- ----------------------------------------------------------------------------
create table public.productos (
    id          bigint generated always as identity primary key,
    sku         text   not null unique,
    name        text   not null,
    description text,
    price       integer not null check (price >= 0),
    linea       text   not null,           -- 'reparacion' | 'electrica' | 'sellado' ...
    image       text,                       -- path en /public, ej '/img/productos/armortape.png'
    created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- cart_items: el carrito EN VIVO del usuario logueado. Una fila por
-- producto que tiene cargado. Cuando confirma la compra, estas filas se
-- convierten en order_items y la tabla se vacía.
-- `unique (user_id, producto_id)` impide duplicados: si agrega el mismo
-- producto dos veces, se actualiza la cantidad en vez de crear otra fila.
-- ----------------------------------------------------------------------------
create table public.cart_items (
    id          bigint generated always as identity primary key,
    user_id     uuid    not null references auth.users (id) on delete cascade,
    producto_id bigint  not null references public.productos (id) on delete cascade,
    quantity    integer not null check (quantity > 0),
    created_at  timestamptz not null default now(),
    unique (user_id, producto_id)
);

-- ----------------------------------------------------------------------------
-- orders: una orden de compra por usuario. El carrito confirmado.
-- `status` arranca en 'pendiente'; luego 'pagada', 'cancelada', etc.
-- `total` se guarda como copia histórica (los precios pueden cambiar después).
-- ----------------------------------------------------------------------------
create table public.orders (
    id                   bigint generated always as identity primary key,
    user_id              uuid   not null references auth.users (id) on delete cascade,
    status               text   not null default 'pendiente',
    total                integer not null default 0 check (total >= 0),
    shipping_full_name   text,
    shipping_email       text,
    shipping_phone       text,
    shipping_address     text,
    shipping_city        text,
    shipping_postal_code text,
    created_at           timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- order_items: el detalle de cada orden (qué productos y cuántos).
-- Copiamos sku/name/price al momento de la compra para tener un comprobante
-- fiel aunque después se edite o borre el producto del catálogo.
-- ----------------------------------------------------------------------------
create table public.order_items (
    id          bigint generated always as identity primary key,
    order_id    bigint  not null references public.orders (id) on delete cascade,
    producto_id bigint  references public.productos (id) on delete set null,
    sku         text    not null,
    name        text    not null,
    price       integer not null check (price >= 0),
    quantity    integer not null check (quantity > 0)
);

-- Índices para las búsquedas más comunes (por usuario y por orden).
create index orders_user_id_idx       on public.orders (user_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index cart_items_user_id_idx   on public.cart_items (user_id);
