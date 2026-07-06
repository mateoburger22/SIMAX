/* ========================================================================
   data/productos.js
   Antes vivían acá los 9 productos hardcoded. Ahora el catálogo está en
   Supabase (tabla public.productos, ver lib/productos.js). Este archivo
   queda solo con:
     · `lineas`     → metadata de UI (numeración y descripción larga de
                      cada familia). Es texto de presentación, no datos
                      de negocio: vive en código para no acoplar el front
                      a una segunda tabla por una decoración.
     · `formatPrice`→ helper de formato. No depende de datos.
   ======================================================================== */

export const lineas = [
    {
        id: 'reparacion',
        numero: '01',
        nombre: 'Reparación con fibra de vidrio',
        descripcion:
            'Cintas activadas con agua que endurecen en minutos. Refuerzo estructural permanente para tuberías, mangueras y piezas dañadas.',
    },
    {
        id: 'aislacion',
        numero: '02',
        nombre: 'Aislación eléctrica',
        descripcion:
            'Cintas dieléctricas certificadas para conexiones de baja, media y alta tensión en entornos industriales y obras eléctricas.',
    },
    {
        id: 'sellado',
        numero: '03',
        nombre: 'Sellado de tuberías',
        descripcion:
            'Cintas selladoras para juntas, roscas y reparaciones en sistemas de gas, agua y aire comprimido.',
    },
];

// Helper para formatear precios en pesos argentinos. No toca DB.
// La guarda evita que un total null/undefined (fila vieja, dato faltante)
// tire un TypeError y rompa toda la página por un solo dato malo.
export function formatPrice(value) {
    const n = Number(value);
    return '$' + (Number.isFinite(n) ? n : 0).toLocaleString('es-AR');
}
