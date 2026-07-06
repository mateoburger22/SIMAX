/* ========================================================================
   proxy.js
   En Next.js 16 el viejo `middleware.js` se renombró a `proxy.js` y la
   función exportada se llama `proxy`. Corre en el servidor ANTES de cada
   ruta que matchee el `config.matcher`.

   Su trabajo acá: refrescar el token de sesión de Supabase en cada navegación
   para que no se venza, reescribiendo las cookies en la respuesta.
   ======================================================================== */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request) {
    let response = NextResponse.next({ request });

    // Si aún no configuraste .env.local, no intentes hablar con Supabase:
    // dejá pasar la request para no romper el sitio.
    if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
        return response;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // No quitar: getUser() valida y refresca el token si está por vencer.
    await supabase.auth.getUser();

    return response;
}

export const config = {
    // Corre en todas las rutas EXCEPTO assets estáticos e imágenes.
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
