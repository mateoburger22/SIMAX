-- ============================================================================
-- 08-order-status-check.sql
-- Constraint de integridad para orders.status.
--
-- Hasta ahora el invariante "status es uno de estos 5 valores" vivía solo
-- en la app (ORDER_STATUSES en app/admin/pedidos/statuses.js). Con este
-- CHECK, la BASE también lo garantiza: ni el service role ni un UPDATE
-- manual por SQL pueden guardar un estado inventado. Es el mismo principio
-- que RLS: la última línea de defensa está en Postgres, no en el código.
-- ============================================================================

alter table public.orders
    add constraint orders_status_check
    check (status in ('pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'));
