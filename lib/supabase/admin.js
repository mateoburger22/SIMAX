/* ========================================================================
   lib/supabase/admin.js
   Cliente de Supabase con la SERVICE ROLE KEY. Esta clave saltea RLS por
   completo (tiene permisos totales), así que SOLO puede usarse en el server
   y NUNCA debe llegar al navegador (por eso la env var NO lleva NEXT_PUBLIC_).

   ¿Por qué lo necesitamos? Para actualizar `orders` (pasar a 'pagada') y
   vaciar `cart_items` desde:
     · el webhook de Mercado Pago, que llega servidor-a-servidor SIN sesión de
       usuario → auth.uid() es null → RLS bloquearía todo.
     · la verificación de respaldo en la confirmación (además, `orders` no tiene
       política de UPDATE para el usuario, a propósito: el estado del pedido no
       debe poder cambiarlo el cliente).
   ======================================================================== */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            // Cliente de servidor sin sesión: no persistimos ni refrescamos nada.
            auth: { persistSession: false, autoRefreshToken: false },
        }
    );
}
