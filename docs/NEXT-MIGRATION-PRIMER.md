# Primer para el chat de migración a Next.js

> Este documento le da contexto al chat nuevo para arrancar la **Fase 4: migración a Next.js**.
> Está pensado para que lo lea Claude apenas abrís un chat nuevo en este proyecto.

---

## Estado actual del proyecto (al cierre de la Fase 3)

- **Path raíz**: `c:\Users\lores\OneDrive\Escritorio\imagenes\Proyectos\Polytape\`
- **Stack actual**: React 18 + Vite 5 + React Router 6 + JavaScript (no TypeScript) + CSS Modules
- **Cómo correrlo**: `npm run dev` desde la raíz → `http://localhost:5173/` (o el puerto libre que encuentre).

### Estructura

```
Polytape/
├── docs/                       ← prompt logs de todas las sesiones (00 → 14)
│   └── NEXT-MIGRATION-PRIMER.md   ← este archivo
├── public/
├── src/
│   ├── App.jsx                 ← define rutas con React Router
│   ├── main.jsx                ← entry, monta React, envuelve en BrowserRouter + CartProvider
│   ├── styles/
│   │   ├── reset.css
│   │   └── globals.css         ← variables CSS + clases globales (.btn, .eyebrow)
│   ├── data/productos.js       ← array de 9 productos + lineas + formatPrice()
│   ├── context/CartContext.jsx ← Context + useReducer + localStorage (clave: cimat-cart-v1)
│   ├── components/
│   │   ├── Layout.jsx          ← Header + <Outlet/> + Footer
│   │   ├── Header.jsx + .module.css
│   │   ├── Footer.jsx + .module.css
│   │   ├── CartWidget.jsx + .module.css   ← dropdown del header
│   │   └── ProductCard.jsx + .module.css  ← card con contador (qty + Agregar)
│   └── pages/
│       ├── Home.jsx + .module.css
│       ├── Catalogo.jsx + .module.css
│       ├── Carrito.jsx + .module.css
│       ├── Checkout.jsx + .module.css
│       └── Confirmacion.jsx + .module.css
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── .gitignore
```

### Rutas actuales

| URL | Componente | Función |
|---|---|---|
| `/` | `Home.jsx` | landing con hero, 4 categorías, why-cimat, cta |
| `/catalogo` | `Catalogo.jsx` | filtro sticky + 3 secciones (Reparación / Aislación / Sellado) con 3 productos cada una |
| `/carrito` | `Carrito.jsx` | lista editable + resumen lateral |
| `/checkout` | `Checkout.jsx` | form con datos personales + dirección, redirige a confirmación |
| `/confirmacion` | `Confirmacion.jsx` | mensaje "Pedido confirmado" |

### Lo que falta del React (incompleto, ver si migrar igual o resolver primero)

- `producto.html` (ficha individual de producto) — los links "Ver detalle" tiran a `/producto` que **no existe como ruta**, sería 404.
- `contacto.html` — tampoco existe; los links a `/contacto` también dan 404.

---

## Objetivo de la Fase 4

Migrar a **Next.js** (App Router, no Pages Router — App es lo nuevo).

### Decisiones a confirmar con Mateo antes de programar

1. **¿App Router o Pages Router?** Recomiendo App Router (es el estándar desde Next 13).
2. **¿JS o TS?** Mateo viene usando JS, mantener JS salvo que pida cambiar.
3. **¿Replace o subcarpeta?** Mateo prefirió "crear paralelo y después borrar" en sesión 11 cuando pasamos a React. Probablemente quiera lo mismo acá.
4. **¿CSS Modules?** Sí, los seguimos usando — Next los soporta nativamente.
5. **¿Imágenes?** Next tiene `<Image>` con optimización automática. Vale la pena usarlo en lugar de `<img>`.
6. **¿`use client` para cuál?** El carrito y la card necesitan interactividad → `'use client'`. Las páginas estáticas pueden quedarse como server components.

### Cambios técnicos clave de la migración

| React + Vite | Next.js |
|---|---|
| `<Routes>` + `<Route>` en `App.jsx` | Carpeta `app/` con un `page.jsx` por ruta |
| `<Link to="/...">` de react-router | `<Link href="/...">` de `next/link` |
| `useNavigate()` | `useRouter()` de `next/navigation` |
| `useLocation()` | `usePathname()` de `next/navigation` |
| `<img src={img}>` | `<Image src={img}>` de `next/image` |
| `import './styles.css'` en main.jsx | `import './globals.css'` en `app/layout.jsx` |
| BrowserRouter envuelve todo | `app/layout.jsx` envuelve todo |
| CartProvider envuelve la app | Mismo, pero el provider necesita `'use client'` |

### Estructura propuesta para Next

```
app/
├── layout.jsx              ← raíz: <html>, <body>, header, footer, CartProvider
├── page.jsx                ← Home
├── catalogo/page.jsx
├── carrito/page.jsx
├── checkout/page.jsx
└── confirmacion/page.jsx
components/                 ← igual que ahora
context/                    ← igual que ahora
data/                       ← igual que ahora
public/                     ← imágenes (Next sirve esto en la raíz)
```

### Riesgos / cosas a tener en cuenta

- **`localStorage` solo existe en el cliente.** El Provider tiene que ser `'use client'` y usar `useEffect` para cargar el estado inicial (no se puede leer en SSR). Es un cambio chico pero importante.
- **La card de producto y el widget son interactivos** → necesitan `'use client'`.
- **El `dangerouslySetInnerHTML` de la descripción del producto** sigue funcionando igual, no requiere cambios.
- **El logo y las imágenes de productos**: hoy se importan como módulos (Vite las hashea). Next prefiere `public/` con paths absolutos `/img/productos/polytape.png`.

---

## Cosas IMPORTANTES sobre cómo trabaja Mateo

(Ya están en memoria, pero las recopilo acá por si acaso.)

- **Es estudiante** de Programación Web 71.38. No asumir conocimiento avanzado — explicar conceptos nuevos en español y de forma concisa.
- **Antes de programar tareas no triviales**, hacer preguntas clarificatorias y esperar respuesta. Lo pidió explícitamente varias veces.
- **Al terminar cada sesión de código, guardar un prompt log** en `docs/prompts/YYYY-MM-DD-sesion-NN-titulo.md` siguiendo el formato de `_plantilla.md`. Sin que lo pida.
- **Nunca hacer git push** sin que lo pida explícitamente. Commits OK con confirmación previa.
- **No puedo guardar imágenes pegadas en el chat al disco** — pedirle a Mateo que las guarde manualmente en la ruta exacta que le indique.
- **Respuestas concisas** — confía en que él lee el código. No re-explicar lo que ya está en el log.
- **Idioma**: español (de Argentina, "vos" en vez de "tú").

---

## Última sesión completada

**Sesión 14** — Layout nuevo de ProductCard con contador (− N +) que permite agregar varias unidades a la vez. La card tiene "Ver detalle" full-width arriba, y debajo "Agregar" (negro sólido) + contador (gris claro, sin bordes).

Para el detalle exacto, leer `docs/prompts/2026-05-06-sesion-14-product-card-counter.md`.