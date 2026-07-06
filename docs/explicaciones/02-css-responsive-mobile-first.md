# 02 — CSS responsive y mobile-first

> Concepto evaluado en el Módulo 2 del parcial ("Responsive design", "explica responsive flex/grid con sentido").

## Qué es responsive design

Una página **responsive** es una página que **se adapta al tamaño de la pantalla** en la que se ve, sin necesidad de tener una versión separada para mobile, tablet y desktop. El mismo HTML + CSS se reorganiza visualmente según el ancho del viewport (la ventana del navegador).

Las herramientas principales que usé:

1. **Meta viewport** en el `<head>` — le dice al navegador móvil que use el ancho real del dispositivo, no el de un "monitor virtual" de 980 px que asume por defecto:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Media queries** — bloques de CSS que se aplican solo si se cumple una condición de tamaño. Ejemplo:
   ```css
   @media (min-width: 768px) {
       /* estas reglas se aplican solo si el viewport tiene 768 px o más */
   }
   ```

3. **Unidades fluidas** — porcentajes (`%`), unidades del viewport (`vw`, `vh`), funciones como `clamp()`, `min()`, `max()`.

4. **CSS Flexbox y Grid** — sistemas de layout que reflowean naturalmente cuando cambia el espacio disponible.

## Qué es mobile-first

**Mobile-first** es una **estrategia** de cómo escribir el CSS responsive. Hay dos formas de encararlo:

### Desktop-first (lo que **no** hago)
- Empezás escribiendo CSS pensando en pantalla grande.
- Después agregás `@media (max-width: ...)` para "deshacer" cosas en mobile.
- Problema: termina siendo más código, más difícil de mantener, y mobile se siente como "una versión lavada del desktop".

### Mobile-first (lo que sí hago)
- Empezás escribiendo CSS para la pantalla más chica.
- Después usás `@media (min-width: ...)` para **agregar mejoras** cuando hay más espacio.
- Ventaja: las reglas crecen progresivamente, mobile carga lo justo y necesario, y obliga a pensar primero en el contenido esencial.

## Cómo aplico mobile-first en CIMAT

### 1. Layouts de grilla — `1 col → más cols con min-width`

```css
.category-grid {
    display: grid;
    grid-template-columns: 1fr;          /* mobile: 1 columna */
}

@media (min-width: 600px) {
    .category-grid {
        grid-template-columns: repeat(2, 1fr);   /* tablet: 2 columnas */
    }
}

@media (min-width: 1000px) {
    .category-grid {
        grid-template-columns: repeat(4, 1fr);   /* desktop: 4 columnas */
    }
}
```

Lo mismo para el `.features-list` (1 → 3 cols), `.footer-inner` (1 → 3 cols), `.why-inner` (1 → 2 cols).

### 2. Navegación — oculta por default, se muestra con min-width

```css
.main-nav {
    display: none;            /* mobile: el menú queda oculto */
}

@media (min-width: 641px) {
    .main-nav {
        display: block;       /* tablet/desktop: el menú aparece */
    }
}
```

En la próxima fase (con JavaScript) reemplazaremos esto por un menú hamburguesa que se despliega al tocar un botón.

### 3. Tipografía — fluida con `clamp()`

```css
h1 { font-size: var(--fs-2xl); }                /* mobile */

@media (min-width: 768px) {
    h1 { font-size: var(--fs-3xl); }            /* desktop */
}
```

### 4. Espaciado fluido — `clamp()` sin media queries

Acá uso una técnica que evita escribir media queries para cada espacio:

```css
--space-2xl: clamp(3rem, 8vw, 6rem);    /* 48 → 96 px según viewport */
```

Esto significa: "intentá usar `8vw` (8% del ancho del viewport), pero nunca menos que `3rem` (48 px) ni más que `6rem` (96 px)". El navegador interpola el valor de forma fluida según el ancho de pantalla. En mobile el padding vertical es chico, en desktop es grande, sin saltos bruscos.

### 5. Tamaños del header — variables CSS coordinadas

```css
--header-logo-width:  clamp(100px, 16.67vw, 240px);
--header-height:      max(56px, calc(var(--header-logo-width) / var(--header-logo-aspect) + 0.75rem));
```

El logo escala con el viewport, y el header escala junto al logo. Todo se ajusta automáticamente.

## Breakpoints que usé y por qué

No hay breakpoints "correctos" universales. Yo elegí:

| Breakpoint | A partir de qué dispositivo | Qué cambia |
|------------|------------------------------|------------|
| **Default (mobile)** | Cualquier teléfono | Layout de 1 columna, nav oculto |
| **600 px** | Tablet vertical / mobile grande | Grids pasan a 2 cols |
| **641 px** | Tablet vertical | Aparece el menú principal |
| **768 px** | Tablet | Tipografía sube, footer 3 cols |
| **900 px** | Tablet horizontal | "Why CIMAT" 2 cols |
| **1000 px** | Laptop chica | Categorías 4 cols |

La idea no es matchear modelos de iPhone/iPad específicos sino **donde el contenido empieza a quedar incómodo** y necesita reorganizarse.

## Cómo lo explico en el oral (resumen de bolsillo)

> "El sitio es responsive con estrategia **mobile-first**: escribo el CSS para la pantalla más chica primero, y uso `@media (min-width: ...)` para agregar mejoras cuando hay más espacio. Esto se ve en los grids (1 columna por default que crecen a 2, 3 o 4 columnas) y en la nav (oculta en mobile, visible desde tablet). Para el espaciado uso **`clamp()`** que escala fluidamente entre un mínimo y un máximo sin necesidad de media queries — por ejemplo `clamp(3rem, 8vw, 6rem)` da 48 px en mobile y 96 px en desktop con transición suave. El meta viewport en el HTML asegura que el navegador móvil use el ancho real del dispositivo."
