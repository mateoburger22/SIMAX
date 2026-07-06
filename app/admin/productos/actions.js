'use server';

/* ========================================================================
   app/admin/productos/actions.js
   Server Actions del CRUD de productos. Las tres siguen el mismo esquema:

     1. ¿Es admin? Si no, error claro (y aunque mintiera, RLS bloquea igual).
     2. Validar los datos del form EN EL SERVIDOR (lo del cliente no se
        confía nunca: los `required` del HTML se pueden borrar con F12).
     3. Escribir en la base con la SESIÓN del admin → pasa por RLS, que
        verifica is_admin() del lado de Postgres.
     4. revalidatePath(): el catálogo y las fichas de producto se
        pre-renderizan estáticas en el build; si no las invalidamos acá,
        el público seguiría viendo la versión vieja hasta el próximo deploy.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminContext } from '@/lib/adminAuth';
import { sanitizeDescription } from '@/lib/sanitizeHtml';
import { lineas } from '@/data/productos';

// Valida y normaliza el form. Devuelve { values } o { error }.
function parseProductoForm(formData) {
    const sku = String(formData.get('sku') ?? '').trim().toUpperCase();
    const name = String(formData.get('name') ?? '').trim();
    const linea = String(formData.get('linea') ?? '').trim();
    const priceRaw = String(formData.get('price') ?? '').trim();
    const image = String(formData.get('image') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!sku || !name) {
        return { error: 'SKU y nombre son obligatorios.' };
    }
    // OJO: Number('') === 0, así que un precio vacío pasaría como "gratis".
    // Rechazamos la cadena vacía ANTES de convertir.
    if (priceRaw === '') {
        return { error: 'El precio es obligatorio.' };
    }
    const price = Number(priceRaw);
    if (!Number.isInteger(price) || price < 0) {
        return { error: 'El precio debe ser un número entero (en pesos, sin decimales).' };
    }
    if (!lineas.some((l) => l.id === linea)) {
        return { error: 'Elegí una línea válida.' };
    }
    if (image && !image.startsWith('/')) {
        return { error: 'La imagen debe ser una ruta dentro de public/, por ejemplo /img/productos/cinta.png' };
    }

    return {
        values: {
            sku,
            name,
            linea,
            price,
            image: image || null,
            // La ficha pública renderiza esto con dangerouslySetInnerHTML:
            // sanitizamos ANTES de guardar (solo se admite <strong>/<em>).
            description: sanitizeDescription(description) || null,
        },
    };
}

// Invalida las páginas públicas que muestran el catálogo. Recibe los sku
// afectados (el viejo y el nuevo si cambió) para regenerar cada ficha.
function revalidateCatalogo(...skus) {
    revalidatePath('/catalogo');
    for (const sku of skus) {
        if (sku) revalidatePath(`/productos/${sku.toLowerCase()}`);
    }
}

export async function createProductoAction(_prevState, formData) {
    const { supabase, isAdmin } = await getAdminContext();
    if (!isAdmin) return { error: 'No tenés permisos de administrador.' };

    const { values, error } = parseProductoForm(formData);
    if (error) return { error };

    const { error: dbError } = await supabase.from('productos').insert(values);
    if (dbError) {
        // 23505 = unique_violation de Postgres (sku repetido).
        return {
            error:
                dbError.code === '23505'
                    ? `Ya existe un producto con el SKU ${values.sku}.`
                    : 'No pudimos crear el producto. Probá de nuevo.',
        };
    }

    revalidateCatalogo(values.sku);
    redirect('/admin/productos');
}

export async function updateProductoAction(id, _prevState, formData) {
    const { supabase, isAdmin } = await getAdminContext();
    if (!isAdmin) return { error: 'No tenés permisos de administrador.' };

    const { values, error } = parseProductoForm(formData);
    if (error) return { error };

    // Leemos el sku ACTUAL antes de pisarlo: si cambia, hay que invalidar
    // también la ficha vieja (/productos/sku-viejo), que dejó de existir.
    const { data: existing } = await supabase
        .from('productos')
        .select('sku')
        .eq('id', id)
        .maybeSingle();
    if (!existing) return { error: 'El producto ya no existe.' };

    const { error: dbError } = await supabase
        .from('productos')
        .update(values)
        .eq('id', id);
    if (dbError) {
        return {
            error:
                dbError.code === '23505'
                    ? `Ya existe otro producto con el SKU ${values.sku}.`
                    : 'No pudimos guardar los cambios. Probá de nuevo.',
        };
    }

    revalidateCatalogo(existing.sku, values.sku);
    redirect('/admin/productos');
}

export async function deleteProductoAction(id) {
    const { supabase, isAdmin } = await getAdminContext();
    if (!isAdmin) return;

    const { data: existing } = await supabase
        .from('productos')
        .select('sku')
        .eq('id', id)
        .maybeSingle();

    // Borrar el producto NO rompe los pedidos históricos: order_items copia
    // sku/name/price al comprar y su FK es ON DELETE SET NULL (ver schema).
    const { error: dbError } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

    if (dbError) {
        // Sin esto el fallo sería silencioso: el admin vería la tabla igual
        // y pensaría que borró. El listado lee ?error= y muestra el aviso.
        console.error('[admin] error borrando producto:', dbError);
        redirect('/admin/productos?error=delete');
    }

    revalidateCatalogo(existing?.sku);
    revalidatePath('/admin/productos');
}
