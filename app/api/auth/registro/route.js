/* ========================================================================
   app/api/auth/registro/route.js
   Endpoint POST de alta de usuario. Mismo motivo que login para usar Route
   Handler en vez de Server Action: que la cookie de sesión persista.

   signUp con email + password + full_name como user_metadata. El trigger SQL
   `handle_new_user` corre en la base y crea la fila en public.profiles con
   ese full_name (ver docs/supabase/03-trigger.sql).
   ======================================================================== */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isValidEmail } from '@/lib/validators';

export async function POST(request) {
    const formData = await request.formData();
    const fullName = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('password_confirm') ?? '');

    if (!fullName || !email || !password) {
        redirect('/registro?error=campos');
    }
    // El type="email" del form se puede sacar con F12: re-validamos acá.
    if (!isValidEmail(email)) {
        redirect('/registro?error=email');
    }
    if (password.length < 6) {
        redirect('/registro?error=corta');
    }
    if (password !== passwordConfirm) {
        redirect('/registro?error=nocoincide');
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) {
        // Error típico: email ya registrado / inválido.
        redirect('/registro?error=signup');
    }

    redirect('/catalogo');
}
