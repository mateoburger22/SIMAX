-- ============================================================================
-- 05-mp-columns.sql  ·  Columnas de Mercado Pago en `orders`
-- ----------------------------------------------------------------------------
-- Agrega dos referencias que devuelve Mercado Pago cuando integramos
-- Checkout Pro:
--
--   · mp_preference_id -> id de la "preferencia" (el pedido de pago que
--     creamos ANTES de mandar al usuario a pagar). Nos sirve para rastrear
--     qué intento de pago corresponde a esta orden.
--   · mp_payment_id    -> id del PAGO concreto una vez que MP lo aprueba.
--     Lo guardamos cuando la orden pasa a 'pagada' (comprobante contra MP).
--
-- Ambas son `text` y aceptan null: una orden recién creada todavía no tiene
-- pago aprobado.
-- ============================================================================

alter table public.orders
    add column if not exists mp_preference_id text,
    add column if not exists mp_payment_id    text;
