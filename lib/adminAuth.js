/* ========================================================================
   lib/adminAuth.js
   Helper de AUTORIZACIÓN del panel de admin. Responde una sola pregunta:
   "¿quién hace esta petición y es admin?". Lo usan:
     · app/admin/layout.js  → para redirigir a los que no corresponden (UX).
     · las Server Actions   → para devolver un error claro antes de tocar
       la base (defensa en profundidad; la última palabra la tiene RLS).

   El rol NO viaja en la cookie ni en el JWT: se lee de public.profiles en
   cada petición. Así, si mañana le sacás el rol a alguien, pierde el acceso
   al instante (no hay que esperar que le venza el token).
   ======================================================================== */

import { createClient } from '@/lib/supabase/server';

export async function getAdminContext() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { supabase, user: null, isAdmin: false };

    // RLS permite leer el propio perfil, así que esta query siempre puede
    // resolver el rol del usuario logueado.
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return { supabase, user, isAdmin: profile?.role === 'admin' };
}
