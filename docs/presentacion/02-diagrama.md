# Diagrama de arquitectura en Excalidraw

Este es **el elemento más importante de tu oral**. Vale 12 puntos del Módulo 1 según la rúbrica, y la consigna dice que "forma parte central de la evaluación".

## Por qué Excalidraw

- Gratis, no requiere cuenta.
- Estilo "dibujado a mano" que queda profesional sin ser frío.
- Exportás como PNG y lo pegás en Canva.
- Todos los profes técnicos lo conocen y lo respetan.

URL: 👉 **https://excalidraw.com/**

---

## Los 6 elementos OBLIGATORIOS según la rúbrica

La rúbrica del PDF lista 6 ítems de 2 puntos cada uno (12 pts total). Tu diagrama tiene que tener TODOS:

- [x] Usuario y Navegador
- [x] Diferencia entre estructura (HTML), estilos (CSS) y lógica (JS/React)
- [x] Componentes o páginas
- [x] Flujo de información con flechas
- [x] Cómo se actualiza la interfaz
- [x] Que puedas justificar cada parte verbalmente

> **"Si faltan 3 o más elementos → no puede calificarse como Excelente."**

Si seguís este instructivo paso a paso, tu diagrama va a tener los 6 ✓.

---

## Layout sugerido (vista de pájaro)

```
                 ┌──────────────────┐
                 │   USUARIO        │
                 │   (humano)       │
                 └────────┬─────────┘
                          │ interactúa
                          ▼
                 ┌──────────────────┐
                 │   NAVEGADOR      │  ← Chrome/Firefox/Safari
                 │   (cliente)      │
                 └────────┬─────────┘
                          │ HTTPS
                          ▼
        ┌─────────────────────────────────────────┐
        │  VERCEL (CDN)  ←  GitHub  ←  git push   │   ← bloque CI/CD a la derecha
        └─────────────────────────────────────────┘
                          │ sirve
                          ▼
        ┌─────────────────────────────────────────┐
        │           NEXT.JS APP                   │
        │                                         │
        │  ┌─────────────────────────────────┐    │
        │  │  RUTAS (App Router)             │    │
        │  │  / · /catalogo · /productos/[id]│    │
        │  │  /carrito · /checkout · ...     │    │
        │  └─────────────────────────────────┘    │
        │                                         │
        │  ┌──────────────┐   ┌──────────────┐    │
        │  │ HTML         │   │ CSS Modules  │    │
        │  │ (estructura) │   │ (estilos)    │    │
        │  │              │   │              │    │
        │  │ JSX en       │   │ globals.css  │    │
        │  │ Server/      │   │ + por        │    │
        │  │ Client       │   │ componente   │    │
        │  │ Components   │   │              │    │
        │  └──────────────┘   └──────────────┘    │
        │                                         │
        │  ┌─────────────────────────────────┐    │
        │  │  COMPONENTES                    │    │
        │  │  Header · Footer · CartWidget · │    │
        │  │  ProductCard · AddToCartBlock   │    │
        │  └─────────────────────────────────┘    │
        │                                         │
        │  ┌─────────────────────────────────┐    │
        │  │  ESTADO (Context + useReducer)  │    │
        │  │  CartContext → carrito global   │    │
        │  │  + localStorage (persistencia)  │    │
        │  └─────────────────────────────────┘    │
        └─────────────────────────────────────────┘
```

---

## Pasos para armarlo en Excalidraw

### Paso 1 — Abrir Excalidraw
Andá a https://excalidraw.com/ . Vas a ver un canvas en blanco con una toolbar arriba.

### Paso 2 — Familiarizarte con las herramientas
Las que vas a usar:
- **R** → Rectángulo (para las cajas).
- **A** → Flecha (para conectar).
- **T** → Texto (para etiquetas).
- **D** → Diamante (para decisiones, opcional).
- **Ctrl+D** → Duplicar elemento seleccionado (te ahorra tiempo).
- **Click + drag** → Mover elementos.

### Paso 3 — Empezar de arriba hacia abajo

**Caja 1: Usuario**
1. Apretá `R` → dibujá un rectángulo arriba a la izquierda.
2. Doble-click adentro → escribí "Usuario".
3. Apretá Esc.

**Caja 2: Navegador**
1. Duplicá la caja de Usuario (`Ctrl+D`).
2. Movela debajo.
3. Cambiá el texto a "Navegador (Chrome / Firefox)".

**Flecha entre ellas**
1. Apretá `A`.
2. Click en el borde inferior de "Usuario", arrastrá hasta "Navegador".
3. Click sobre la flecha → arriba aparece un input → escribí "interactúa".

### Paso 4 — Bloque CI/CD a la derecha

Hacé un grupo de 3 cajitas chicas en horizontal:

```
[ Tu PC ] → [ GitHub ] → [ Vercel ]
   git push     pipeline    URL pública
```

1. 3 rectángulos chicos en línea.
2. Flechas entre ellos con labels: "git push" y "auto-deploy".
3. Una flecha final que sale de "Vercel" hacia "Navegador" con label "sirve HTML/CSS/JS".

### Paso 5 — La caja grande "Next.js App"

Dibujá un rectángulo GRANDE abajo del Navegador. Adentro vas a meter sub-cajas. Etiquetalo como "Next.js App (App Router)".

**Sub-caja 1: Rutas**
- Rectángulo arriba dentro de "Next.js App".
- Texto: "Rutas (App Router)" como título.
- Lista debajo:
  - `/` (Home)
  - `/catalogo`
  - `/productos/[id]` (dinámica, SSG)
  - `/carrito`
  - `/checkout`
  - `/contacto`
  - `/confirmacion`

**Sub-cajas 2 y 3: HTML y CSS (lado a lado)**
- Caja izquierda: "HTML (estructura) — JSX en componentes Server / Client"
- Caja derecha: "CSS (estilos) — globals.css + Modules por componente"

**Sub-caja 4: Componentes**
- Una caja con la lista:
  - Header (Client) — usepathname
  - Footer (Server) — 0 JS al cliente
  - CartWidget (Client) — dropdown
  - ProductCard (Client) — contador
  - AddToCartBlock (Client) — ficha producto

**Sub-caja 5: Estado**
- Una caja con:
  - "Estado (Context + useReducer)"
  - "CartContext → carrito global"
  - "+ localStorage (persistencia entre sesiones)"
  - "+ patrón SSR-safe"

### Paso 6 — Las flechas internas (ESTO ES CLAVE PARA "FLUJO DE INFORMACIÓN")

Esto es lo que te suma puntos. Las flechas tienen que tener LABELS que expliquen el flujo:

1. **Navegador → Next.js App**: label = "request HTTP"
2. **Rutas → Componentes**: label = "renderiza"
3. **Componentes ← Estado**: label = "lee carrito"
4. **Componentes → Estado**: label = "dispatch (addItem, removeItem)"
5. **Estado → localStorage** (poné localStorage como cajita afuera): label = "persiste"
6. **localStorage → Estado**: label = "hidrata al cargar"
7. **Componentes → Navegador**: label = "HTML + JS hidratado" (esta es la respuesta que llega al usuario)

### Paso 7 — Leyenda para "cómo se actualiza la interfaz"

En una esquina, agregá una notita corta:

> **Flujo de actualización:**
> 1. Usuario clickea "Agregar"
> 2. Componente dispatcha acción
> 3. Reducer actualiza state
> 4. React re-renderiza componentes que dependen del state
> 5. localStorage se sincroniza vía useEffect

Esto cubre el ítem **"Explica cómo se actualiza la interfaz"** (2 pts).

### Paso 8 — Colores y estética

- Para Server Components: borde verde (representa "corre en servidor").
- Para Client Components: borde azul (representa "corre en cliente").
- Esto le va a llamar la atención al profe y te da pie a explicar la diferencia Server/Client cuando te pregunten.

En Excalidraw: seleccioná una caja → en el panel lateral derecho podés cambiar `Stroke` color.

### Paso 9 — Exportar

Una vez listo:
1. Click en el menú hamburguesa arriba a la izquierda → **"Export image"**.
2. Formato: **PNG**.
3. Background: **Transparent** o blanco (recomiendo blanco para que se vea bien en Canva).
4. Scale: **3x** (alta resolución).
5. Click "Export".
6. Se descarga `excalidraw-XXXX.png`.
7. Renombralo a `diagrama-arquitectura.png`.

### Paso 10 — Guardalo en el repo

Movelo a `public/img/` para que quede versionado:

```
public/img/diagrama-arquitectura.png
```

Después podés hacer:

```bash
git add public/img/diagrama-arquitectura.png
git commit -m "docs: add architecture diagram for parcial"
git push
```

---

## Cuando hagas el diagrama, mandame screenshot

Si querés revisarlo antes del oral, abrí una sesión de Claude Code y mostrame el PNG. Te lo reviso contra los 6 ítems de la rúbrica y te digo qué falta o qué reforzar.

---

## Tip de oro para el oral

El profe va a poner el diagrama en pantalla mientras hablás. **Practicá señalar partes con el dedo / cursor** mientras explicás. Algo como:

> "Acá está el usuario [señala]. Cuando hace click en 'Agregar al carrito' [señala el componente], se dispara una acción [señala la flecha] que actualiza el estado global [señala la caja de Context], y React vuelve a renderizar el header con el nuevo número del badge [señala el header]."

Si **no podés explicar tu propio diagrama señalando**, te baja la nota. La rúbrica dice explícitamente: **"Puede justificar cada parte verbalmente (2 pts)"**.
