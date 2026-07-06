/* ========================================================================
   app/api/contacto/route.js
   Endpoint POST del formulario de contacto. El form (Client Component)
   le pega con fetch mandando JSON.

   El server RE-VALIDA todo aunque el cliente ya haya validado: cualquiera
   puede pegarle a este endpoint con curl salteándose el form. Si pasa,
   guardamos el mensaje en Supabase (tabla contact_messages) con el cliente
   admin: la tabla no tiene políticas de INSERT a propósito, solo el server
   puede escribir en ella.
   ======================================================================== */

import { createAdminClient } from '@/lib/supabase/admin';
import { isValidEmail, isValidPhone } from '@/lib/validators';

// Límites defensivos para que nadie guarde novelas de 10 MB.
const MAX_LEN = { nombre: 120, email: 200, telefono: 30, asunto: 200, mensaje: 5000 };

export async function POST(request) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return Response.json({ error: 'Solicitud inválida.' }, { status: 400 });
    }

    const nombre = String(body.nombre ?? '').trim();
    const email = String(body.email ?? '').trim();
    const telefono = String(body.telefono ?? '').trim();
    const asunto = String(body.asunto ?? '').trim();
    const mensaje = String(body.mensaje ?? '').trim();

    if (nombre.length < 2) {
        return Response.json({ error: 'Ingresá tu nombre.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
        return Response.json({ error: 'El email no tiene un formato válido.' }, { status: 400 });
    }
    if (telefono && !isValidPhone(telefono)) {
        return Response.json({ error: 'El teléfono no tiene un formato válido.' }, { status: 400 });
    }
    if (asunto.length < 3) {
        return Response.json({ error: 'Ingresá el asunto de tu consulta.' }, { status: 400 });
    }
    if (mensaje.length < 10) {
        return Response.json({ error: 'El mensaje es demasiado corto.' }, { status: 400 });
    }
    for (const [campo, max] of Object.entries(MAX_LEN)) {
        if ({ nombre, email, telefono, asunto, mensaje }[campo].length > max) {
            return Response.json({ error: `El campo ${campo} es demasiado largo.` }, { status: 400 });
        }
    }

    const { error } = await createAdminClient()
        .from('contact_messages')
        .insert({ nombre, email, telefono: telefono || null, asunto, mensaje });

    if (error) {
        console.error('[contacto] error guardando mensaje:', error);
        return Response.json(
            { error: 'No pudimos guardar tu mensaje. Probá de nuevo en unos minutos.' },
            { status: 500 }
        );
    }

    return Response.json({ ok: true });
}
