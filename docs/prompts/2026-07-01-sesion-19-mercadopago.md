# Sesión 19 — Integración de Mercado Pago (Checkout Pro + webhook)

- **Fecha:** 2026-07-01
- **Fase del proyecto:** 5/6 (Backend + producción)
- **Herramienta de IA:** Claude Code (modelo Opus 4.8, 1M contexto)

## Objetivo

Integrar pagos reales con Mercado Pago (Checkout Pro por redirect + webhook) en
el checkout, de modo que una orden pase de `pendiente` a `pagada` cuando el pago
se aprueba. Probar todo en el entorno de PRUEBA (sandbox) de MP.

---

## Qué se construyó

- **Migración SQL** `docs/supabase/05-mp-columns.sql`: columnas
  `mp_preference_id` y `mp_payment_id` en `orders` (aplicada por MCP).
- **`lib/mercadopago.js`**: cliente del SDK oficial `mercadopago` con el
  `MP_ACCESS_TOKEN` (secreto, server-only).
- **`lib/supabase/admin.js`**: cliente con la `service_role` key. Saltea RLS.
  Necesario porque el webhook llega SIN sesión de usuario y `orders` no tiene
  política de UPDATE (a propósito: el estado del pedido no lo cambia el cliente).
- **`app/checkout/actions.js`**: tras crear la orden `pendiente` + items, crea la
  preferencia en MP (`external_reference` = id de la orden) y redirige al pago.
  **No vacía el carrito** (eso pasa al aprobarse el pago).
- **`app/api/mp/webhook/route.js`**: recibe la notificación de MP, **consulta el
  pago real contra la API** (fuente de verdad, no confía en el payload), y si
  está `approved` marca la orden `pagada` + guarda `mp_payment_id` + vacía el
  carrito. Idempotente con `.eq('status','pendiente')`.
- **`app/confirmacion/[id]/page.js`**: respaldo por redirect (verifica el pago si
  el webhook tarda) + encabezado según el estado real (`pagada` vs `pendiente`).

## Decisiones para el oral

- **Nunca confiar en el payload del webhook / query params**: siempre re-consultar
  el pago a la API de MP con el Access Token. Aunque alguien falsee una
  notificación, no puede marcar nada como pagado.
- **Total recalculado en el server** (ya venía de antes): los precios y cantidades
  se re-leen de la DB, no se confía en el form.
- **Credenciales en variables de entorno** (MP + service role), nunca en el repo.
  Pasar a producción = cambiar el par de credenciales de MP, sin tocar código.

## El calvario del entorno de prueba de MP (por qué dimos mil vueltas)

No fue un bug del código: fueron **capas apiladas de config del sandbox de MP**:

1. **Credencial de producción en vez de prueba.** Peor aún: en el modelo nuevo de
   MP, el token de prueba y el de producción **empiezan igual (`APP_USR-`)**.
   Se diagnosticó con la API `/users/me` (el token de prueba tiene el tag
   `test_user`).
2. **Mezcla prueba/real** → "Una de las partes con la que intentás pagar es de
   prueba". Vendedor y comprador tienen que ser AMBOS de prueba.
3. **Pago como invitado no se concreta** en test: MP quiere comprador logueado.
4. **`sandbox_init_point` (sandbox.mercadopago.com.ar) está deprecado** y hace
   `ERR_TOO_MANY_REDIRECTS`. El correcto es `init_point` (www.mercadopago.com.ar);
   la "prueba" la dan las credenciales, no el subdominio.
5. **Desfasaje final:** quedó la env var `MP_USE_SANDBOX=true` puesta en Vercel +
   Vercel deployando un **commit viejo** → forzaba el sandbox roto una y otra vez.
   Se borró la variable y se deployó el commit correcto (`ebd7560`).

**Receta que funciona:** checkout `www.mercadopago.com.ar` + **vendedor de prueba**
(token de un test_user) + **comprador de prueba logueado** + tarjeta test titular
`APRO`. Herramientas de diagnóstico usadas: `/users/me`, `/v1/payments/search` y
`/merchant_orders/search` de la API de MP (mostraban que las preferencias se
creaban pero ningún pago se concretaba → el problema estaba en el entorno, no en
el código).

## Resultado

- Pago de prueba **aprobado**. Orden #17 → `status: pagada`,
  `mp_payment_id: 165900013081`, carrito vaciado. Webhook funcionando en prod.

## Pendiente

- (Opcional) limpiar las órdenes `pendiente` de prueba (12–16) en la DB.
- Producción real: cambiar `MP_ACCESS_TOKEN`/`NEXT_PUBLIC_MP_PUBLIC_KEY` a las
  credenciales de producción y completar la activación que pide MP.
- `NEXT_PUBLIC_MP_PUBLIC_KEY` local es de producción y no coincide con el token de
  prueba; Checkout Pro no la usa, pero conviene alinearla si algún día se usa
  client-side (Bricks).
