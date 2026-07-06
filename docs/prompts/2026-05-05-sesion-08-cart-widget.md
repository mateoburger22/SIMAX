# Sesión 08 — Widget de carrito (dropdown)

- **Fecha:** 2026-05-05
- **Fase del proyecto:** 1 (HTML + CSS)
- **Herramienta de IA:** Claude Code (modelo Sonnet 4.6)

## Objetivo de la sesión

Agregar un widget de carrito desplegable (dropdown) en el header, visible en todas las páginas, sin JavaScript.

---

## Prompts y resultados

### Prompt 1
> "Vamos a hacer algo. Hacè tambièn un carrito que se mantenga entre todas las pàginas. Tiene que ser como un widget de carrito, tipo desplegable que salga en el lateral derecho, o chiquito al lado del botòn, y despuès dejar la pàgina del carrito que hiciste recièn. Si tenes preguntas sobre mis instrucciones hacemelas antes de programar"

La IA hizo tres preguntas antes de programar:
1. ¿Dónde sale el widget? → **Dropdown chico al lado del botón.**
2. ¿Uso JavaScript? → **No, solo HTML/CSS por ahora.**
3. ¿El botón "Agregar" suma al widget? → **Sí, pero más tarde con JS.**

**Qué hizo la IA:**

1. **Modificó `index.html`, `catalogo.html` y `carrito.html`**: reemplazó el `<a class="cart-link">` en el header por un `<details class="cart-widget">`. Dentro:
   - `<summary class="cart-link">`: el botón toggle que hereda el estilo del link original, con un badge amarillo que muestra la cantidad de ítems (3).
   - `<div class="cart-dropdown">`: el panel desplegable con dos ítems de ejemplo (Repair Wrap ×2 y PTFE Industrial ×1), un total y un botón "Ver carrito completo" que lleva a `carrito.html`.

2. **Agregó a `css/components.css`** los estilos del widget:
   - `.cart-widget`: `position: relative` para que el dropdown se posicione respecto al botón; `flex-shrink: 0` para que no se comprima en el flex del header.
   - `.cart-widget > summary`: `display: inline-block`, sin el marcador por defecto de `<details>` (`::-webkit-details-marker` oculto).
   - `.cart-badge`: píldora amarilla circular con el número de ítems, posicionada verticalmente con `vertical-align: middle`.
   - `.cart-dropdown`: `position: absolute; top: calc(100% + ...); right: 0` para que aparezca justo debajo del botón alineado a la derecha. Borde amarillo arriba, sombra y z-index alto.
   - Ítems del dropdown (visual 48px, nombre, cantidad×precio) y fila de total con tipografía display grande.

**Por qué:**
- Se usó `<details>`/`<summary>` en vez de un checkbox hack o JavaScript porque es el único elemento HTML nativo que implementa un toggle sin JS. El navegador maneja el estado abierto/cerrado solo con el atributo `[open]`.
- `position: absolute` en el dropdown con `position: relative` en el padre es el patrón clásico para un menú desplegable: el dropdown sale del flujo normal del documento y se posiciona relativo a su contenedor.
- `right: 0` alinea el borde derecho del dropdown con el borde derecho del botón, para que no se salga del viewport.
- El badge usa `border-radius: 999px` (pastilla) en vez de `50%` porque si el número tiene 2 dígitos (ej. "12"), `50%` lo deformaría.
- `flex-shrink: 0` en `.cart-widget` evita que el `<details>` se comprima cuando el header queda apretado en pantallas medianas.

**Qué entendí yo:**
- `<details>` y `<summary>` son elementos HTML nativos para toggles: sin JS, sin hacks. El navegador agrega y quita el atributo `open` automáticamente al hacer click.
- Para posicionar un dropdown: `position: relative` en el padre + `position: absolute` en el hijo. El hijo sale del flujo pero se posiciona respecto al padre, no al viewport.
- El mismo elemento `<details>` funciona en las tres páginas porque es HTML puro. Cuando agreguemos JS en Fase 2, solo vamos a tener que interceptar el evento de click para agregar comportamiento extra (como actualizar el contenido dinámicamente).
- La diferencia entre `border-radius: 50%` (círculo perfecto) y `border-radius: 999px` (pastilla): el segundo se adapta al contenido y no se deforma.

---

## Conclusión de la sesión

**Listo:**
- Widget de carrito con dropdown en las tres páginas (`index.html`, `catalogo.html`, `carrito.html`).
- Badge con cantidad de ítems en el botón del header.
- Dropdown con ítems estáticos de ejemplo, total y link a `carrito.html`.

**Pendiente para la próxima:**
- JS (Fase 2): hacer que los botones "Agregar" del catálogo sumen ítems al widget y actualicen el badge.
- JS (Fase 2): sincronizar el estado del carrito entre páginas con `localStorage`.
- Cerrar el dropdown al hacer click fuera de él (requiere JS).