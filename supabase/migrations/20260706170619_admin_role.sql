-- ============================================================================
-- 06-admin-role.sql  ·  Rol de administrador + políticas del panel de admin
-- ----------------------------------------------------------------------------
-- Agrega la noción de ADMIN al sistema:
--
--   1. Columna `role` en profiles ('user' por defecto, 'admin' para el dueño).
--   2. Función `is_admin()` que las políticas usan para preguntar "¿el que
--      consulta es admin?".
--   3. Políticas RLS nuevas: el admin puede ESCRIBIR el catálogo y VER/
--      ACTUALIZAR todos los pedidos.
--
-- La seguridad REAL del panel vive acá: aunque alguien saltee la UI de
-- /admin (por ejemplo llamando a la API REST de Supabase con su sesión),
-- la base rechaza el INSERT/UPDATE/DELETE si su perfil no es admin.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Columna role. `check` restringe los valores posibles a nivel de base:
--    nadie puede guardarse un rol inventado como 'superadmin'.
--    OJO: profiles tiene política de UPDATE sobre la propia fila, así que un
--    usuario podría intentar auto-ascenderse con un UPDATE. Lo bloqueamos con
--    el trigger de más abajo (punto 4).
-- ----------------------------------------------------------------------------
alter table public.profiles
    add column if not exists role text not null default 'user'
        check (role in ('user', 'admin'));

-- ----------------------------------------------------------------------------
-- 2) is_admin(): ¿el usuario autenticado de ESTA petición es admin?
--    `security definer` -> corre con permisos del dueño y SALTEA el RLS de
--    profiles. Necesario por dos motivos:
--      · evita recursión (una política de profiles que consulta profiles
--        volvería a disparar sus propias políticas, en loop);
--      · permite usarla desde políticas de otras tablas (orders, productos).
--    `stable` -> le avisa a Postgres que dentro de una misma query devuelve
--    siempre lo mismo, así puede cachear el resultado y no re-ejecutarla
--    fila por fila.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and role = 'admin'
    );
$$;

-- ----------------------------------------------------------------------------
-- 3) Políticas nuevas. Las policies son PERMISIVAS: se suman con OR a las
--    existentes (el usuario común sigue viendo lo suyo; el admin ve todo).
-- ----------------------------------------------------------------------------

-- productos: hasta ahora solo lectura pública; el admin gestiona el catálogo.
create policy "Productos: admin crea"
    on public.productos
    for insert
    with check (public.is_admin());

create policy "Productos: admin edita"
    on public.productos
    for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "Productos: admin borra"
    on public.productos
    for delete
    using (public.is_admin());

-- orders: el admin ve TODOS los pedidos y puede cambiarles el estado.
create policy "Órdenes: admin ve todas"
    on public.orders
    for select
    using (public.is_admin());

create policy "Órdenes: admin actualiza"
    on public.orders
    for update
    using (public.is_admin())
    with check (public.is_admin());

-- order_items: el admin ve el detalle de cualquier pedido.
create policy "Items: admin ve todos"
    on public.order_items
    for select
    using (public.is_admin());

-- profiles: el admin ve todos los perfiles (para mostrar quién compró).
create policy "Perfil: admin ve todos"
    on public.profiles
    for select
    using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4) Anti auto-ascenso: la política "Perfil: actualizar el propio" dejaría
--    que un usuario haga UPDATE de su propia fila... incluida la columna
--    role. Este trigger lo impide: si el que edita no es admin, el role no
--    puede cambiar. (RLS decide QUÉ FILAS se tocan; el trigger decide QUÉ
--    COLUMNAS — se complementan.)
-- ----------------------------------------------------------------------------
create or replace function public.protect_role_column()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    -- auth.uid() null = conexión privilegiada (SQL editor / service role),
    -- que de todas formas saltea RLS. El bloqueo aplica a usuarios de la API.
    if new.role is distinct from old.role
       and (select auth.uid()) is not null
       and not public.is_admin() then
        raise exception 'No tenés permiso para cambiar el rol.';
    end if;
    return new;
end;
$$;

create trigger protect_profiles_role
    before update on public.profiles
    for each row
    execute function public.protect_role_column();

revoke execute on function public.protect_role_column() from anon, authenticated, public;

-- ----------------------------------------------------------------------------
-- 5) Nombrar al primer admin (se hace UNA vez, a mano, después de registrarte):
--
--    update public.profiles
--    set role = 'admin'
--    where id = (select id from auth.users where email = 'TU-EMAIL-ACA');
-- ----------------------------------------------------------------------------
