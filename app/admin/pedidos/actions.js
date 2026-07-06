'use server';

/* ========================================================================
   app/admin/pedidos/actions.js
   Cambiar el estado de un pedido. El <form> de cada fila manda solo el
   <select name="status">; el id del pedido viene fijado con .bind().

   La escritura va con la sesión del admin → la política RLS
   "Órdenes: admin actualiza" es la que realmente autoriza. (El usuario
   común no tiene NINGUNA política de UPDATE sobre orders, a propósito.)
   ======================================================================== */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminContext } from '@/lib/adminAuth';
import { ORDER_STATUSES } from './statuses';

export async function updateOrderStatusAction(orderId, formData) {
    const { supabase, isAdmin } = await getAdminContext();
    if (!isAdmin) return;

    const status = String(formData.get('status') ?? '');
    if (!ORDER_STATUSES.includes(status)) return;

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        // Sin esto el fallo sería silencioso: el re-render mostraría el
        // estado viejo sin explicación. La página lee ?error= y avisa.
        console.error('[admin] error cambiando estado del pedido:', error);
        redirect('/admin/pedidos?error=estado');
    }

    // El cliente ve el estado en /cuenta/pedidos y /confirmacion/[id], pero
    // esas páginas son dinámicas (leen cookies) — no hace falta invalidarlas.
    revalidatePath('/admin/pedidos');
}
