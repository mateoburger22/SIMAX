/* ========================================================================
   app/api/auth/logout/route.js
   Endpoint POST de cierre de sesión. El botón "Salir" del Header hace
   `<form action="/api/auth/logout">`. Limpia las cookies de sesión (vía
   signOut, que las borra a través del Route Handler) y redirige al home.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
