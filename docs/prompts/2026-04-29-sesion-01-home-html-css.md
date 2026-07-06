# Sesión 01 — Home en HTML semántico + CSS

- **Fecha:** 2026-04-29
- **Fase del proyecto:** 1 (HTML + CSS, sin JavaScript)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Construir la página de inicio (home) del ecommerce CIMAT usando HTML semántico y CSS modular. Sin imágenes de productos todavía. Estética inspirada en 3M (industrial, profesional, mucho aire) con paleta de marca (amarillo CIMAT + negro).

---

## Prompts y resultados

### Prompt 1
> Le pasé el logo de CIMAT (amarillo industrial sobre fondo oscuro) y le mencioné que la página de 3M me gusta como modelo de estética. Pedí que hagamos el home, sin imágenes de productos, usando HTML semántico (header, nav, main, section, footer) y código prolijo.

**Qué hizo la IA:**
- Creó [index.html](../../index.html) con la estructura completa del home (header con logo + nav + carrito, hero con eyebrow + h1 + lead + CTAs, sección de líneas de producto, sección "por qué CIMAT", CTA final, footer).
- Creó [css/reset.css](../../css/reset.css) con un reset moderno y mínimo (box-sizing, margins, line-height, smoothing).
- Creó [css/styles.css](../../css/styles.css) con variables de marca (colores, tipografías, espaciado, layout) y estilos base (tipografía, accesibilidad, utilidades).
- Creó [css/components.css](../../css/components.css) con todos los bloques visuales (header, hero con banda industrial inferior, grid de categorías, features, CTA, footer).

**Por qué:**
- Separar CSS en 3 archivos (`reset` → `styles` → `components`) demuestra entender la separación de responsabilidades. Es uno de los puntos del diagrama del parcial.
- Usar variables CSS (`:root { --color-yellow: ... }`) facilita cambiar la paleta o las fuentes sin tocar 200 líneas — y es la base de un design system.
- HTML semántico (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) está literalmente nombrado en la matriz de evaluación del Módulo 2.
- Mobile-first con `@media (min-width: ...)` cumple el requisito de "responsive design" de la matriz.
- Banda inferior con franjas amarillo/negro 45° refuerza la identidad industrial sin necesidad de imágenes.

**Decisiones de diseño tomadas:**
- Tipografía display: **Barlow Condensed** (industrial, condensada, fuerte). Body: **Inter** (legible, moderna).
- Paleta: amarillo CIMAT `#FFC600`, negro `#1A1A1A`, escala de grises neutros. Blanco de fondo para mantener el aire al estilo 3M.
- Hero oscuro con texto blanco y acento amarillo en el span del h1.
- Cards de categoría con borde superior amarillo y numeración 01–04 al estilo industrial.
- Sticky header para que la navegación siempre esté disponible.
- Skip link de accesibilidad (`Saltar al contenido principal`) — punto de la rúbrica de accesibilidad/ARIA.

**Problemas encontrados / cómo se resolvieron:**
- La IA no puede guardar imágenes pegadas en el chat directamente. El logo queda referenciado como `assets/logo/cimat-logo.png` pero el archivo todavía no existe en disco; lo guardo manualmente cuando termine la sesión.

**Qué entendí yo:**
- Un sitio se arma de afuera hacia adentro: primero la estructura semántica (HTML), después la apariencia (CSS), después la lógica (JS). Si la estructura está bien hecha, los estilos quedan limpios.
- Usar variables CSS es como tener un "diccionario" de estilos: cambio el valor en un solo lugar y se actualiza todo el sitio.
- Mobile-first significa que primero diseñás para pantalla chica y después agregás reglas para pantallas más grandes con `@media (min-width: ...)`. Es más fácil que al revés.
- HTML semántico no es solo estética: ayuda a lectores de pantalla, a SEO, y le dice al navegador qué es cada parte de la página.

---

## Conclusión de la sesión

**Listo:**
- Home con estructura completa, semántica correcta, responsive desde mobile, paleta de marca aplicada.
- 4 archivos en disco: `index.html`, `css/reset.css`, `css/styles.css`, `css/components.css`.
- Primera explicación técnica armada en `docs/explicaciones/01-html-semantico.md`.

**Pendiente para la próxima:**
- Guardar el logo en `assets/logo/cimat-logo.png` para que el sitio lo levante.
- Crear el repo en GitHub (`CIMAT-ecommerce`) y linkear con `git init`.
- Construir las páginas restantes de fase 1: catálogo, ficha de producto, carrito (placeholder), contacto.
