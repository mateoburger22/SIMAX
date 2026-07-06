/* ========================================================================
   app/admin/pedidos/statuses.js
   Estados posibles de un pedido, compartidos entre la página (arma el
   <select>) y la action (valida lo que llega). Viven en su propio archivo
   porque un archivo 'use server' solo puede exportar funciones async.

   Ciclo de vida: pendiente → pagada (la marca el webhook de MP) →
   enviada → entregada. 'cancelada' puede pasar desde cualquier estado.
   ======================================================================== */

export const ORDER_STATUSES = [
    'pendiente',
    'pagada',
    'enviada',
    'entregada',
    'cancelada',
];
