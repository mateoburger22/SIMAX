/* ========================================================================
   app/admin/productos/[id]/page.js — Edición de producto
   Server Component: busca el producto por id y renderiza ProductForm con
   la action de actualizar. `.bind(null, id)` fija el id en la action para
   que no viaje como campo editable del form.

   El segmento estático /nuevo tiene prioridad sobre este [id] dinámico:
   Next matchea rutas de más específica a más general.
   ======================================================================== */

import { notFound } from 'next/navigation';
import { getAdminContext } from '@/lib/adminAuth';
import ProductForm from '../ProductForm';
import { updateProductoAction } from '../actions';
import styles from '../page.module.css';

export const metadata = {
    title: 'Editar producto — Panel de Polytape',
};

export default async function EditarProducto({ params }) {
    // En Next 16, params es un Promise.
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) notFound();

    const { supabase } = await getAdminContext();
    const { data: producto } = await supabase
        .from('productos')
        .select('id, sku, name, description, price, linea, image')
        .eq('id', numericId)
        .maybeSingle();

    if (!producto) notFound();

    return (
        <div className={styles.wrap}>
            <h2>Editar: {producto.name}</h2>
            <ProductForm
                action={updateProductoAction.bind(null, producto.id)}
                producto={producto}
                submitLabel="Guardar cambios"
            />
        </div>
    );
}
