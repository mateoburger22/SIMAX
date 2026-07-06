# Sesión 15 — Migración completa de React + Vite a Next.js (App Router)

- **Fecha:** 2026-05-06
- **Fase del proyecto:** 4 (Next.js)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Migrar el proyecto entero de React 18 + Vite 5 + React Router 6 a Next.js 16 + React 19 con App Router. Promocionar el proyecto Next a la raíz del repo y dejar todo listo para hosting en Vercel.

---

## Estructura de la sesión: 6 bloques

La migración se hizo en bloques con confirmación entre cada uno. Decisiones acordadas al inicio: App Router, JS (sin TS), subcarpeta `polytape-next/` durante la migración, imágenes en `public/`, slug = sku lowercase para rutas dinámicas, sin Mercado Pago ni base de datos en esta fase.

---

### Bloque 1 — Setup inicial

**Qué hizo la IA:**
- Creó la rama `feature/next-migration`.
- Generó el proyecto con `npx create-next-app@latest polytape-next` con flags: `--js --app --eslint --no-tailwind --no-src-dir --import-alias "@/*"`.
- Verificó que compila con `npm run build` (1.4s).

**Por qué:**
- App Router es el sistema de rutas moderno de Next desde la versión 13. Todo lo nuevo del framework se construye sobre esto.
- Sin `src/` simplifica los paths de import.
- Alias `@/*` permite importar desde la raíz sin paths relativos largos (`../../`).

**Qué entendí yo:**
- Next 16 usa Turbopack como bundler por default (más rápido que Webpack).
- React 19 trae cambios menores pero importantes en server components.

---

### Bloque 2 — Estructura base

**Qué hizo la IA:**
- Creó `polytape-next/data/productos.js` con paths absolutos para imágenes (`/img/productos/...`).
- Creó `polytape-next/context/CartContext.js` con `'use client'` y patrón **SSR-safe**.
- Movió todas las imágenes a `polytape-next/public/img/` y `public/logo/`.
- Sobrescribió `app/layout.js` con `next/font` (Inter + Barlow Condensed) y `CartProvider`.
- Fusionó `reset.css` + `globals.css` en uno solo (Next solo permite un global).

**Por qué (clave técnica):**
- **SSR-safe localStorage**: el código original leía `localStorage` directamente en `getInitialCart()`. En Next, aunque el componente sea `'use client'`, igual se renderiza primero en el servidor. En el server `localStorage` no existe → crash. Solución: arrancar con `[]`, agregar acción `HYDRATE` al reducer, leer de localStorage en `useEffect` después del primer render, y usar un flag `hydrated` para no pisar el storage con `[]`.
- **`next/font`**: descarga las fonts en build-time, las sirve self-hosted desde mi dominio, y evita layout shifts. Reemplaza el `<link>` a Google Fonts.
- **Imágenes en `public/`**: en Next, todo lo que está en `public/` se sirve desde la raíz de la URL. Reemplaza el sistema de imports de assets de Vite.

**Qué entendí yo:**
- Hay una diferencia clave entre "componente client" y "componente que solo corre en el cliente". Aún siendo client, Next lo prerenderiza en el servidor para mandar HTML inicial. Por eso hay que tener cuidado con APIs del browser.

---

### Bloque 3 — Componentes (Header, Footer, CartWidget, ProductCard)

**Qué hizo la IA:**
- Migró los 4 componentes. Decisión Server vs Client por cada uno:
  - **Header** → Client (necesita `usePathname` para activar nav item).
  - **Footer** → **Server** (HTML estático puro, 0 JS al cliente).
  - **CartWidget** → Client (estado, eventos, lee carrito).
  - **ProductCard** → Client (contador, dispatcha al carrito).
- Reimplementé `NavLink` con `isActive` (no existe en Next) usando `usePathname()` + clase condicional.
- Reemplacé todas las `<img>` por `<Image>` de `next/image`.
- Conecté Header + Footer al `app/layout.js`.
- Agregué pattern de sticky footer al CSS global.

**Por qué (clave técnica):**
- **Footer como Server Component** = optimización clave. Su HTML se genera en build-time, **0 bytes de JavaScript** se mandan al cliente para esa parte. Si lo hubiera marcado `'use client'` por descuido, todo el árbol del Footer se hubiera bundleado.
- **`<Image>` vs `<img>`**: Next genera versiones WebP/AVIF automáticamente, srcset por viewport, lazy loading, y reserva el espacio antes de cargar (evita CLS).
- Para el logo del header, le puse `priority` porque está above-the-fold.

**Qué entendí yo:**
- En Next la frontera Server/Client está marcada por la directiva `'use client'`. Una vez que un archivo la tiene, todos sus imports también son client. Por eso conviene poner la directiva lo más profundo posible en el árbol (para que más cosas queden server).

---

### Bloque 4 — Páginas existentes (Home, Catálogo, Carrito, Checkout, Confirmación)

**Qué hizo la IA:**
- Migró 5 páginas. Server vs Client:
  - **Home** → Server (estática).
  - **Catálogo** → Server (los hijos `<ProductCard>` son Client; Next maneja la frontera).
  - **Carrito** → Client.
  - **Checkout** → Client (`useNavigate` → `useRouter`, `navigate(x, {replace})` → `router.replace(x)`).
  - **Confirmación** → Server.
- Cada ruta es una carpeta con un `page.js` adentro: `app/catalogo/page.js`, `app/carrito/page.js`, etc.
- CSS Modules co-localizados (cada `page.js` tiene su `page.module.css` al lado).
- A las páginas Server les agregué `export const metadata = {...}` para `<title>` y `<meta description>` por ruta.

**Por qué (clave técnica):**
- **Convención `page.js`**: Next reconoce este nombre como reservado. `app/catalogo/page.js` = ruta `/catalogo`. Cero configuración de routing.
- **Prerenderizado estático**: las 5 páginas salen del build como HTML pre-fabricado. Carrito y Checkout también, aunque sean Client — el HTML inicial es siempre el mismo (carrito vacío), después se hidrata desde localStorage.
- **`metadata` API**: solo disponible en Server Components. Para páginas Client (Carrito, Checkout) no se puede exportar — hay que hacer wrappers Server si se necesita SEO.

**Qué entendí yo:**
- Static, SSG y SSR son tres formas distintas de generar HTML:
  - **Static**: HTML hardcoded, mismo para todos.
  - **SSG**: HTML generado en build-time vía `generateStaticParams`.
  - **SSR**: HTML generado en cada request (no usado acá).
- Los Client Components no son lo opuesto a Static — pueden coexistir en una página estática.

---

### Bloque 5 — Páginas nuevas (productos/[id], contacto)

**Qué hizo la IA:**
- Creó `app/productos/[id]/page.js`: ficha individual con ruta dinámica, Server Component.
- Creó `components/AddToCartBlock.js`: el contador + botón "Agregar al carrito", Client Component (usado dentro de la ficha).
- Creó `app/contacto/page.js`: form de contacto sin backend, muestra "Mensaje enviado" al submit.
- Implementó `generateStaticParams()` para pre-renderizar **9 fichas estáticas**, una por producto.
- Implementó `generateMetadata()` para `<title>` y `<meta description>` dinámicos por producto.
- Usó `notFound()` para slugs inválidos (sirve la 404 automática).

**Por qué (clave técnica):**
- **Ruta dinámica con `[id]`**: el nombre de carpeta entre corchetes le dice a Next que ese segmento es un parámetro variable. `/productos/cimat-rw-050` → `params = { id: 'cimat-rw-050' }`.
- **`params` es Promise en Next 16**: la función es `async` y se hace `await params`. Es un cambio reciente — Next puede empezar a renderizar en streaming antes de tener resueltos los params.
- **`generateStaticParams` (SSG)**: le dice a Next qué valores de `[id]` existen. Next pre-renderiza UN archivo HTML por cada valor en build-time. 9 productos → 9 URLs estáticas. Cero render por request.
- **Composición Server/Client**: la ficha es Server (HTML estático, indexable por Google) pero el bloque interactivo (`<AddToCartBlock>`) es Client. Solo eso se hidrata. Mejor SEO + interactividad puntual = lo mejor de los dos mundos.

**Qué entendí yo:**
- Las rutas dinámicas + `generateStaticParams` permiten tener URLs amigables (`/productos/cimat-rw-050`) sin sacrificar performance (HTML estático servido desde CDN).
- La separación de bloques interactivos en Client Components chiquitos es la forma idiomática de Next 13+.

---

### Bloque 6 — Cleanup y promoción a la raíz

**Qué hizo la IA:**
- Hizo 5 commits granulares siguiendo Conventional Commits:
  1. `feat: add Next.js project as subfolder` — agrega todo `polytape-next/` al repo.
  2. `chore: remove legacy Vite project files` — borra `src/`, `dist/`, `index.html`, `vite.config.js`, `package.json` raíz, etc.
  3. `refactor: promote Next.js project to repo root` — mueve el contenido de `polytape-next/` a la raíz.
  4. `docs: update README and .gitignore for Next.js architecture` — `.gitignore` unificado.
  5. `docs: update README for Next.js architecture` — README reescrito.
- Verificó con `npm install` + `npm run build` que sigue compilando desde la raíz.
- Reinició el dev server.

**Problemas encontrados / cómo se resolvieron:**
- `mv polytape-next/app .` falló con "Permission denied" porque Windows tenía la carpeta abierta en algún proceso. Solución: usar `cp -r` + `rm -rf` en lugar de `mv` directo.
- `polytape-react/` (carpeta vacía vieja) quedó "busy" → no se pudo borrar. Pendiente que el usuario la borre manualmente cuando cierre Windows Explorer.

**Por qué (clave técnica):**
- **Promoción a raíz**: Vercel detecta automáticamente el framework si el `package.json` está en la raíz. Sin necesidad de configurar "root directory" personalizado. Estándar profesional.
- **Commits granulares**: cada paso queda como un punto de guardado reversible. Si algo se rompe, podés volver al commit anterior con `git reset --hard`.
- **Conventional Commits**: prefijos como `feat:`, `chore:`, `refactor:`, `docs:` permiten que herramientas como `standard-version` o changelogs automáticos funcionen.

**Qué entendí yo:**
- Git rename detection es smart: cuando movés un archivo, lo detecta como rename y no como (delete + create), preservando el `git blame`.
- En Windows, el File Explorer y los procesos de Node mantienen locks sobre las carpetas. Para evitar problemas, conviene cerrar todo antes de mover archivos masivamente.

---

## Conclusión de la sesión

**Listo:**
- Migración completa de React + Vite a Next.js 16 + App Router.
- 8 rutas funcionando, incluida ruta dinámica `/productos/[id]` con SSG.
- 17 URLs estáticas pre-renderizadas en build-time (las 9 fichas + 8 páginas).
- Composición Server/Client documentada y aplicada en cada componente.
- `next/font`, `next/image`, `metadata` API en uso.
- Proyecto promocionado a la raíz, listo para Vercel.
- 5 commits limpios en la rama `feature/next-migration`.
- README + `.gitignore` actualizados.

**Pendiente para la próxima:**
- Borrar `polytape-react/` (carpeta vacía que quedó busy en Windows).
- Probar la app en el navegador y confirmar que no hay regresiones.
- Mergear `feature/next-migration` a `main` (lo hace Mateo cuando esté conforme).
- Push a GitHub (lo hace Mateo).
- Fase 5: backend, base de datos, integración con Mercado Pago.
