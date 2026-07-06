# Sesión 11 — Migración a React (Vite + React Router + Context)

- **Fecha:** 2026-05-05
- **Fase del proyecto:** 3 (React)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Reescribir todo el proyecto en React, manteniendo el HTML/CSS/JS viejo intacto durante la transición. Los productos pasan a ser un componente reutilizable. Dejarlo listo para que más adelante se migre a Next.js.

---

## Prompts y resultados

### Prompt 1
> "Pasa todo el proyecto a react. Hace que los productos sean componentes."

Antes de programar, la IA hizo varias preguntas sobre el stack y el flujo de migración. Las respuestas fueron:
1. **Reemplazo total**: crear React primero, después borrar lo viejo.
2. **Node.js**: el alumno tenía instalado.
3. **Build tool**: Vite (la IA explicó que el navegador no entiende JSX nativamente y que CRA está deprecado desde 2023).
4. **Lenguaje**: JavaScript.
5. **Estilos**: CSS Modules (uno por componente).
6. **Routing**: React Router. Setup React "normal" (no optimizado para Next).
7. **Estado del carrito**: Context API + useReducer + localStorage.

**Qué hizo la IA:**

Creó la carpeta `polytape-react/` con la estructura estándar de un proyecto Vite:

```
polytape-react/
├── package.json              ← dependencias: react, react-dom, react-router-dom, vite
├── vite.config.js            ← config mínima del build tool
├── index.html                ← entry point HTML (Vite reemplaza el viejo de cada página)
├── src/
│   ├── main.jsx              ← monta React en el <div id="root">
│   ├── App.jsx               ← define las rutas con React Router
│   ├── styles/
│   │   ├── reset.css         ← reset minimalista
│   │   └── globals.css       ← variables CSS + estilos base + clases de botones
│   ├── data/
│   │   └── productos.js      ← array de productos + metadata de líneas + formatPrice()
│   ├── context/
│   │   └── CartContext.jsx   ← estado global del carrito (Context + useReducer)
│   ├── components/
│   │   ├── Layout.jsx        ← header + <Outlet /> + footer (envuelve todas las rutas)
│   │   ├── Header.jsx + .module.css
│   │   ├── Footer.jsx + .module.css
│   │   ├── CartWidget.jsx + .module.css
│   │   └── ProductCard.jsx + .module.css   ← componente reutilizable
│   ├── pages/
│   │   ├── Home.jsx + .module.css
│   │   ├── Catalogo.jsx + .module.css
│   │   ├── Carrito.jsx + .module.css
│   │   ├── Checkout.jsx + .module.css
│   │   └── Confirmacion.jsx + .module.css
│   └── assets/
│       ├── logo/cimat-logo.png         ← copiado del proyecto viejo
│       └── img/productos/              ← vacío, el alumno copia las 3 imágenes
```

**Conceptos React aplicados (importantes para el oral):**

1. **JSX**: sintaxis que permite escribir HTML adentro de JavaScript. No es HTML, es azúcar sintáctico que Vite traduce a llamadas de `React.createElement()`. Por eso `class` se escribe `className`, `for` se escribe `htmlFor`, etc.

2. **Componentes funcionales**: cada componente es una función que devuelve JSX. Los componentes reciben datos por **props** (como argumentos). Ejemplo: `<ProductCard product={p} />` pasa el objeto `p` al componente.

3. **Una sola fuente de verdad para los productos**: en vanilla los 9 productos estaban escritos a mano en `catalogo.html`. Acá viven en `data/productos.js` como un array, y el `Catalogo.jsx` los renderiza con `productos.map(p => <ProductCard product={p} />)`. Cambiar un precio = editar un solo lugar.

4. **CSS Modules**: cada componente tiene su `.module.css`. Los nombres de clases se "scopean" automáticamente (Vite renombra `.cartWidget` a `.cartWidget_abc123` al compilar) para que los estilos no choquen entre componentes. Se importan así: `import styles from './Header.module.css'` y se usan como `className={styles.headerInner}`.

5. **React Router** (SPA — Single Page Application): en vanilla cada `.html` era una página separada con recarga total. Acá hay UN solo `index.html` y el cliente intercambia componentes según la URL sin recargar. Mucho más rápido y permite mantener estado (como el carrito) entre vistas sin tocar localStorage en cada navegación.
   - `<BrowserRouter>` envuelve la app.
   - `<Routes>` y `<Route path="/..." element={<Componente />} />` definen el mapeo URL → componente.
   - `<Link to="/...">` reemplaza al `<a href>` (no recarga la página).
   - `<NavLink>` agrega clase `active` automáticamente cuando la URL coincide.
   - `<Outlet />` es el "agujero" donde React Router inyecta la página actual dentro del Layout.

6. **Hooks** (las funciones especiales que empiezan con `use`):
   - `useState`: crear un estado local del componente (ej: `open` del dropdown).
   - `useEffect`: ejecutar código cuando algo cambia (ej: cerrar el dropdown al navegar).
   - `useRef`: referencia mutable a un elemento DOM (ej: detectar click afuera del widget).
   - `useReducer`: estado complejo con acciones (ej: el carrito).
   - `useContext`: leer un Context (ej: `useCart()`).
   - `useNavigate`: navegar programáticamente (ej: redirigir al confirmar pedido).
   - `useLocation`: leer la URL actual.

7. **Context API**: `CartContext` es una "caja" de datos que cualquier componente envuelto en `<CartProvider>` puede leer. Sin esto, para que el `CartWidget` del header sepa cuántos items hay, habría que pasar el carrito como prop por todos los componentes intermedios (a esto se le llama "prop drilling" y es lo que Context resuelve).

8. **useReducer**: en vez de tener funciones sueltas (`addItem`, `removeItem`...) tenés UN reducer que recibe el estado actual y una "acción" (objeto con `type` y `payload`), y devuelve el nuevo estado. Es la versión React del switch-case con operaciones. Ventaja: todo el flujo de cambios está en un solo lugar.

9. **Inmutabilidad**: en el reducer NUNCA mutamos el estado anterior (`items.push(...)` está mal). Siempre devolvemos un array/objeto nuevo (`[...items, nuevo]` o `items.map(...)`). React detecta cambios comparando referencias — si mutás, no detecta y no re-renderiza.

10. **Persistencia con `useEffect`**: cada vez que el array `items` cambia, un `useEffect` lo guarda en `localStorage`. Al cargar la página, leemos de `localStorage` como estado inicial del reducer.

11. **Eventos**: en JSX se escriben en camelCase (`onClick`, `onSubmit`) y reciben funciones, no strings (`onClick={handleClick}` no `onclick="handleClick()"`).

12. **Vite procesa imágenes**: hacemos `import polytape from '../assets/img/productos/polytape.png'` y Vite nos devuelve la URL final con hash (para cache busting). En vanilla referenciábamos por string `"assets/img/productos/polytape.png"`.

13. **`dangerouslySetInnerHTML`**: como las descripciones de productos tienen `<strong>` para resaltar specs, las inyectamos como HTML. Se llama "dangerously" porque si el contenido viene de input del usuario, puede haber XSS. En este caso es seguro (los datos los escribimos nosotros en `productos.js`).

14. **Convención de carpetas**: `components/` para componentes reutilizables, `pages/` para los componentes que son páginas enteras (corresponden a una ruta). Esta separación facilita la migración a Next.js (donde `pages/` es la convención nativa).

**Por qué (decisiones técnicas):**

- **Vite vs Create React App**: CRA está oficialmente abandonado por Facebook desde 2023. Vite es el reemplazo moderno: arranca el dev server en menos de 1s vs 10s+ de CRA, hace HMR (hot module replacement) más rápido, y usa esbuild que es 10-100x más rápido que webpack.
- **CSS Modules vs styled-components**: Modules es más simple, no requiere librería extra, y mantiene CSS plano (transferible a otros frameworks). Para el ecosistema escolar es la opción menos exótica.
- **Context vs Redux/Zustand**: para un carrito con 5-6 acciones, Redux es overkill. Context + useReducer cubren el mismo patrón sin librería externa.
- **`navigate('/catalogo', { replace: true })`** en checkout vacío: el `replace` hace que esa redirección no quede en el historial, así el botón "atrás" del navegador no vuelve al checkout vacío.
- **Componentes de página vs componente de layout**: el Layout (header + footer) se monta una vez y persiste entre rutas. Solo el contenido del `<Outlet />` se intercambia. Esto significa que el carrito en el header NO se desmonta al navegar — su estado local (como `open` del dropdown) persiste.
- **Cierre del dropdown al navegar**: como el `CartWidget` no se desmonta al cambiar de ruta, hay que detectar el cambio con `useLocation()` y resetear `open` con un `useEffect`. Esto es diferente al vanilla donde cada navegación recargaba el HTML.
- **Migración futura a Next.js**: la estructura `pages/Home.jsx`, `pages/Catalogo.jsx` etc. mapea casi 1:1 a la convención de Next (`app/page.jsx`, `app/catalogo/page.jsx`). El Context pasa tal cual. Los componentes pasan tal cual. Lo único que cambia es el sistema de rutas (`<Routes>` desaparece, las páginas se vuelven archivos en una jerarquía de carpetas) y los `<Link>` apuntan a `next/link`.

**Qué entendí yo:**
- En React, la app no es un montón de páginas HTML — es UN componente raíz (`App`) que renderiza otros componentes según el estado y la URL.
- Los componentes son funciones JS que devuelven "lo que se ve". Si los datos cambian, React vuelve a llamar la función y compara el resultado con el anterior para actualizar SOLO lo que cambió en el DOM real (esto es el "virtual DOM").
- El estado local de un componente (useState) y el global (Context) son la misma idea: datos que cuando cambian, React re-renderiza lo que dependa de ellos.
- Separar datos (productos.js) de presentación (ProductCard.jsx) es clave — en vanilla ya empezaba a verse esto cuando hardcodeábamos productos en HTML, pero acá es la única forma de hacerlo bien.
- Vite es invisible: arrancás `npm run dev` y se olvida que existe. No tuve que configurar nada.

---

## Conclusión de la sesión

**Listo:**
- Proyecto React completo en `polytape-react/`, listo para correr con `npm install && npm run dev`.
- 9 productos como datos en un array, renderizados por un único `<ProductCard>`.
- Carrito con Context API + useReducer + persistencia en localStorage.
- Routing con React Router para 5 páginas (Home, Catálogo, Carrito, Checkout, Confirmación).
- CSS Modules por componente, variables y botones globales.
- Logo copiado del proyecto viejo.

**Pendiente (lo que tengo que hacer yo):**
1. Verificar que tengo Node.js: `node -v` en PowerShell.
2. Copiar las 3 imágenes de productos a `polytape-react/src/assets/img/productos/`:
   - `armortape.png`
   - `electrictape.png`
   - `polytape.png`
3. Instalar dependencias: en PowerShell, `cd polytape-react` y `npm install`.
4. Arrancar el dev server: `npm run dev`. Abrir el link que te tira (ej: http://localhost:5173).
5. Probarlo y avisar a la IA si hay algo roto.
6. Si está todo bien, **borramos** los archivos viejos (`index.html`, `catalogo.html`, `carrito.html`, `checkout.html`, `confirmacion.html`, carpetas `css/` y `js/`, archivos sueltos de assets).

**Pendiente para la próxima sesión:**
- Página `producto.html` (ficha individual) que faltaba desde el catálogo.
- Página `contacto.html`.
- Migración a Next.js (Fase 4).