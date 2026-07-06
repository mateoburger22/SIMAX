/* ========================================================================
   lib/supabase/server.js
   Cliente de Supabase para el SERVIDOR (Server Components, Server Actions,
   Route Handlers). Lee/escribe la sesión desde las cookies de la petición.

   En Next.js 16 `cookies()` es ASÍNCRONO -> hay que usar await. Por eso esta
   función es async: siempre la llamás con  await createClient().
   ======================================================================== */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    // En Server Components no se pueden escribir cookies: el
                    // try/catch lo ignora sin romper. La sesión igual se
                    // refresca en proxy.js. En Server Actions / Route Handlers
                    // sí se escriben correctamente.
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // llamado desde un Server Component: ignorar.
                    }
                },
            },
        }
    );
}
