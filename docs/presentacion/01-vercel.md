# Conectar Vercel al repo (10 min)

Vercel es el servicio que va a desplegar tu proyecto Next.js automáticamente cada vez que pushees a `main`. Esto es lo que se llama **CI/CD**: continuous integration / continuous deployment. Tener esto andando suma muchos puntos en el **Módulo 1** del oral.

## Qué vas a tener al final

- Una URL pública del estilo `polytape-mateoburger22.vercel.app` que cualquiera puede abrir.
- Cada `git push origin main` desencadena un nuevo deploy automático en ~2 minutos.
- Un dashboard donde podés ver el historial de deploys, logs, etc. → buen material para screenshot en la slide 5.

---

## Paso a paso

### 1. Crear cuenta (si no tenés)

Andá a 👉 **https://vercel.com**

Click en **"Sign Up"** arriba a la derecha → **"Continue with GitHub"**.

Te va a pedir permiso para acceder a tu cuenta de GitHub. Aceptá. Es la forma más rápida porque no tenés que crear una cuenta nueva.

### 2. Importar el proyecto

Una vez adentro del dashboard:

1. Click en el botón grande **"Add New..."** → **"Project"**.
2. Vas a ver una lista de tus repos de GitHub. Buscá **`CIMAT-ITBA`**.
3. Si no lo ves, hacé click en **"Adjust GitHub App Permissions"** y dale acceso a ese repo específico (o a todos).
4. Click en **"Import"** al lado de `CIMAT-ITBA`.

### 3. Configurar el deploy (no toques nada, solo confirmá)

En la pantalla "Configure Project" vas a ver:

- **Framework Preset**: `Next.js` ← debería detectarlo automáticamente. Si no, elegilo del dropdown.
- **Root Directory**: `./` ← dejalo así. Por eso movimos todo a la raíz en el Bloque 6.
- **Build Command**: `npm run build` ← default OK.
- **Output Directory**: dejalo en blanco (Next maneja esto solo).
- **Environment Variables**: ninguna por ahora. Vacío OK.

Click en **"Deploy"**.

### 4. Esperar el primer deploy (~2-3 min)

Vercel va a:
1. Clonar tu repo.
2. Correr `npm install`.
3. Correr `npm run build`.
4. Subir el resultado a su CDN.
5. Asignarte una URL pública.

Vas a ver una pantalla con confeti cuando termine. Ahí te da la URL.

### 5. Verificar que anda

Abrí la URL que te dio Vercel (algo tipo `cimat-itba-xxx.vercel.app`). Probá:

- Home → debería verse igual que en localhost.
- Catálogo → cards funcionan, "Agregar al carrito" funciona.
- Ficha de producto → click en "Ver detalle" → URL como `/productos/cimat-rw-050`.
- Refrescá: el carrito persiste (localStorage). Esto demuestra que el frontend funciona.

---

## Para la slide 5 del oral, sacá estas 2 capturas

### Captura A: Dashboard de Vercel
1. Andá a https://vercel.com/dashboard
2. Click en tu proyecto.
3. Vas a ver "Deployments" con uno verde marcado "Production".
4. Tomá screenshot de la página principal (con la URL pública visible y el deploy "Ready").

### Captura B: La app andando en producción
1. Abrí la URL pública de Vercel.
2. Tomá screenshot de la home con el header CIMAT visible.

Estas dos imágenes van en la slide 5.

---

## Qué decir en el oral cuando hablen de CI/CD (Módulo 1)

> "El proyecto está conectado a Vercel mediante GitHub. Cada vez que mergeo cambios a `main` y hago push, Vercel detecta el push automáticamente, clona el repo, corre `npm run build`, y despliega la versión nueva en cuestión de minutos. La URL pública se actualiza sin que yo toque un servidor. Esto es CI/CD: el código pasa del repositorio a producción sin pasos manuales, lo que permite iterar rápido y reduce errores humanos."

Este párrafo te lo aprendés y lo soltás cuando te pregunten "cómo llega tu código a producción". Es respuesta de **Excelente** en la rúbrica.

---

## Si algo falla durante el deploy

Caso típico: build error en Vercel. Para verlo:

1. En el dashboard, click en el deploy fallido.
2. Click en "View Build Logs".
3. Buscá la línea con `Error:` en rojo.
4. Mandame el error en una nueva sesión de Claude Code y lo arreglamos.

Casos que ya descartamos:
- "Detected additional lockfiles" → ya lo resolvimos al mover Next a la raíz.
- "node_modules not found" → Vercel corre `npm install` solo, no es problema.
- "Cannot find module '@/...'" → el alias está bien configurado en `jsconfig.json`.

El build debería funcionar al primer intento porque ya verificamos `npm run build` localmente y compila ✓.
