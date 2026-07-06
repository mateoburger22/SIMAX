# Sesión 05 — Catálogo de productos

- **Fecha:** 2026-04-29
- **Fase del proyecto:** 1 (HTML + CSS)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Construir la página `catalogo.html` reusando el header, footer y los estilos existentes, con un grid de productos organizado por línea técnica.

---

## Prompts y resultados

### Prompt 1
> "Hagamos el html del catalogo"

**Qué hizo la IA:**

1. **Creó `catalogo.html`** con la siguiente estructura:
   - Mismo `<header>` y `<footer>` que el home (con `aria-current="page"` en "Catálogo").
   - **Page header** (intro de página interna): breadcrumb (`Inicio > Catálogo`), eyebrow, h1 y un párrafo lead.
   - **Filtro de categorías** (`<nav class="category-filter">`) con 4 anchor links que saltan a las secciones (#reparacion, #aislacion, #sellado, #alta-temperatura). Sticky bajo el header.
   - **Cuatro `<section>` de productos**, una por línea técnica, con tres productos cada una (12 productos en total, ficticios pero realistas para CIMAT).
   - **CTA** al final, similar al del home pero con copy distinto ("¿No estás seguro de qué cinta usar?").

2. **Estructura de cada `<article class="product-card">`:**
   - Visual placeholder (sin imagen real todavía): bloque gris con franjas amarillas a 135° y la palabra "CIMAT" en gris suave centrada. Fácil de reemplazar por una `<img>` cuando haya fotos de producto.
   - SKU (estilo etiqueta industrial, p.ej. `CIMAT-RW-050`).
   - Título del producto.
   - Descripción técnica corta con números/specs en negrita.
   - Precio.
   - Dos acciones: "Ver detalle" (link a `producto.html`) y "Agregar" (botón sin lógica todavía).

3. **Agregó al final de `css/components.css`** (sin tocar nada existente) los siguientes bloques:
   - `.page-header`, `.page-header-inner`, `.page-lead` — intro de página interna.
   - `.breadcrumb` — lista ordenada con separadores `/` generados con `::before`.
   - `.category-filter` — `position: sticky; top: var(--header-height)` para que se quede pegado bajo el header al hacer scroll. Con `overflow-x: auto` y scrollbar oculto para que en mobile pueda scrollear horizontal si las 4 categorías no entran.
   - `.product-section` con `scroll-margin-top` para que cuando se navega por anchor, el header sticky + el filtro sticky no tapen el título de la sección.
   - `.product-section--alt` (variante con fondo gris) para alternar secciones y dar ritmo visual.
   - `.product-grid` — grid mobile-first: 1 col → 2 cols (640px) → 3 cols (1000px).
   - `.product-card` — flexbox vertical, hover con `translateY(-4px)` y sombra. `aspect-ratio: 4 / 3` para que el visual placeholder mantenga proporciones consistentes en todas las cards.
   - `.btn-outline` — variante oscura del botón outline (la usé en las cards y antes no existía).

**Por qué:**
- Reusar header/footer/variables/utilidades demuestra **separación de responsabilidades**: una sola fuente de verdad para los componentes globales. Si en el futuro cambio el color de marca, se actualiza en todas las páginas.
- Sticky filter under sticky header es un patrón clásico de e-commerce. En CSS puro se logra con `position: sticky` + `top` calculado desde la variable `--header-height`.
- `aspect-ratio` evita el "salto de layout" cuando las imágenes/placeholders tienen proporciones distintas: la card siempre reserva el mismo espacio visual.
- Anchor navigation (`href="#reparacion"`) + `scroll-margin-top` permite navegar suavemente entre categorías sin necesidad de JS. Va con `scroll-behavior: smooth` que ya teníamos en el reset.

**Conceptos técnicos involucrados (relevantes para el oral):**
- **HTML semántico**: `<nav>` para breadcrumb y filter, `<section aria-labelledby="...">` por categoría, `<article>` por producto, `<ol>` para breadcrumb (orden importa), `<ul>` para grid de productos.
- **CSS Grid mobile-first**: `grid-template-columns: 1fr` por default, agregando columnas con `@media (min-width: ...)`.
- **`position: sticky`**: combinación de relative + fixed. El elemento se comporta normal hasta que llega al `top` definido, ahí se "pega".
- **`aspect-ratio`** propiedad nueva de CSS que mantiene proporciones de un elemento sin tener que hacer trucos con padding-bottom.
- **`scroll-margin-top`**: define cuánto espacio dejar arriba del elemento cuando se hace anchor scroll. Soluciona el clásico problema de "el header sticky tapa el título al hacer click en un anchor".
- **`::before` content** generado por CSS para los separadores `/` del breadcrumb (no hay que escribirlos en el HTML).
- **Custom properties** (`var(--color-...)`, `var(--space-...)`) reutilizadas → consistencia automática con el home.

**Productos generados (ficticios, sirven como muestra hasta tener catálogo real):**
- Línea 01 — Reparación con fibra de vidrio: Repair Wrap 50/75/100 mm.
- Línea 02 — Aislación eléctrica: PVC Premium, Auto-Fundente, Color Pack.
- Línea 03 — Sellado de tuberías: Sellador Hidráulico, PTFE Industrial, Anti-Fugas Pro.
- Línea 04 — Alta temperatura: Aluminio Térmico, Fibra Adhesiva, Cerámica Sellante.

**Qué entendí yo:**
- Una página de catálogo no necesita inventar componentes nuevos para cada cosa: la mayoría reusa el sistema (variables, tipografía, paleta, breakpoints) que ya armamos en el home.
- El truco del filtro sticky con `top: var(--header-height)` es bonito porque la variable se actualiza cuando cambia el viewport, así que el filter siempre queda pegado bajo el header sin importar el tamaño de pantalla.
- Anchor scroll + `scroll-margin-top` es la forma "moderna" de hacer una navegación interna sin JS.

---

## Conclusión de la sesión

**Listo:**
- `catalogo.html` con 12 productos, breadcrumb, filtro sticky, grid responsive mobile-first.
- Estilos del catálogo agregados a `components.css` sin romper nada del home.
- Botones del catálogo (`.product-card__actions`) y nueva variante `.btn-outline` oscura.

**Pendiente para la próxima:**
- Imágenes reales de productos: cuando estén, se reemplaza el `<div class="product-card__visual">` por `<img src="assets/img/producto-X.jpg" alt="...">`.
- Crear `producto.html` (ficha de UN producto), porque hoy los links "Ver detalle" tiran 404.
- Crear `contacto.html` y `carrito.html` (placeholder).
- Probar el catálogo en distintos anchos para confirmar que el filtro sticky y el grid se comportan bien.
