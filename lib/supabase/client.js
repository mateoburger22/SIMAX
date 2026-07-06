'use client';

/* ========================================================================
   lib/supabase/client.js
   Cliente de Supabase para el NAVEGADOR (Client Components).
   Se usa en componentes con 'use client': formularios de login, botones
   que leen la sesión, etc. Lee las cookies de sesión del propio browser.
   ======================================================================== */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
