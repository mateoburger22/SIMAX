/* ========================================================================
   app/api/auth/login/route.js
   Endpoint POST de login. El formulario hace `<form action="/api/auth/login">`.

   ¿Por qué un Route Handler y no una Server Action? En esta versión de Next,
   las cookies que Supabase intenta escribir DENTRO de una Server Action no
   llegan a persistirse en el navegador (la sesión se perdía). En un Route
   Handler la respuesta sí incluye las cookies de sesión correctamente.

   Flujo: valida → signInWithPassword (que escribe la cookie) → redirect.
   Los errores se comunican volviendo a /login?error=... (el form los muestra).
   ======================================================================== */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isValidEmail } from '@/lib/validators';

export async function POST(request) {
    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
        redirect('/login?error=campos');
    }
    // El type="email" del form se puede sacar con F12: re-validamos acá.
    if (!isValidEmail(email)) {
        redirect('/login?error=email');
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Mensaje genérico: no diferenciamos "email no existe" de "password mal"
        // para no filtrar qué emails están registrados.
        redirect('/login?error=credenciales');
    }

    redirect('/catalogo');
}
