-- ============================================================================
-- 03-trigger.sql  ·  Crear el perfil automáticamente al registrarse
-- ----------------------------------------------------------------------------
-- Se corre TERCERO. Cuando alguien se registra, Supabase inserta una fila en
-- auth.users. Queremos que, en ese mismo momento, se cree su fila en
-- public.profiles. Lo hacemos con un TRIGGER sobre auth.users.
--
-- `security definer` -> la función corre con los permisos de quien la creó
-- (vos, dueño), no con los del usuario que se registra. Necesario porque el
-- usuario nuevo todavía no tiene permiso de insertar en profiles.
-- `set search_path = ''` -> buena práctica de seguridad: obliga a nombrar los
-- esquemas explícitamente (public.profiles) y evita ataques por search_path.
--
-- `raw_user_meta_data` es un JSON donde guardamos datos extra del registro
-- (ej. full_name). Lo mandaremos desde el front al hacer signUp.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data ->> 'full_name');
    return new;
end;
$$;

-- Disparar la función después de cada alta de usuario.
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- La función es `security definer` para poder insertar en profiles, pero
-- al vivir en el esquema `public` queda expuesta vía /rest/v1/rpc. Le
-- sacamos el permiso de ejecutar a los roles de la API REST para que solo
-- el trigger pueda invocarla.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
