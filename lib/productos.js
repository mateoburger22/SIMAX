/* ========================================================================
   lib/productos.js
   Acceso de SOLO LECTURA al catálogo desde la base. Se usa en Server
   Components (catálogo y ficha de producto) y en `generateStaticParams`
   (build-time). Usa un cliente SIN cookies (createPublicClient): la tabla
   `productos` tiene RLS "lectura pública", así que no hace falta la sesión
   del usuario, y además así funciona en `next build`, donde no hay cookies.
   ======================================================================== */

import { createPublicClient } from '@/lib/supabase/public';

// Lista todo el catálogo. Usado por /catalogo. Lo ordenamos por id para
// que mantenga el orden del seed (línea reparación → aislación → sellado).
export async function getAllProductos() {
    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from('productos')
        .select('id, sku, name, description, price, linea, image')
        .order('id', { ascending: true });

    if (error) throw error;
    return data;
}

// Busca un producto por su slug de URL (sku en lowercase).
// Ej: 'cimat-rw-050' → fila con sku 'CIMAT-RW-050'.
// Postgres permite comparar case-insensitive con `ilike` sin wildcards.
export async function getProductoBySlug(slug) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
        .from('productos')
        .select('id, sku, name, description, price, linea, image')
        .ilike('sku', slug)
        .maybeSingle();

    if (error) throw error;
    return data; // null si no existe → la página llama notFound()
}
