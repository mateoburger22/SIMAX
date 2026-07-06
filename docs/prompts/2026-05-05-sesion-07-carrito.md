# Sesión 07 — Carrito de compras

- **Fecha:** 2026-05-05
- **Fase del proyecto:** 1 (HTML + CSS)
- **Herramienta de IA:** Claude Code (modelo Sonnet 4.6)

## Objetivo de la sesión

Crear la página `carrito.html` con su estructura HTML y estilos CSS, siguiendo el sistema de diseño existente del proyecto.

---

## Prompts y resultados

### Prompt 1
> "Hagamos el HTML y CSS del carrito. Seguì el estilo de la pàgina."

**Qué hizo la IA:**

1. **Creó `carrito.html`** con la siguiente estructura:
   - Mismo header y footer que el resto del sitio (`aria-current="page"` en el link Carrito).
   - **Page header** reutilizando `.page-header` y `.breadcrumb` (Inicio > Carrito).
   - **Sección principal** con un `div.cart-layout` que en mobile es una columna y en desktop dos columnas (lista de ítems | resumen).
   - **Lista de ítems** (`<ul class="cart-items">`): dos productos de ejemplo tomados del catálogo (Repair Wrap 50mm ×2 y PTFE Industrial ×1), cada uno como `<li class="cart-item">` con visual placeholder, SKU, nombre, descripción, control de cantidad `−/+`, precio y botón Eliminar.
   - **Aside de resumen** (`<aside class="cart-summary">`): usa `<dl>` semántico para las filas subtotal / envío (a calcular) / total, nota aclaratoria sobre el envío, y botón "Iniciar compra".
   - Link "← Seguir comprando" de vuelta al catálogo.

2. **Agregó al final de `css/components.css`** los siguientes bloques:
   - `.cart-section` y `.cart-layout`: grid de 1 columna en mobile, `1fr 340px` en desktop (≥900px).
   - `.cart-items`: lista con `border-top` y cada ítem separado por `border-bottom`.
   - `.cart-item`: grid interno con 5 columnas (visual | info | cantidad | precio | eliminar). En mobile (< 600px) colapsa a 3 columnas y 2 filas para que todo entre cómodo.
   - `.cart-item__visual`: placeholder cuadrado 80px con el mismo estilo de franjas amarillas que las product-cards del catálogo, pero más pequeño.
   - `.cart-item__qty` + `.qty-btn` + `.qty-value`: control de cantidad con borde sutil, botones `−/+` sin fondo y el número centrado.
   - `.cart-item__remove`: botón "Eliminar" con estilo texto subrayado, sin apariencia de botón.
   - `.cart-summary`: panel con `background: var(--color-gray-100)`, borde amarillo arriba (igual a las category-cards) y `position: sticky` en desktop para que acompañe el scroll.
   - Filas del resumen con `<dl>`: `.cart-summary__row`, `.cart-summary__row--total` (con separador y tipografía display más grande para el precio total).
   - `.cart-summary__cta`: botón que ocupa todo el ancho del panel.

**Por qué:**
- Reusar `.page-header` y `.breadcrumb` mantiene la coherencia visual sin escribir CSS nuevo para esos elementos.
- `<dl>` (definition list) es el elemento semántico correcto para pares término-valor como subtotal/precio, ya que describe una relación de definición entre los dos.
- El grid de 5 columnas en `.cart-item` permite alinear verticalmente los datos de todos los ítems sin necesidad de una `<table>`. En mobile colapsa a un layout de tarjeta porque 5 columnas no entran en pantallas chicas.
- El `position: sticky` del resumen en desktop es el mismo patrón que ya usamos en el `.category-filter` del catálogo: el elemento acompaña el scroll hasta que llega al `top` definido.
- Los precios usan `var(--font-display)` (Barlow Condensed) para mantener coherencia con el catálogo.

**Qué entendí yo:**
- Un carrito en HTML puro es solo estructura y presentación: los botones `−/+` y "Eliminar" no hacen nada todavía porque eso requiere JavaScript (Fase 2).
- `<dl>` es más semántico que una tabla o un `<div>` para datos clave-valor como un resumen de compra.
- El mismo sistema de variables y clases base (`eyebrow`, `breadcrumb`, `page-header`, `btn`, `site-header`, etc.) permite construir una página nueva sin casi CSS extra.
- `position: sticky` en el sidebar del resumen es útil porque si la lista de ítems es larga, el usuario siempre ve el total sin hacer scroll.

---

## Conclusión de la sesión

**Listo:**
- `carrito.html` con 2 ítems de ejemplo, controles de cantidad y resumen del pedido.
- Estilos del carrito agregados a `components.css` sin modificar nada existente.
- Layout responsive: tarjeta apilada en mobile, dos columnas en desktop.

**Pendiente para la próxima:**
- Lógica JS para los botones `−/+`, "Eliminar" y actualización dinámica del total (Fase 2).
- Integración con Mercado Pago para el botón "Iniciar compra" (Fase 5 Backend).
- Imágenes reales de producto para reemplazar los placeholders.