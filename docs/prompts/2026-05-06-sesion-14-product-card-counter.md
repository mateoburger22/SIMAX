# Sesión 14 — Layout nuevo de ProductCard + contador para agregar varias unidades

- **Fecha:** 2026-05-06
- **Fase del proyecto:** 3 (React)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Cambiar el layout de los botones de la card de producto: "Ver detalle" full-width arriba, "Agregar" + contador (− N +) abajo. El botón "Agregar" suma N unidades de una vez al carrito en vez de sumar de a 1. Quitar bordes, elegir estética limpia.

---

## Prompts y resultados

### Prompt 1
> "[foto del layout deseado] quiero que en la parte de productos hagas este cambio en el placement de los botones y agregues la funcionalidad de poder agregar mas de 1 a la vez con el contador. (...) no me gustan los bordes. elegi la estetica."

Antes de programar, la IA hizo dos preguntas sobre la lógica:
1. ¿Contador arranca en 0 o 1? → **1.**
2. ¿Después de "Agregar", se resetea o se mantiene? → **Se resetea.**
3. (Aclaración del usuario) Si agregás N, en el carrito tienen que figurar N.

**Qué hizo la IA:**

1. **Modificó `src/context/CartContext.jsx`**:
   - El reducer ahora recibe `{ product, qty }` en el payload del `ADD` (antes solo recibía `product` y siempre sumaba 1).
   - La acción expuesta `addItem(product, qty = 1)` acepta una cantidad opcional con default 1 (mantiene compatibilidad si en el futuro alguien la llama sin segundo argumento).
   - Si el item ya existe, suma `qty` al stock actual; si no existe, lo crea con `qty` desde el inicio.

2. **Reescribió `src/components/ProductCard.jsx`**:
   - Agregó dos `useState` locales: `qty` (cantidad a agregar, arranca en 1) y `added` (flag de feedback visual).
   - Funciones `dec()` e `inc()` que modifican `qty`, con piso de 1 (no permite bajar a 0 porque "agregar 0" no tiene sentido).
   - `handleAdd()` llama `addItem(product, qty)`, marca `added = true`, **resetea el contador a 1** y limpia el flag a los 900ms.
   - Layout JSX nuevo: `<Link>Ver detalle</Link>` arriba, abajo un `<div>` con grid de 2 columnas (`1fr auto`) donde van `<button>Agregar</button>` y el contador `− N +`.

3. **Reescribió `src/components/ProductCard.module.css`**:
   - `.actions`: ahora es `flex-direction: column` (stack vertical) en vez de fila.
   - `.detail`: el "Ver detalle" ocupa el 100% del ancho.
   - `.addRow`: grid `1fr auto` para que "Agregar" se estire y el contador ocupe lo justo.
   - `.addBtn`: **fondo negro sólido + texto blanco, sin borde**. Hover: invierte a fondo amarillo + texto negro. Disabled (durante "Agregado ✓"): gris-700 con texto gris-300.
   - `.qty` (contenedor del contador): **fondo gris-100, sin bordes**. Solo separación visual por color de fondo.
   - `.qtyBtn` (los `−` y `+`): texto gris-700, hover a negro.
   - `.qtyValue` (el número): tipografía display (Barlow Condensed) en negro, peso 700.

**Por qué (decisiones técnicas):**

- **Estado del contador en el componente, no en el carrito**: la cantidad que el usuario está por agregar es estado **local** del ProductCard — no tiene sentido que viva en el carrito global. Solo cuando aprieta "Agregar" eso se traduce en una acción al carrito. Esto es una distinción clave en React: estado local (useState) para cosas efímeras, estado global (Context) para cosas que comparten varios componentes.
- **Por qué `qty = 1` con default en `addItem`**: si alguien en el futuro llama `addItem(producto)` sin segundo argumento (por ejemplo desde otro lugar del código), sigue funcionando como antes. Es una práctica defensiva común en JS — los parámetros opcionales con default son mejor que romper la API.
- **Reset a 1 después de agregar**: si te quedaste en "Agregar 5" y querés agregar otra cosa, lo más probable es que quieras 1, no 5. Forzar el reset evita el error de "agregué 5 sin querer" en el siguiente producto. (Igualmente el reset es por card, no global, porque cada card tiene su propio `useState`.)
- **`Math.max(1, q - 1)` en `dec`**: valida el mínimo dentro de la función en vez de deshabilitar el botón. Si en el futuro queremos cambiar el mínimo a 0 (para "remover todo"), es una sola línea.
- **Estética sin bordes**: usé fondos sólidos en vez de bordes para diferenciar elementos. Negro sólido para "Agregar" porque es la acción primaria del row (jerarquía visual fuerte), gris-100 para el contador porque es un control secundario. Resultado: las dos zonas se distinguen sin dibujar líneas.
- **Botón negro con hover amarillo**: refleja el hover del `.btn-primary` global (que es amarillo por default y al hover pasa a negro), pero invertido. Da consistencia con el sistema de botones del resto del sitio sin ser idéntico.
- **`grid-template-columns: 1fr auto`**: el `1fr` hace que "Agregar" tome todo el espacio disponible; `auto` hace que el contador tome solo lo que necesita su contenido. Si en una card el texto es más largo, el contador no se deforma.
- **`aria-live="polite"` en el `<span>` del número**: cuando un lector de pantalla detecta que cambia el número, lo anuncia sin interrumpir lo que esté leyendo. Útil para usuarios con discapacidad visual que están usando los `−`/`+`.

**Qué entendí yo:**
- React permite tener estado "por instancia" — cada ProductCard tiene su propio `qty` y su propio `added` aunque sean el mismo componente. El estado vive adentro de la función cuando React la llama, no afuera.
- El estado local (`useState`) es para cosas que no necesitan compartirse: filtros, controles de un formulario, cantidad pre-cart. El estado global (`Context`) es para cosas que múltiples componentes leen: el carrito, la sesión del usuario, el tema visual.
- Los parámetros con default (`qty = 1`) son la versión limpia de chequear `if (qty === undefined)`. Funciona igual y se lee mejor.
- "Sin bordes" no significa "sin separación visual" — se puede separar con color de fondo, espaciado, o agrupación. A veces queda más limpio que dibujar líneas.

---

## Conclusión de la sesión

**Listo:**
- Layout nuevo: "Ver detalle" full-width arriba, "Agregar" + contador en una fila debajo.
- Contador funcional con piso en 1 que se resetea después de agregar.
- `addItem` acepta una cantidad y suma esa cantidad al carrito (figura tal cual en el dropdown y en el carrito completo).
- Estética sin bordes: contraste por fondos (negro sólido para Agregar, gris claro para el contador).

**Pendiente para la próxima:**
- Probar en mobile que el grid del addRow no se desborde si el texto del botón Agregar se vuelve muy largo (caso "Agregado ✓").
- Eventualmente: agregar un input numérico opcional para escribir directamente la cantidad sin tener que clickear `+` muchas veces.