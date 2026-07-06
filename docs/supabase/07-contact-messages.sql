-- ============================================================================
-- 07-contact-messages.sql
-- Tabla para los mensajes del formulario de contacto (/contacto).
--
-- Los inserta SOLO el server (service role) desde el Route Handler
-- /api/contacto, después de validar. Por eso NO hay política de INSERT:
-- con RLS activo y sin políticas, ni anon ni authenticated pueden escribir
-- directo contra la tabla; el service role saltea RLS.
-- ============================================================================

create table if not exists public.contact_messages (
    id         bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    nombre     text not null,
    email      text not null,
    telefono   text,
    asunto     text not null,
    mensaje    text not null
);

alter table public.contact_messages enable row level security;

-- Solo un admin puede leer los mensajes (por si se agrega la vista al panel).
create policy "Mensajes: admin lee"
    on public.contact_messages for select
    using (public.is_admin());
