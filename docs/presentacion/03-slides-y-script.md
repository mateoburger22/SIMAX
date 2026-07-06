# Slides + notas del orador + script de Q&A

10 minutos divididos en 4 momentos. La estrategia: **6 slides** que apoyen los 4 momentos sin agotar el tiempo, dejando espacio para que respondas preguntas con los obstáculos jugosos.

---

## ÍNDICE

- [SLIDE 1 — Portada](#slide-1--portada)
- [SLIDE 2 — Diagrama de arquitectura](#slide-2--diagrama-de-arquitectura)
- [SLIDE 3 — Obstáculos clave y cómo los resolvimos](#slide-3--obstáculos-clave-y-cómo-los-resolvimos)
- [SLIDE 4 — Stack y decisiones técnicas](#slide-4--stack-y-decisiones-técnicas)
- [SLIDE 5 — CI/CD: del código a producción](#slide-5--cicd-del-código-a-producción)
- [SLIDE 6 — Uso crítico de IA](#slide-6--uso-crítico-de-ia)
- [Script de preguntas y respuestas (Q&A)](#script-de-preguntas-y-respuestas)

---

## SLIDE 1 — Portada

### Contenido visual
- Logo CIMAT (de `public/logo/cimat-logo.png`).
- Título grande: **"POLYTAPE"** o **"CIMAT"**.
- Subtítulo: **"Ecommerce de cintas adhesivas industriales"**.
- Nombre, materia, fecha.
- Paleta: amarillo `#FFC600` + negro.

### Notas del orador (~30 segundos)

> "Hola, soy Mateo Burger. Mi proyecto es Polytape, el ecommerce de la marca CIMAT, una empresa ficticia de cintas adhesivas industriales: cintas para reparación con fibra de vidrio, aislación eléctrica, sellado de tuberías y alta temperatura. El público objetivo es industrial y profesional, no consumidor final. El proyecto pasó por las 4 fases de la materia y hoy está desplegado en Vercel."

---

## SLIDE 2 — Diagrama de arquitectura

### Contenido visual
- **Centro de la slide**: el PNG del diagrama que vas a hacer en Excalidraw (ver `02-diagrama.md`).
- Título de slide: **"Arquitectura de Polytape"**.
- Texto al pie: **"Next.js + React + CSS Modules + Vercel"**.

### Notas del orador (~2 minutos — esta es la slide donde más vas a hablar)

> "Acá está el diagrama de cómo funciona la app. Voy de arriba a abajo:
>
> [Señalá Usuario] El usuario abre el navegador, escribe la URL.
>
> [Señalá Vercel/CDN] La request llega a Vercel, que es el CDN donde está desplegada la app. Vercel sirve los archivos HTML, CSS y JavaScript que componen la aplicación.
>
> [Señalá Next.js App] Una vez que el navegador recibe esos archivos, arranca la app de Next.js. Next es un framework sobre React que organiza el routing por archivos: cada carpeta dentro de `app/` es una ruta.
>
> [Señalá Rutas] Tengo 8 rutas: home, catálogo, carrito, checkout, confirmación, contacto, y la ficha individual de cada producto, que es una **ruta dinámica** porque el ID cambia según el producto.
>
> [Señalá HTML/CSS/JS-React] La separación de capas es clara: el HTML (escrito como JSX dentro de los componentes) define la estructura, el CSS (en módulos por componente más un global) maneja los estilos, y la lógica (JavaScript con React) maneja el estado y las interacciones.
>
> [Señalá Componentes] Tengo 5 componentes principales: Header, Footer, CartWidget, ProductCard y AddToCartBlock. Algunos son Server Components y otros Client Components. Eso lo explico en otra slide.
>
> [Señalá Estado] El estado del carrito vive en un Context global con useReducer y se persiste en localStorage del navegador. Por eso si refrescás, el carrito sigue ahí.
>
> [Señalá flecha de re-render] Cuando el usuario clickea 'Agregar al carrito', se dispara una acción, el reducer actualiza el state, y React re-renderiza solo los componentes que dependen de eso — en este caso, el badge del header con el contador de items.
>
> [Señalá CI/CD a la derecha] El despliegue: cuando hago `git push origin main`, GitHub notifica a Vercel, Vercel clona el repo, corre `npm run build`, y publica la nueva versión en producción. Todo automático."

### Tip importante
**Apuntá con el cursor o el dedo a las partes del diagrama mientras hablás**. Eso es lo que la rúbrica evalúa como "puede justificar cada parte verbalmente". Si solo lees, perdés ese punto.

---

## SLIDE 3 — Obstáculos clave y cómo los resolvimos

### Contenido visual
Título: **"3 problemas reales que tuve que resolver"**

3 columnas, una por obstáculo. Cada columna con:
- Un ícono ⚠️
- Título corto
- 2-3 líneas de descripción
- Frase de cierre con la solución

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ ⚠️ Inmutabilidad    │ ⚠️ Dropdown         │ ⚠️ localStorage     │
│ en React            │ en SPA              │ rompía en Next      │
│                     │                     │                     │
│ Si mutaba el array  │ El dropdown del     │ El carrito leía     │
│ del carrito, React  │ carrito quedaba     │ localStorage al     │
│ no detectaba el     │ abierto al cambiar  │ inicializar, pero   │
│ cambio y la UI no   │ de página, porque   │ Next renderiza en   │
│ se actualizaba.     │ el Layout no se     │ servidor primero, y │
│                     │ desmonta entre      │ ahí localStorage    │
│ → Solución: SIEMPRE │ rutas en una SPA.   │ no existe.          │
│ devolver array NUEVO│                     │                     │
│ con spread (...)    │ → Solución:         │ → Solución:         │
│                     │ useEffect que       │ Patrón SSR-safe:    │
│                     │ escucha cambios de  │ inicio con [],      │
│                     │ ruta y resetea      │ hidrato en useEffect│
│                     │ open=false.         │ post-render.        │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

### Notas del orador (~2 minutos)

> "Esta slide es para hablar de las cosas que NO salieron bien la primera vez. Le decían que cuando se usa IA hay que ser crítico con lo que devuelve y entender qué hace. Estos son tres ejemplos donde tuve que pensar más allá del código que me daba la IA.
>
> **Primer obstáculo: inmutabilidad en React.**
> Cuando empecé con React, intenté agregar un item al carrito haciendo `items.push(nuevo)`. La lógica corría, pero la UI no se actualizaba. Estuve un rato sin entender. Lo que aprendí es que React detecta cambios comparando **referencias** de los objetos, no su contenido. Si mutás el array original, la referencia es la misma → React piensa que no cambió nada → no re-renderiza. La solución es siempre crear un array nuevo: `[...items, nuevo]`. Esto se llama **inmutabilidad**, y es uno de los principios fundamentales de React.
>
> **Segundo obstáculo: el dropdown del carrito quedaba abierto al cambiar de página.**
> En el header tengo un dropdown del carrito que se abre al clickear. Cuando hacía 'Agregar al carrito' desde el catálogo y después navegaba a otra página, el dropdown seguía abierto en la página nueva. En la versión vanilla con HTML puro esto no pasaba porque cada página recargaba el DOM completo. Pero React Router (y Next) son **SPAs**: una sola página, los componentes solo se intercambian. El Header está en el Layout, y el Layout no se desmonta. Por eso el estado `open=true` persiste. La solución fue agregar un `useEffect` que escucha cambios de ruta con `usePathname()` y cierra el dropdown automáticamente.
>
> **Tercer obstáculo: localStorage rompía la app en Next.**
> Cuando migré a Next, el carrito tiraba un error: `localStorage is not defined`. Esto es porque Next por default renderiza los componentes **en el servidor primero** (para mejorar performance y SEO) y después los hidrata en el cliente. En el servidor no existe `localStorage` porque no hay navegador. La solución fue un patrón llamado **SSR-safe localStorage**: el carrito arranca con un array vacío, y un `useEffect` lee `localStorage` y lo carga **después** del primer render. Eso garantiza que el código que toca `localStorage` solo corra en el cliente.
>
> Estos tres obstáculos son los que más me hicieron entender la diferencia entre 'sé escribir código' y 'entiendo cómo funciona el framework'."

### Tip
Esta slide es donde te diferenciás de un alumno que solo copió y pegó. **Si te preguntan sobre IA en el Módulo 4, volvés a esta slide**: "esto es justamente lo que la IA me sugirió primero y no funcionó, hasta que [explicación]".

---

## SLIDE 4 — Stack y decisiones técnicas

### Contenido visual

Tabla o cuadrícula:

| Capa | Qué uso | Por qué |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Routing por archivos, prerenderizado estático, optimización automática |
| **UI Library** | React 19 | Componentes reutilizables, estado reactivo |
| **Lenguaje** | JavaScript (no TS) | Foco de la materia en fundamentos |
| **Estilos** | CSS Modules + variables globales | Scope local, sin clases que choquen |
| **Estado** | Context API + useReducer | Carrito global sin librería externa |
| **Persistencia** | localStorage (SSR-safe) | Carrito persiste entre sesiones |
| **Imágenes** | `next/image` (WebP/AVIF) | Optimización automática, lazy load |
| **Fonts** | `next/font` (Inter + Barlow) | Self-hosted, cero CLS |
| **Hosting** | Vercel | CI/CD automático desde GitHub |

Y un mini-diagrama con la **estructura de carpetas**:

```
app/                ← rutas (1 carpeta = 1 URL)
components/         ← UI reutilizable
context/            ← estado global
data/               ← productos (mock data)
public/             ← imágenes y estáticos
```

### Notas del orador (~1 minuto)

> "Sobre el stack: la materia me llevó por una progresión HTML/CSS → JS vanilla → React → Next. Cada fase fue un escalón conceptual.
>
> Para Next elegí **App Router** que es la forma nueva, en lugar de Pages Router que es legacy. Next reconoce automáticamente que cada carpeta dentro de `app/` con un archivo `page.js` adentro es una ruta. Así, `app/catalogo/page.js` se vuelve la URL `/catalogo`. Cero configuración de routing.
>
> Para los estilos uso **CSS Modules**: cada componente tiene su `.module.css` al lado, y los nombres de clase se 'scopean' automáticamente para no chocar entre componentes. Por encima de eso, un `globals.css` con las variables de marca: el amarillo `#FFC600`, las fonts, los espaciados, etc.
>
> Para el carrito uso **Context API con useReducer**: es la versión React de un store global, sin la complejidad de Redux. Cualquier componente que llame al hook `useCart()` accede al estado del carrito, sin pasar props por todos los niveles intermedios."

---

## SLIDE 5 — CI/CD: del código a producción

### Contenido visual

Mini-diagrama horizontal del flujo:

```
[ Mi PC ]  →  [ git push ]  →  [ GitHub ]  →  [ Vercel ]  →  [ URL pública ]
   código        commit            repo         build &       polytape.vercel.app
                                                  deploy
```

Debajo: **dos screenshots**:
- Captura A: Dashboard de Vercel con el deploy "Ready" (que sacaste según `01-vercel.md`).
- Captura B: La home de Polytape andando en `polytape-XXX.vercel.app`.

### Notas del orador (~1 minuto)

> "Esto es CI/CD: continuous integration, continuous deployment. Significa que el código pasa del repo a producción sin pasos manuales.
>
> El flujo en mi proyecto: cuando termino una funcionalidad, hago commit con un mensaje descriptivo siguiendo Conventional Commits — por ejemplo `feat: add product detail page`. Después hago `git push origin main`. GitHub recibe el push y notifica a Vercel mediante un webhook. Vercel automáticamente clona el repo, corre `npm install`, después `npm run build`, y si todo compila correctamente, sube los archivos al CDN y actualiza la URL pública. Todo el proceso tarda unos 2-3 minutos.
>
> En la práctica: cierro VS Code, abro el navegador, refresco la URL, y veo el cambio en producción.
>
> [Si te preguntan si es CI/CD 'real']: el pipeline lo provee Vercel sin que yo lo configure. Es lo que se llama Platform-as-a-Service. Si tuviera que armar el pipeline desde cero usaría algo como GitHub Actions. Para este proyecto, Vercel es la opción correcta porque es la plataforma sponsoreada por el creador de Next.js, así que la integración es perfecta."

### Tip
Si conectaste Vercel: tenés URL pública, mostrá la URL en pantalla mientras hablás de esto. Suma muchísimo.

---

## SLIDE 6 — Uso crítico de IA

### Contenido visual

Título: **"Uso fundamentado de IA: Claude Code"**

Lista de bullets:

- **Herramienta**: Claude Code (CLI de Anthropic, modelo Opus 4.7).
- **16 sesiones documentadas** en `docs/prompts/`.
- **Mi flujo de trabajo**:
  1. Pido a la IA un cambio explicando el contexto.
  2. La IA me hace **preguntas clarificatorias** antes de programar (yo se lo pedí explícitamente).
  3. Reviso el código y lo pruebo en el navegador.
  4. Si algo no funciona, paso el error a la IA hasta que lo corrija.
  5. Documento la sesión en formato Markdown.
- **Lo que aprendí a NO hacer**:
  - Aceptar código sin entenderlo.
  - Pushear sin probar localmente.
  - Confiar en que "si compila, funciona".

Y una mini cita:

> *"La IA escribe rápido pero no entiende mi proyecto a menos que se lo explique. Mi rol es ser el director: decido qué se hace, valido qué quedó bien, y aprendo en el proceso."*

### Notas del orador (~2 minutos — los últimos)

> "El último momento del oral es sobre cómo usé IA. Voy a ser concreto.
>
> Usé **Claude Code**, que es una CLI de Anthropic conectada a un modelo grande llamado Opus 4.7. La elegí por dos razones: una, mantiene contexto entre sesiones porque puede leer mis archivos; dos, me permite tener cada cambio en formato git diff que reviso antes de aceptar.
>
> Mi flujo es: documento el contexto en archivos como `docs/NEXT-MIGRATION-PRIMER.md`, le pido un cambio, y le exigí desde la primera sesión que **antes de programar tareas no triviales me haga preguntas clarificatorias**. Eso evita que se mande a hacer cosas que no quería.
>
> Tengo **16 sesiones documentadas** en `docs/prompts/`, una por cada ronda de cambios significativa. Cada archivo tiene los prompts originales, qué hizo la IA, **por qué** lo hizo, y **qué entendí yo de lo que hizo**. Esa última parte es la más importante para mí.
>
> Sobre los errores de la IA: en la slide 3 mostré 3 obstáculos. Quiero ser claro: **la IA fue parte del problema en algunos casos**. Por ejemplo, en la migración a Next, la primera versión del CartContext que me sugirió leía `localStorage` directamente al inicializar el reducer. Compilaba, pero rompía en producción porque Next renderiza en server primero. Tuve que entender por qué fallaba, buscar el patrón SSR-safe, y pedirle a la IA que reescribiera con ese patrón. Si yo no hubiera entendido la diferencia entre server y client rendering, hubiera quedado un bug enterrado.
>
> Esto es lo que para mí es 'usar IA con criterio': no es lo mismo que 'la IA hizo todo'. Yo decidí cada migración, cada decisión arquitectónica, qué tecnologías usar y cómo. La IA aceleró la escritura del código. El producto y las decisiones son míos."

---

# SCRIPT DE PREGUNTAS Y RESPUESTAS

Estas son las preguntas más probables que te puede hacer el profe. Para cada una, una respuesta corta (~30 seg) que podés decir.

---

## MOMENTO 1 (min 0-3) — Arquitectura, diagrama, CI/CD

### P1: "Explicame qué construiste."
**R**: "Construí un ecommerce frontend para una marca ficticia de cintas adhesivas industriales. Tiene catálogo, carrito persistente, checkout y página de confirmación. Está hecho en Next.js con App Router, desplegado en Vercel, y todo el estado del carrito vive en Context API con persistencia en localStorage. No tiene backend todavía: los productos están como datos hardcoded en un archivo JS. Esa parte vendría en la Fase 5."

### P2: "Cómo se organiza tu proyecto."
**R**: "La estructura sigue las convenciones de Next App Router: cada carpeta dentro de `app/` con un archivo `page.js` es una ruta. Tengo 8 rutas. Los componentes reutilizables viven en `components/`, el estado global en `context/`, los datos mock en `data/`, y los estáticos como imágenes en `public/`."

### P3: "Diferenciá estructura, estilo y lógica."
**R**: "Estructura es el HTML — en mi caso, JSX dentro de los componentes — define qué elementos hay y cómo se anidan. Estilo es el CSS, en mi caso CSS Modules co-localizados con cada componente, define cómo se ven los elementos. Lógica es el JavaScript con React: el estado, los eventos, las funciones que reaccionan a las interacciones del usuario. Las tres capas están separadas pero conviven en cada componente."

### P4: "Cómo se actualiza la interfaz."
**R**: "React tiene un modelo declarativo: cada componente describe cómo se ve la UI **en función del state actual**. Cuando el state cambia — por ejemplo, el usuario clickea 'Agregar' y el carrito pasa de 0 a 1 item — React detecta el cambio comparando el state nuevo con el anterior, y re-ejecuta los componentes que dependen de ese state. Genera una representación virtual del DOM, la compara con el DOM real, y aplica solo las diferencias. Por eso solo el badge del header se actualiza, no toda la página."

### P5: "Cómo llega tu código a producción. Explicame el flujo CI/CD."
**R**: "Cuando termino una feature, hago commit en mi rama local, después merge a `main`, y `git push`. GitHub detecta el push y dispara un webhook a Vercel. Vercel clona el repo, corre `npm install`, después `npm run build` que prerenderiza las páginas estáticas, y publica el resultado en su CDN. La URL pública se actualiza en cuestión de minutos. Esto es CI/CD: el código viaja del repo a producción sin pasos manuales."

### P6: "Por qué Next y no React solo."
**R**: "Next agrega cosas que React no tiene out-of-the-box: routing por archivos, server components que rinden HTML estático para mejor SEO, optimización automática de imágenes con `next/image`, fonts self-hosted con `next/font`, y un sistema de build optimizado. Para un ecommerce donde el SEO importa, Next es claramente mejor."

---

## MOMENTO 2 (min 3-5) — HTML, CSS, JavaScript

### P7: "Qué significa HTML semántico y dónde lo usaste."
**R**: "HTML semántico significa usar etiquetas que describen el **significado** del contenido, no solo cómo se ve. Por ejemplo, en lugar de `<div class='header'>` uso `<header>`. En lugar de `<div class='nav'>` uso `<nav>`. En el catálogo, cada producto está en una `<article>` porque es una unidad independiente. La lista de productos está en una `<ul>` porque es una lista. Esto ayuda a los lectores de pantalla y mejora el SEO."

### P8: "Qué es accesibilidad. Diste algún ejemplo de ARIA."
**R**: "Accesibilidad es hacer que la app funcione bien para gente que usa lectores de pantalla, navegación por teclado, o que tiene baja visión. ARIA son atributos que agregan información semántica que el HTML no provee. Yo uso varios: `aria-label` en botones que solo tienen íconos para describirlos, `aria-live='polite'` en el contador de cantidad para que el lector de pantalla anuncie cuando cambia, `aria-current='page'` en los breadcrumbs para indicar dónde estás, y `aria-expanded` en el dropdown del carrito para indicar si está abierto."

### P9: "Cómo manejaste responsive."
**R**: "Empecé mobile-first: los estilos por default son para mobile, y con `@media (min-width: 600px)` agrego cambios para pantallas más grandes. Uso CSS Grid para layouts complejos como el grid de productos del catálogo, que va de 1 columna en mobile a 3 columnas en desktop. Uso Flexbox para alineaciones lineales como el header. Las tipografías y espaciados usan `clamp()` para escalar suavemente entre breakpoints."

### P10: "Qué es un evento en JavaScript. Mostrame uno."
**R**: "Un evento es algo que pasa en el navegador — click, submit de form, cambio de input, scroll. JavaScript permite escuchar eventos con `addEventListener` o, en React, con props como `onClick`, `onSubmit`, etc. Por ejemplo, en mi ProductCard tengo `<button onClick={handleAdd}>` que llama a la función `handleAdd` cuando el usuario clickea."

### P11: "Qué es asincronía y qué pasa sin await."
**R**: "Asincronía es cuando una operación tarda — por ejemplo, una request a un servidor — y JavaScript no se queda esperando bloqueado. En lugar de eso, devuelve una **Promise**, y la función que necesita el resultado puede usar `.then()` o `await` para esperar a que la Promise se resuelva. Sin `await`, si intentás usar el resultado, vas a obtener una Promise pendiente, no el valor real. **En mi proyecto puntualmente no uso fetch** porque los datos vienen hardcoded de `productos.js`. La asincronía la voy a usar en la Fase 5 cuando conecte el checkout con Mercado Pago."

### P12: "Qué es validación de formularios. Validás algo."
**R**: "Validación es asegurarte que los datos que entra el usuario son correctos antes de procesarlos. En mi checkout tengo `<input type='email' required>` que ya valida que sea un email válido y que no esté vacío, sin escribir JS. Uso el atributo `:user-invalid` en CSS para resaltar en rojo solo después de que el usuario interactúa, no de entrada. Para casos más complejos como validar formato de teléfono, agregaría JS con regex."

### P13: "Qué es un módulo ES6."
**R**: "Es la forma moderna de organizar código JavaScript en archivos separados. Cada archivo exporta cosas con `export` y otros las importan con `import`. Por ejemplo, en `data/productos.js` exporto el array de productos y la función `formatPrice`. En cualquier componente, hago `import { productos, formatPrice } from '@/data/productos'`. Esto evita el scope global y permite tree-shaking — el bundler solo incluye lo que efectivamente usás."

---

## MOMENTO 3 (min 5-7) — React y Next

### P14: "Qué es un componente."
**R**: "Un componente es una función JavaScript que devuelve JSX, que es como HTML embebido. Es una unidad reutilizable de UI. Por ejemplo, mi `<ProductCard>` recibe un producto como prop y renderiza la card completa: foto, nombre, precio, contador, botón. Lo uso 9 veces en el catálogo, una por producto. La ventaja es que cambio el diseño de la card en un solo lugar y se actualiza en todas las instancias."

### P15: "Diferenciá props y state."
**R**: "Props son datos que un componente **recibe** desde su componente padre. Son inmutables desde adentro: el componente no puede cambiar sus propias props. State, en cambio, son datos que un componente **maneja internamente** con `useState` o `useReducer`. Cuando el state cambia, el componente se re-renderiza. Ejemplo concreto: mi ProductCard recibe el producto como **prop**, pero la cantidad que el usuario eligió en el contador (1, 2, 3...) es **state local** del card, porque cambia con el tiempo."

### P16: "Cuándo y por qué re-renderiza un componente."
**R**: "Un componente se re-renderiza cuando **su state cambia**, **sus props cambian**, o **el state de un componente padre cambia**. React compara el resultado del nuevo render con el anterior usando un algoritmo llamado **reconciliación**, y solo aplica las diferencias al DOM real. Esto es eficiente porque evita tocar nodos del DOM que no cambiaron."

### P17: "Qué hace useEffect."
**R**: "`useEffect` permite ejecutar código **después** del render. Sirve para efectos secundarios: leer/escribir localStorage, suscribirse a eventos del browser, hacer requests a una API. Por ejemplo, en mi CartContext tengo un useEffect que persiste el carrito a localStorage cada vez que el array de items cambia. La función dentro del useEffect corre solo cuando las dependencias declaradas cambian. Si el array de dependencias está vacío, corre solo una vez al montar."

### P18: "Qué es Context y para qué lo usaste."
**R**: "Context es la forma de React de tener **estado global**, accesible desde cualquier componente sin tener que pasar props por todos los niveles intermedios. Yo lo uso para el carrito: el `CartProvider` envuelve toda la app, expone funciones como `addItem`, `removeItem`, y los datos `items`, `count`, `subtotal`. Cualquier componente que necesite saber cuántos items hay — por ejemplo el badge del header — llama a `useCart()` y los obtiene. Sin Context, tendría que pasar el carrito como prop por todos los componentes intermedios, lo que se llama **prop drilling**."

### P19: "Concepto básico de rutas en Next."
**R**: "En Next App Router, las rutas se definen por **estructura de carpetas**. Cada carpeta dentro de `app/` con un archivo `page.js` adentro se vuelve una URL. Por ejemplo, `app/carrito/page.js` sirve la URL `/carrito`. Para rutas dinámicas — donde el segmento varía — uso corchetes: `app/productos/[id]/page.js` matchea `/productos/cualquier-cosa`, y dentro del componente accedo al valor con `params.id`. Cero configuración de routing, todo es file-based."

### P20: "Diferencia entre cliente y servidor en Next."
**R**: "Next por default trata cada componente como **Server Component**: se renderiza en el servidor en build-time o en cada request, y se manda HTML al cliente. Esto es bueno para SEO y para reducir el JavaScript que llega al navegador. Si un componente necesita interactividad — useState, eventos, APIs del browser como localStorage — hay que marcarlo como **Client Component** poniendo `'use client'` arriba del archivo. En mi proyecto, el Footer es Server porque es estático, pero el Header es Client porque tiene un dropdown interactivo. La regla: server por default, client solo cuando es necesario."

### P21: "Qué es SSR vs SSG."
**R**: "Las dos generan HTML en el servidor, pero en momentos distintos. **SSR** (Server-Side Rendering) genera el HTML **en cada request**: si llega una request a `/carrito`, el servidor corre el código y devuelve el HTML correspondiente. Útil cuando el contenido cambia por usuario. **SSG** (Static Site Generation) genera el HTML **una vez en build-time**: cuando hago `npm run build`, Next pre-genera 9 archivos HTML, uno por cada producto del catálogo, usando `generateStaticParams`. Después esos archivos se sirven desde el CDN, sin servidor procesando nada por request. Es lo más rápido posible. En mi proyecto las 9 fichas de producto son SSG."

---

## MOMENTO 4 (min 7-10) — Uso de IA

### P22: "Qué herramienta de IA usaste y por qué."
**R**: "Usé Claude Code, que es la CLI oficial de Anthropic conectada a su modelo Opus 4.7. La elegí por tres razones: primero, mantiene contexto leyendo mis archivos directamente, no tengo que pegarle el código manualmente. Segundo, me devuelve los cambios como diffs que reviso antes de aceptar, en lugar de tirar bloques de código sin contexto. Tercero, tiene memoria persistente entre sesiones a través de archivos, lo que me permitió mantener mis preferencias y el contexto del proyecto a lo largo de las 16 sesiones."

### P23: "Cómo validabas el código que te daba la IA."
**R**: "Tres niveles. Primero, **leía el diff** antes de aceptarlo: si veía algo que no entendía, le pedía explicación. Segundo, después de cada cambio significativo **probaba en el navegador**: agregaba al carrito, navegaba entre páginas, refrescaba para ver que el localStorage andaba. Tercero, a veces la IA me sugería algo que **compilaba pero rompía en runtime** — el caso más claro fue el de localStorage en Next que mencioné antes. Ahí entender el sistema más allá del código fue clave."

### P24: "Dame un ejemplo concreto de un error de la IA."
**R**: "El más representativo es el del CartContext en Next. La primera versión que me dio leía localStorage directamente al inicializar el reducer. Compilaba sin problemas. Pero al correr en Next, fallaba con `localStorage is not defined` porque Next renderiza en server primero, y ahí no existe el browser API. La IA no había considerado el contexto de Next. Yo entendí el por qué — ya había leído sobre Server Components — y le pedí reescribir con un patrón SSR-safe: estado inicial vacío, useEffect para hidratar después del primer render, flag para no pisar localStorage durante la hidratación inicial. Este es el caso más jugoso para mí porque muestra que la IA no es infalible y que entender los conceptos de fondo es lo que distingue 'usar IA' de 'aceptar código'."

### P25: "Cómo distinguís lo que entendiste vs lo que solo aceptaste de la IA."
**R**: "En mi documentación de prompts, cada sesión tiene una sección 'Qué entendí yo' donde escribo en mis palabras lo que aprendí. Si no puedo escribir esa sección, sé que no entendí. Algo que NO entendí en este punto del proyecto es la implementación interna del virtual DOM de React — sé que existe y para qué sirve, pero no podría implementarlo. Algo que SÍ entendí: el flujo de eventos del carrito, la diferencia entre props y state, por qué la inmutabilidad es crítica, por qué Server Components reducen el bundle del cliente. Soy honesto: hay zonas del proyecto donde la IA escribió código y yo lo acepté después de probarlo, y hay zonas donde diseñé yo el approach y la IA solo lo escribió. Las dos formas son legítimas siempre que entienda el resultado."

### P26: "Mostrame la documentación de prompts."
**R**: "Está en `docs/prompts/`, son 16 archivos en formato Markdown, uno por sesión, ordenados cronológicamente. Cada uno tiene los prompts originales que le pasé, el resumen de lo que la IA hizo, las decisiones técnicas con su justificación, y al final mi sección 'qué entendí'. La sesión 15 es la más reciente y cubre la migración a Next, que tiene los obstáculos más interesantes."

> [Si te lo pide en pantalla, abrí el archivo en el editor mientras hablás. Sumás puntos.]

---

# Cierre del oral

Si te queda tiempo libre al final (te van a hacer pocas preguntas, terminás antes), cerrá con esto:

> "En resumen: armé un ecommerce moderno con Next.js, lo entendí en cada capa, lo desplegué con CI/CD a producción, y documenté el proceso de aprendizaje en 16 sesiones. La IA fue una herramienta de aceleración, no de reemplazo: las decisiones técnicas y la comprensión son mías. Estoy listo para la Fase 5: backend, base de datos y Mercado Pago."

---

# Lista de verificación pre-oral

- [ ] Vercel conectado y URL pública funcionando.
- [ ] Diagrama exportado como PNG y pegado en slide 2.
- [ ] 6 slides hechas en Canva.
- [ ] Las 2 capturas de Vercel en la slide 5.
- [ ] Practiqué el speech del diagrama (slide 2) al menos 2 veces, **señalando con el cursor**.
- [ ] Practiqué los 3 obstáculos de la slide 3 al menos 1 vez.
- [ ] Tengo abierto en una pestaña: el repo de GitHub, el dashboard de Vercel, el diagrama, y `docs/prompts/`.
- [ ] La carpeta `docs/prompts/` está versionada en GitHub (entregable obligatorio del Momento 4).
- [ ] Tengo el código abierto localmente por si el profe pide ver algo específico.
