# Sesión 21 — Panel de administración (rol admin + RLS + CRUD + pedidos)

- **Fecha:** 2026-07-02
- **Fase del proyecto:** 5/6 (Backend) — cierra la condición de la materia:
  BD modelada, CRUD completo, persistencia y admin funcional
- **Herramienta de IA:** Claude Code (modelo Fable 5)

## Objetivo de la sesión

Crear un panel de admin completo: rol de administrador en la base, políticas
RLS nuevas, ABM de productos y gestión de estados de pedidos en `/admin`.

---

## Prompts y resultados

### Prompt 1
> necesito ahora crear un panel de admin, como es el proceso? → Armalo, que
> este bien hecho. BD modelada, CRUD completo, persistencia y admin funcional.

**Qué hizo la IA:**

*Base de datos* (`docs/supabase/06-admin-role.sql`, aplicado vía MCP):
- Columna `role` en `profiles` (`'user'` default, `check` que solo admite
  `'user' | 'admin'`). Mi usuario quedó marcado como admin a mano.
- Función `is_admin()` (`security definer`, `stable`): las políticas de
  otras tablas preguntan "¿el que consulta es admin?" sin recursión de RLS.
- 7 políticas nuevas: admin escribe `productos` (insert/update/delete),
  ve y actualiza TODAS las `orders`, ve todos los `order_items` y `profiles`.
  Son permisivas: se suman con OR a las existentes (el usuario común sigue
  viendo solo lo suyo).
- Trigger `protect_profiles_role`: un usuario común no puede auto-ascenderse
  con un UPDATE a su propia fila (RLS decide qué FILAS tocás; el trigger,
  qué COLUMNAS).

*Código:*
- `lib/adminAuth.js` → `getAdminContext()`: lee sesión + rol desde
  `profiles` en cada petición (el rol NO viaja en el JWT: revocarlo pega
  al instante).
- `app/admin/layout.js`: guarda de TODO `/admin/*` — sin sesión → `/login`,
  sin rol → `/`. `AdminNav.js` (client, solapas con `usePathname`).
- `app/admin/page.js`: resumen (productos, pedidos, pendientes, ingresos).
- `app/admin/productos/`: tabla (listar) + `nuevo/` (crear) + `[id]/`
  (editar) + botón eliminar con `confirm()`. `ProductForm.js` compartido
  entre alta y edición: la página server le pasa la action por prop
  (`updateProductoAction.bind(null, id)` fija el id fuera del form).
- `app/admin/productos/actions.js`: 3 Server Actions con el mismo esquema:
  ¿es admin? → validar en servidor → escribir con la SESIÓN del admin
  (pasa por RLS) → `revalidatePath()` de `/catalogo` y las fichas.
- `app/admin/pedidos/`: todos los pedidos (comprador, items, ref de pago MP)
  + form por fila para cambiar estado (`pendiente → pagada → enviada →
  entregada`, `cancelada`). Sin JS de cliente: `<form>` + Server Action.
- `components/AuthMenu.js`: link "Admin" en el header, solo si el perfil
  tiene rol admin (es solo UI; el server re-valida igual).

**Por qué:**
- **Seguridad en dos capas**: el layout redirige (UX), pero la que manda es
  RLS — aunque alguien invoque la API con su sesión, Postgres rechaza la
  escritura si `is_admin()` da false. Las actions escriben con el cliente
  de SESIÓN (no la service key) justamente para que RLS sea quien autoriza.
- **`revalidatePath` es obligatorio acá**: `/catalogo` y `/productos/[id]`
  se pre-renderizan estáticas en el build (`○`/`●` en el build output);
  sin invalidarlas, el público vería el catálogo viejo hasta el próximo
  deploy. Al editar un SKU se invalidan la ficha vieja Y la nueva.
- **Borrar productos no rompe pedidos**: `order_items` guarda copia de
  sku/name/price y su FK es `on delete set null` (decisión de la sesión 16
  que recién ahora paga).

**Problemas encontrados / cómo se resolvieron:**
- El trigger anti auto-ascenso bloqueó también al SQL Editor de Supabase
  (no tiene `auth.uid()`). Fix: si `auth.uid()` es null es una conexión
  privilegiada que de todas formas saltea RLS → se permite.
- `npm run lint` marcó `setState` síncrono en el `useEffect` nuevo de
  AuthMenu → se movió al `.then()` de la query con flag `cancelled` para
  descartar respuestas viejas si cambia el usuario.
- Advisors de Supabase: WARN porque `is_admin()` es invocable vía
  `/rest/v1/rpc` por cualquiera. Aceptado a propósito: devuelve un booleano
  sobre el PROPIO usuario (anónimo → false), no filtra datos, y revocarle
  EXECUTE a `authenticated` rompería las políticas que la usan.

**Qué entendí yo:**
- RLS con roles: las políticas son permisivas (OR), así que "admin ve todas"
  convive con "cada uno ve las suyas" sin tocar el código de las queries —
  la MISMA query de `/cuenta/pedidos` en `/admin/pedidos` devuelve todo
  porque cambia quién pregunta, no qué se pregunta.
- `security definer` en `is_admin()` evita la recursión: una política de
  `profiles` que consulta `profiles` se llamaría a sí misma en loop.
- `.bind(null, id)` en una Server Action "precarga" argumentos del lado
  del server: el id no viaja como input editable del form.

**Verificación (supervisión del código generado):**
- `npm run build` ✓ (todas las rutas `/admin/*` dinámicas; catálogo sigue
  estático) y `npm run lint` ✓ (solo quedan 2 errores preexistentes de
  Header/CartWidget, anteriores a esta sesión).
- Matriz RLS probada en Postgres simulando JWTs reales:
  admin → ve 3 pedidos y 2 perfiles, puede editar productos y estados;
  usuario común → ve solo lo suyo, INSERT en productos rechazado (42501),
  auto-ascenso de rol rechazado por el trigger.
- `curl` anónimo a `/admin`, `/admin/productos`, `/admin/pedidos` →
  307 a `/login` en los tres casos.

---

## Conclusión de la sesión

- Listo: rol admin en la BD con RLS + trigger anti-escalación, panel
  `/admin` con resumen, CRUD completo de productos (con revalidación del
  catálogo estático) y gestión de estados de pedidos. Link "Admin" en el
  header solo para admins.
- Pendiente: probarlo logueado en el navegador (yo verifiqué build, RLS y
  redirects; falta el click-through visual), commitear, y correr
  `docs/supabase/06-admin-role.sql` quedó ya aplicado en el proyecto CIMAT
  (no hace falta re-correrlo). En Vercel no hay env vars nuevas.
