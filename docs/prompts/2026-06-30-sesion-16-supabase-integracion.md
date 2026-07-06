# Sesión 16 — Integración completa con Supabase (DB + Auth + Carrito + Pedidos)

- **Fecha:** 2026-06-30
- **Fase del proyecto:** 5 (Backend con Supabase)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Conectar todo el ecommerce a Supabase: catálogo, autenticación con email/contraseña, carrito persistido en base de datos, flujo de checkout con creación real de órdenes, página de confirmación que lee de la DB y página "mis pedidos". Dejar la app lista para correr 100% sobre datos reales en lugar del array hardcoded en `data/productos.js`.

---

## Decisiones acordadas al inicio

Antes de tocar código, la IA me hizo 3 preguntas para no avanzar a ciegas:

1. **¿Cómo manejar el carrito?** → Persistido en Supabase (tabla `cart_items`), no en localStorage. Implica que solo se puede agregar al carrito con sesión iniciada.
2. **¿Qué método de auth?** → Email + contraseña (lo más simple y defendible en el oral).
3. **¿Cómo genero el `.env.local`?** → La IA saca URL y anon key vía el MCP de Supabase y las escribe directamente al archivo (que está en `.gitignore`).

También se eligió el proyecto Supabase a usar: **CIMAT** (estaba ACTIVO y vacío). El otro proyecto de la cuenta estaba INACTIVO.

---

## Estructura de la sesión: 11 fases con tracking de tareas

La IA armó una task list con las 11 fases al principio para que tanto ella como yo viéramos el progreso. Se completaron una a una.

---

### Fase 1 — Actualizar SQL: agregar `cart_items`

**Qué hizo la IA:**
- Editó `docs/supabase/01-schema.sql` para agregar la tabla `cart_items` (id, user_id, producto_id, quantity, unique(user_id, producto_id)).
- Editó `docs/supabase/02-policies.sql` para agregar las 4 políticas RLS sobre `cart_items` (select/insert/update/delete del propio carrito).
- Agregó el índice `cart_items_user_id_idx`.

**Por qué:**
- El carrito vive en la DB, así que necesitaba su propia tabla. El SQL original solo tenía profiles/productos/orders/order_items.
- `unique(user_id, producto_id)` evita duplicados: agregar el mismo producto dos veces incrementa cantidad en vez de crear otra fila.
- Las 4 políticas son necesarias porque el carrito es estado vivo: el usuario lo lee, agrega, modifica cantidades y borra desde el front.

---

### Fase 2 — Aplicar migraciones en CIMAT vía MCP de Supabase

**Qué hizo la IA:**
- Corrió `apply_migration` con 3 SQL en orden: `01_schema`, `02_policies`, `03_trigger_handle_new_user`.
- Después corrió `get_advisors` para chequear problemas de seguridad.
- El advisor detectó que `handle_new_user()` era llamable desde la API REST (`/rest/v1/rpc/handle_new_user`) por cualquier rol, porque vive en `public` y es `security definer`.
- Aplicó una 4ta migración `04_lock_handle_new_user` con `revoke execute on function public.handle_new_user() from anon, authenticated, public;` y actualizó `docs/supabase/03-trigger.sql` para reflejarlo.

**Por qué:**
- `security definer` corre con permisos del dueño (necesario para que la función inserte en `profiles` cuando un usuario nuevo todavía no tiene permisos). Pero al estar en `public`, Supabase la expone automáticamente vía RPC. Revocar `execute` cierra ese vector. El trigger sigue funcionando porque los triggers NO pasan por la API REST: corren directo en la DB.

**Qué entendí yo:**
- RLS no es magia: protege las TABLAS, pero las FUNCIONES `security definer` viven en otro plano y hay que asegurarlas por separado.
- El advisor de Supabase es básicamente un linter de seguridad. Conviene correrlo después de cualquier migración.

---

### Fase 3 — Seedear los 9 productos

**Qué hizo la IA:**
- Ejecutó un `INSERT ... RETURNING sku, name, price` con los 9 productos del antiguo `data/productos.js`.
- Verificó el resultado: 9 filas insertadas.
- Guardó el SQL en `docs/supabase/04-seed-productos.sql` para que quedara versionado y se pueda re-correr si algún día se truncan las tablas.

**Por qué:**
- Los precios, descripciones, SKUs y categorías ya estaban definidas en código; solo había que pasarlas a la DB.
- Versionar el seed permite reconstruir el estado inicial en otro entorno (otro proyecto Supabase, pruebas, etc.).

---

### Fase 4 — Generar `.env.local`

**Qué hizo la IA:**
- Llamó a `get_project_url` → `https://niqqpjjdekbmzdksexgx.supabase.co`.
- Llamó a `get_publishable_keys` → devolvió la legacy anon key (JWT) + la publishable key nueva.
- Escribió `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (usando la legacy anon JWT que es la que esperan los clientes existentes).
- Verificó que `.env.local` ya estaba en `.gitignore`.

**Por qué:**
- La anon key es pública por diseño: lo que protege los datos es RLS, no esconder esta clave.
- Aun siendo "pública", no la commiteamos porque si se roba se puede usar para spam en signups, etc.

---

### Fase 5 — Migrar catálogo y detalle de producto a Supabase

**Qué hizo la IA:**
- Creó `lib/productos.js` con dos funciones server-side: `getAllProductos()` y `getProductoBySlug(slug)`. Ambas usan `createClient()` de `lib/supabase/server.js`.
- Redujo `data/productos.js`: dejó solo `lineas` (metadata visual de las 3 familias) y `formatPrice` (helper). El array de productos hardcoded se borró.
- Convirtió `app/catalogo/page.js` a `async function Catalogo()` que hace `const productos = await getAllProductos()`.
- Convirtió `app/productos/[id]/page.js`: `generateStaticParams` ahora es `async` y consulta la DB para listar los slugs en build-time; `getProductoBySlug` se llama con `await`.

**Por qué:**
- Separar `data/` (UI metadata) de `lib/productos.js` (data access) es una división defensiva: deja claro qué se carga del código y qué de la DB.
- `generateStaticParams` async significa que en `next build` se hace una query a Supabase para listar los 9 SKUs y pre-renderizar cada ficha como HTML estático. Las páginas se sirven instantáneas en producción.

**Qué entendí yo:**
- Server Components pueden hacer queries directo a la DB en el render. El navegador nunca ve el código de la query — solo el HTML resultante. Es lo que en otros frameworks haríamos con `getServerSideProps`, pero más directo.

---

### Fase 6 — Auth (login + registro + logout)

**Qué hizo la IA:**
- Creó `app/login/page.js` (Server Component shell), `app/login/LoginForm.js` (Client) y `app/login/actions.js` (Server Action).
- Mismo patrón para `app/registro/`: page + RegistroForm + actions.
- Creó `lib/auth/actions.js` con la Server Action `signOut()`.
- Creó `components/AuthMenu.js` (Client Component): lee la sesión con `supabase.auth.getUser()`, se suscribe a `onAuthStateChange`, y muestra "Iniciar sesión" o "Hola, {nombre} [Salir]".
- Lo incluyó en `Header.js`.

**Decisiones de diseño:**
- **Server Action en vez de Route Handler**: el form usa `<form action={loginAction}>`, lo que en Next 16 dispara la action en el servidor. El código de auth no viaja al browser.
- **`useActionState`** en los forms: hook de React 19 que combina el form submit + estado de error + estado pending en una sola línea (`const [state, formAction, isPending] = useActionState(...)`).
- **Mensaje de error genérico en login** ("Credenciales inválidas"): no diferencia entre "email no existe" y "password mal" para no filtrar qué emails están registrados.
- **`AuthMenu` es Client** porque necesita suscribirse a `onAuthStateChange` para refrescarse cuando el usuario hace login/logout en otra pestaña.
- **El botón Salir** dispara un `<form action={signOut}>` (server action) en vez de llamar a `signOut()` desde el cliente. Razón: la action limpia las cookies del servidor, así el primer render después del redirect ya viene sin sesión.

**Por qué:**
- El trigger `handle_new_user` de la fase 1 crea automáticamente la fila en `profiles` con el `full_name` del registro, así que la action solo tiene que llamar `supabase.auth.signUp({email, password, options: {data: {full_name}}})`.

---

### Fase 7 — Migrar CartContext a Supabase

**Qué hizo la IA:**
- Reescribió `context/CartContext.js` para sacar el reducer + localStorage y reemplazarlo por queries a `cart_items`.
- Mantuvo la misma API externa (`items`, `count`, `subtotal`, `addItem`, `changeQty`, `removeItem`, `clearCart`) para no romper los componentes que la consumen (`ProductCard`, `AddToCartBlock`, `CartWidget`, `app/carrito/page.js`).
- Lee el carrito con un JOIN: `cart_items.select('quantity, productos (id, sku, name, price, image)')`. Una sola query trae todo.
- `addItem`: si no hay sesión, hace `router.push('/login')`. Si hay, busca si ya existe la fila → update (suma cantidad) o insert.

**Por qué:**
- Hacer el carrito server-side es lo que pediste explícitamente; el costo es que el usuario tiene que estar logueado para agregar al carrito. La redirección a `/login` es la mejor UX dado eso.
- Mantener la API externa intacta significa que solo este archivo cambió: el resto del carrito (ProductCard, página /carrito, etc.) no se tocó.
- El JOIN entre `cart_items` y `productos` evita un round-trip por item para obtener nombre/precio/imagen.

---

### Fase 8 — Checkout crea `orders` + `order_items`

**Qué hizo la IA:**
- Aplicó la migración `05_orders_shipping` para agregar 6 columnas a `orders` (shipping_full_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_postal_code).
- Creó `app/checkout/actions.js` con la Server Action `placeOrderAction`.
- Convirtió `app/checkout/page.js` a Server Component asíncrono: valida sesión, lee el carrito desde la DB, redirige a /catalogo si está vacío, renderiza el form (`CheckoutForm` Client Component) y el resumen del pedido (Server).
- La action: valida sesión → relee el carrito en el servidor → calcula el total con los precios canónicos de la DB → inserta `orders` → inserta `order_items` → vacía `cart_items` → redirige a `/confirmacion/{id}`.

**Punto crítico de seguridad:**
- La action NUNCA confía en el carrito ni en los precios del cliente. Re-lee `cart_items` con sus joins y calcula el total con `productos.price` actual. Si un usuario edita el HTML del front e intenta confirmar un carrito con precios falsos, la DB ignora eso completamente.
- Los `order_items` se guardan con copia histórica de `sku`, `name`, `price`: si mañana cambia el precio en `productos`, la orden vieja queda con el precio que pagó.

---

### Fase 9 — Confirmación lee la orden real

**Qué hizo la IA:**
- Borró `app/confirmacion/page.js` y `page.module.css` (era una página estática con "Pedido confirmado" hardcoded).
- Creó `app/confirmacion/[id]/page.js` (Server Component dinámico).
- Lee `orders` por id (RLS asegura que solo el dueño ve su orden) y `order_items`. Si la orden no existe o no es del usuario actual → `notFound()`.
- Muestra: número de pedido, fecha, estado, items con cantidades y subtotales, total, dirección de envío. Dos CTAs: "Ver mis pedidos" y "Seguir comprando".

**Por qué:**
- Cambiar a ruta dinámica `/confirmacion/[id]` significa que cada compra tiene su propia URL persistente. El usuario puede volver a verla, compartirla con soporte, etc.
- Usar `notFound()` cuando la orden no es del usuario actual (en vez de un mensaje "no autorizado") no filtra la existencia de IDs ajenos.

---

### Fase 10 — Página "Mis pedidos"

**Qué hizo la IA:**
- Creó `app/cuenta/pedidos/page.js` (Server Component).
- Lista todas las órdenes del usuario logueado ordenadas por fecha descendente.
- Cada fila muestra: número de pedido, fecha, estado (con color: pagada verde, cancelada rojo), total, link al detalle.
- Si no hay órdenes, muestra un CTA "Ir al catálogo".
- Agregó el link "Hola, {nombre}" del `AuthMenu` apuntando a `/cuenta/pedidos`.

**Por qué:**
- El RLS sobre `orders` (auth.uid() = user_id) garantiza que solo aparecen las propias. Igual la query usa `eq('user_id', user.id)` por claridad y como defensa en profundidad.

---

### Fase 11 — Guardar este prompt log

Para documentar todo el proceso para el oral.

---

## Archivos creados

- `lib/productos.js`
- `lib/auth/actions.js`
- `app/login/page.js`, `LoginForm.js`, `actions.js`, `page.module.css`
- `app/registro/page.js`, `RegistroForm.js`, `actions.js`, `page.module.css`
- `app/checkout/actions.js`, `CheckoutForm.js`
- `app/confirmacion/[id]/page.js`, `page.module.css`
- `app/cuenta/pedidos/page.js`, `page.module.css`
- `components/AuthMenu.js`, `AuthMenu.module.css`
- `docs/supabase/04-seed-productos.sql`
- `.env.local` (no se commitea)

## Archivos modificados

- `docs/supabase/01-schema.sql` (agregado `cart_items` + columnas de shipping en `orders`)
- `docs/supabase/02-policies.sql` (agregadas 4 políticas para `cart_items`)
- `docs/supabase/03-trigger.sql` (agregado `revoke execute`)
- `data/productos.js` (solo quedan `lineas` y `formatPrice`)
- `app/catalogo/page.js` (lee de `getAllProductos()`)
- `app/productos/[id]/page.js` (lee de `getProductoBySlug()`)
- `app/checkout/page.js` (server, valida sesión y carrito antes de renderizar)
- `app/checkout/page.module.css` (agregada `.error`)
- `context/CartContext.js` (reescrito para usar Supabase)
- `components/Header.js` (incluye `AuthMenu`)

## Migraciones aplicadas en Supabase

1. `01_schema` — 5 tablas + 3 índices
2. `02_policies` — RLS activado + 13 políticas
3. `03_trigger_handle_new_user` — trigger auto-creación de profile
4. `04_lock_handle_new_user` — revoca execute sobre la función
5. `05_orders_shipping` — 6 columnas de shipping en `orders`

## Estado para el oral

- **Catálogo**: lee 9 productos de Supabase. La página `/catalogo` y cada ficha `/productos/[slug]` se renderizan con datos de la DB.
- **Auth**: `/registro` crea usuario en `auth.users` + el trigger crea `profiles`. `/login` valida con `signInWithPassword`. El botón "Salir" en el Header dispara una Server Action que limpia cookies.
- **Carrito**: agregar requiere sesión (redirige a /login). Cada cambio escribe en `cart_items`. Sobrevive entre dispositivos: si te logueás en otra máquina, ves el mismo carrito.
- **Checkout**: lee el carrito server-side, valida, crea `orders` + `order_items`, vacía el carrito, redirige a la confirmación.
- **Confirmación**: muestra la orden persistente con número, fecha, items y envío. Es una URL real (`/confirmacion/123`) que el usuario puede revisitar.
- **Mis pedidos**: historial del usuario.

## Lo que no se hizo (intencional, para fases futuras)

- **Mercado Pago**: el estado de la orden arranca en `'pendiente'`. La pasarela de pago la wireamos en una sesión próxima.
- **Confirmación de email en signup**: por simplicidad usamos el default de Supabase (auto-confirma). Si el oral lo pide, se activa en el dashboard.
- **Recuperar contraseña**: pendiente.
- **Edición de perfil**: pendiente.
