# Sesión 09 — JS del carrito + checkout

- **Fecha:** 2026-05-05
- **Fase del proyecto:** 2 (JavaScript)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Convertir el carrito en una funcionalidad real con JavaScript: estado persistente entre páginas con `localStorage`, agregar/quitar/modificar cantidades, render dinámico del widget y de la página del carrito, y crear las páginas de checkout y confirmación de pedido.

---

## Prompts y resultados

### Prompt 1
> "Vamos con todo el js. Que el carrito desplegable no se mantenga abierto entre pagina y pagina porfavor. Agregale a todo funcionalidad con js, explicamelo tambien."

Antes de programar, la IA hizo cuatro preguntas:
1. ¿Qué hace "Iniciar compra"? → **Redirige a una página de checkout (que también hay que crear).**
2. ¿Carrito vacío qué muestra? → **Mensaje "Tu carrito está vacío".**
3. ¿Qué campos tiene el checkout? → **Nombre, email, teléfono, dirección, ciudad, código postal.**
4. ¿Qué pasa al enviar el form? → **Redirige a `confirmacion.html` con solo el mensaje "Pedido confirmado".**

**Qué hizo la IA:**

1. **Creó `js/cart.js`** — un único archivo que se carga en todas las páginas (con `defer` para que no bloquee el render). Contiene:
   - **Estado**: funciones `readCart()` y `writeCart()` que leen/escriben un array de items en `localStorage` bajo la clave `cimat-cart-v1`. La clave incluye `v1` para que en el futuro se pueda versionar la estructura sin romper datos viejos.
   - **Operaciones**: `addItem(producto)` (suma cantidad si ya existe el SKU, lo agrega si no), `changeQty(sku, delta)` (suma o resta una unidad y elimina el item si llega a 0), `removeItem(sku)`, `clearCart()` y `totals()` (calcula cantidad total y subtotal).
   - **Render del widget**: lee el carrito y vuelve a generar el HTML del dropdown del header. Si está vacío muestra "Tu carrito está vacío" + link al catálogo. El badge se oculta cuando no hay items.
   - **Render del carrito** (`carrito.html`): genera dinámicamente la lista de ítems con sus controles `−/+` y "Eliminar", el resumen lateral y los totales. Si el carrito está vacío muestra el estado vacío con link al catálogo.
   - **Render del resumen del checkout**: en `checkout.html`, llena el `<aside>` con la lista de productos y el total. Si alguien entra al checkout con el carrito vacío, lo redirige al catálogo.
   - **Botones "Agregar"** del catálogo: usa **delegación de eventos** (un único listener en `document` que detecta clicks en cualquier `[data-add-to-cart]`). Lee el SKU, nombre y precio de los `data-*` del botón, agrega el item, y muestra feedback visual ("Agregado ✓" por 900ms).
   - **Cerrar el dropdown al hacer click afuera**: listener en `document` que cierra el `<details>` si el click no está dentro del widget. También cierra con la tecla **Escape**.
   - **Form del checkout**: intercepta el submit, limpia el carrito con `clearCart()` y redirige a `confirmacion.html`.
   - **Sincronización entre pestañas**: escucha el evento `storage` del navegador (que se dispara cuando OTRA pestaña modifica `localStorage`) y re-renderiza el widget. Así si abrís el sitio en dos pestañas, las dos se mantienen sincronizadas.
   - **Evento custom `cart:change`**: cuando el carrito cambia, dispara este evento para que cualquier componente abierto en la misma pestaña re-renderice.

2. **Modificó `index.html`, `catalogo.html`, `carrito.html`** y agregó `<script src="js/cart.js" defer>` en todos.

3. **Modificó `catalogo.html`**: agregó `data-add-to-cart`, `data-sku`, `data-name`, `data-price` a los 12 botones "Agregar".

4. **Vació el contenido hardcodeado** del dropdown del widget y del `cart-layout` de `carrito.html`. Ahora el HTML solo tiene el contenedor — el JS pinta todo dentro.

5. **Creó `checkout.html`** con un `<form>` de dos `<fieldset>` (datos personales / dirección) y un `<aside>` para el resumen. Usa los atributos `autocomplete` correctos (`name`, `email`, `tel`, `street-address`, `address-level2`, `postal-code`) para que el navegador autocomplete los campos.

6. **Creó `confirmacion.html`** simple: solo el header, footer y un mensaje "Pedido confirmado" centrado.

7. **Agregó al CSS**: estilos para el estado vacío (dropdown y página), formulario del checkout (`fieldset`, `legend`, inputs con foco amarillo, validación nativa con `:user-invalid`), resumen lateral del checkout y la página de confirmación.

**Por qué (decisiones técnicas para el oral):**

- **`localStorage` vs `sessionStorage`**: usé `localStorage` porque el carrito tiene que persistir aunque cierres y abras el navegador. `sessionStorage` se borra al cerrar la pestaña, lo cual no sirve para un carrito real.
- **Delegación de eventos**: en vez de poner un listener por cada botón "Agregar" (12 listeners), uso un solo listener en `document` que filtra con `e.target.closest('[data-add-to-cart]')`. Es más eficiente y funciona también con elementos que se generen dinámicamente después.
- **Re-render completo vs DOM patching**: cada vez que el carrito cambia, vuelvo a generar todo el HTML del widget y del `cart-layout`. Para un carrito chico es más simple y predecible que tratar de actualizar nodos individuales. En frameworks como React esto se hace automáticamente con virtual DOM; acá lo hacemos a mano.
- **`<details>` cerrado entre páginas**: cuando navegás de una página a otra, el navegador carga un HTML nuevo donde el `<details>` no tiene el atributo `open` → arranca cerrado. Por eso no hay que hacer nada especial para que cumpla el requisito de "no mantenerse abierto entre páginas".
- **IIFE + `'use strict'`**: el código está envuelto en una función auto-ejecutada `(function(){...})()` para no contaminar el scope global con variables. Es el patrón clásico antes de los módulos ES6.
- **`defer`**: en el `<script>`, el atributo `defer` hace que el JS se descargue en paralelo al parsing del HTML pero se ejecute después de que el DOM esté listo. Por eso no hace falta envolver todo en `DOMContentLoaded` (igual lo hago como red de seguridad).
- **`window.replace()` en checkout vacío**: si entrás a `checkout.html` sin items, te mando al catálogo con `window.location.replace()` (no con `.href = ...`) para que el checkout no quede en el historial del navegador.
- **`data-*` attributes**: son la forma estándar de adjuntar datos arbitrarios a un elemento HTML. Se acceden desde JS con `element.dataset.nombre`. Mucho más limpio que parsear clases o IDs.
- **Eventos `storage` y `cart:change`**: el primero es nativo del navegador y dispara cuando OTRA pestaña modifica `localStorage`. El segundo es un evento custom que disparo yo mismo cuando llamo a `writeCart()`, para mantener sincronizada la pestaña actual sin tener que llamar a render manualmente desde cada función.

**Qué entendí yo:**
- El estado del carrito no vive en el HTML: vive en `localStorage`. El HTML es solo una "vista" que se regenera cada vez que el estado cambia. Esto es exactamente lo que después hacen frameworks como React pero a mano.
- La delegación de eventos es clave para no llenar el código de `addEventListener` repetidos. Un solo listener arriba puede manejar toda una sección.
- El patrón "leer estado → renderizar HTML → escuchar eventos → actualizar estado → re-renderizar" es el ciclo básico de cualquier app interactiva.
- Hay diferencia entre `location.href = "..."` (queda en historial) y `location.replace(...)` (no queda) — útil saber para no romper el botón "atrás" del navegador.

---

## Conclusión de la sesión

**Listo:**
- Carrito real y persistente entre páginas con `localStorage`.
- Botones "Agregar" del catálogo funcionando con feedback visual.
- Widget desplegable se cierra entre páginas, al hacer click afuera y con Escape.
- Página `carrito.html` con `+/−/Eliminar` funcionando en vivo.
- Página `checkout.html` con formulario validado y resumen lateral.
- Página `confirmacion.html` con el mensaje del pedido.
- Sincronización entre pestañas (si abrís dos, las dos se actualizan).

**Pendiente para la próxima:**
- `producto.html` (ficha individual de cada producto).
- `contacto.html`.
- En Fase 5 (Backend): conectar el form de checkout con Mercado Pago en vez de la simulación actual.
- Pensar el menú hamburguesa para mobile.