/* ========================================================================
   lib/supabase/public.js
   Cliente de Supabase SIN cookies, para leer datos PÚBLICOS que no dependen
   de la sesión del usuario (el catálogo de productos, cuya tabla tiene RLS
   de "lectura pública").

   ¿Por qué existe? El cliente de server.js lee `cookies()`, y eso NO se puede
   usar en `generateStaticParams`, que corre en `next build` sin request ni
   cookies. Este cliente usa solo la anon key → sirve en build-time y en
   cualquier render de datos públicos.
   ======================================================================== */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createPublicClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            // No persistimos sesión: es un cliente de solo lectura pública.
            auth: { persistSession: false, autoRefreshToken: false },
        }
    );
}
