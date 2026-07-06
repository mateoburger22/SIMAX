# Sesión 04 — Refactor mobile-first

- **Fecha:** 2026-04-29
- **Fase del proyecto:** 1 (HTML + CSS)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Hacer la página completamente device-responsive con estrategia mobile-first: que se vea bien y compacta en mobile, y que crezca cómodamente hacia tablet y desktop.

---

## Prompts y resultados

### Prompt 1
> "hace la pagina device responsive (mobile-first)"

**Qué hizo la IA:**

1. **Auditoría de patrones existentes.**
   - Confirmé que la mayoría de los layouts ya estaban mobile-first: los grids (`.category-grid`, `.features-list`, `.footer-inner`, `.why-inner`) arrancan en 1 columna y suman columnas con `@media (min-width: ...)`.
   - Detectó **un patrón desktop-first**: el ocultamiento del menú principal estaba con `@media (max-width: 640px) { .main-nav { display: none; } }`. Eso lo refactoricé.

2. **Refactor mobile-first del nav** en `css/components.css`:
   - Default: `.main-nav { display: none; }` (oculto en mobile).
   - Media query: `@media (min-width: 641px) { .main-nav { display: block; } }` (visible desde tablet).
   - Esto deja claro en el código que el comportamiento "menos" es el de mobile y se va sumando complejidad hacia arriba.

3. **Espaciado fluido con `clamp()` en `css/styles.css`:**
   - `--space-lg: clamp(1.75rem, 4vw, 2.5rem)` (28 → 40 px)
   - `--space-xl: clamp(2.5rem, 6vw, 4rem)` (40 → 64 px)
   - `--space-2xl: clamp(3rem, 8vw, 6rem)` (48 → 96 px)
   - Esto reemplaza la necesidad de escribir media queries para cada padding/margin grande. El espaciado escala fluidamente con el ancho del viewport.

4. **Comentarios pedagógicos** en el CSS para que sirva como apoyo para el oral.

5. **Documento técnico nuevo:** [`docs/explicaciones/02-css-responsive-mobile-first.md`](../explicaciones/02-css-responsive-mobile-first.md) con:
   - Diferencia entre desktop-first y mobile-first.
   - Cómo se aplica en CIMAT (grids, nav, tipografía, spacing fluido).
   - Tabla de breakpoints elegidos y por qué.
   - Resumen de bolsillo para el oral.

**Por qué:**
- Mobile-first es la convención moderna porque obliga a pensar primero en el contenido esencial y permite "agregar" complejidad hacia arriba en lugar de "quitar" hacia abajo.
- `clamp()` evita la duplicación de reglas con media queries para tamaños que escalan continuamente. Es más limpio, más performante (el navegador interpola en una sola pasada) y más fácil de mantener.
- La rúbrica del Módulo 2 del parcial pide explícitamente "explica responsive (flex/grid) con sentido", "comprende eventos", etc. Tener un patrón consistente y comentado ayuda a explicarlo en el oral.

**Conceptos técnicos involucrados:**
- **Mobile-first vs desktop-first** como estrategia de CSS responsive.
- **Media queries** con `min-width` (mobile-first) vs `max-width` (desktop-first).
- **`clamp(MIN, IDEAL, MAX)`** para tamaños fluidos.
- **`vw` units** (viewport width) para tamaños proporcionales al ancho de pantalla.
- **CSS Grid responsivo** (1 col → más cols según el viewport).
- **Meta viewport** en el HTML.

**Qué entendí yo:**
- Mobile-first no es solo cuestión de orden de las reglas: es una forma de pensar el diseño. Si en mobile no hace falta algo, no lo escribo. Solo agrego cosas a medida que hay espacio.
- Las media queries con `min-width` se "encadenan": cuando el viewport pasa de 600 → 1000 → 1200, **todas las reglas que apliquen se acumulan**, no se reemplazan.
- `clamp()` es como un media query embebido en una sola línea. Mucho más limpio para tamaños continuos como espaciado o tipografía.

---

## Conclusión de la sesión

**Listo:**
- Página completamente mobile-first.
- Espaciado fluido con `clamp()` (sin media queries para paddings grandes).
- Nav oculta por default y aparece desde 641 px.
- Documentación técnica de responsive en `docs/explicaciones/`.

**Pendiente para la próxima:**
- Probar en distintos anchos (DevTools de Chrome con responsive mode) y ajustar lo que sea necesario.
- Continuar con catálogo, ficha de producto, contacto y carrito (placeholder).
- Conectar Vercel cuando esté listo para CI/CD.
