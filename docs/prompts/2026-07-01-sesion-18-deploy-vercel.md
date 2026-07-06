# Sesión 18 — Verificación del checkout y deploy público en Vercel

- **Fecha:** 2026-07-01
- **Fase del proyecto:** 5 → 6 (de backend local a producción)
- **Herramienta de IA:** Claude Code (modelo Opus 4.8, 1M contexto)

## Objetivo

Confirmar que el flujo de compra funciona de verdad y publicar el proyecto en
Vercel para tener una tienda online accesible (además, una URL pública habilita
después el webhook de Mercado Pago sin túneles).

## 1. Verificación del checkout

- Se hizo una compra de prueba. Apareció un error de Turbopack ("Jest worker /
  EPIPE"), pero **no era un bug del código**: la orden #1 se creó bien en la base
  (total, items, envío, carrito vaciado). El crash era del servidor de desarrollo
  porque habían quedado varios `npm run dev` peleando por el puerto 3000.
- Fix: se mataron los servidores fantasma, se borró la caché `.next` y se levantó
  uno limpio. La página `/confirmacion/[id]` renderizó bien (HTTP 200).
- Aprendizaje: dejar **un solo** dev server corriendo.

## 2. Fix necesario para el build de producción

- `next build` fallaba: `generateStaticParams` de `/productos/[id]` usaba el
  cliente de Supabase con `cookies()`, y en build no hay request ni cookies.
- Fix: se agregó `lib/supabase/public.js` (cliente anon SIN cookies) y
  `lib/productos.js` pasó a usarlo. Los productos son datos públicos (RLS de
  lectura pública), así que no necesitan sesión. El build prerenderiza las 9
  fichas correctamente.
- Se probó el build local ANTES de deployar → si falla local, falla en Vercel.

## 3. Deploy en Vercel

- Repo ya estaba en GitHub (`CIMAT-ITBA`). Se pushearon los commits.
- Se importó el repo en Vercel (detecta Next.js solo).
- **Variables de entorno**: como `.env.local` no se sube, hubo que cargar en
  Vercel `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Errores resueltos en el camino (buenos para el oral):
  1. El nombre de la variable quedó duplicado/pegado → "supabaseUrl is required".
  2. El valor de la URL tenía `.supabase.com` en vez de `.supabase.co` →
     `ENOTFOUND` (DNS no resuelve).
  Corregidas ambas y redeploy → build en verde.

## Resultado

- **URL pública: https://cimat-itba.vercel.app**
- Verificado en prod: home, catálogo (9 productos desde Supabase), fichas SSG y
  endpoints de auth responden OK.
- Cada push a `main` re-deploya automáticamente.

## Decisiones para el oral

- **Por qué un cliente sin cookies para el catálogo**: los productos son públicos;
  mezclar la sesión del usuario en esa lectura rompía el build estático.
- **Las env vars van en Vercel, no en el repo**: `.env.local` está en
  `.gitignore`. La anon key es pública por diseño (protege RLS), pero igual se
  gestiona como config del entorno, no hardcodeada.

## Pendiente

- Registrar la URL de Vercel como Site URL en Supabase (Authentication → URL
  Configuration): recomendado ahora, necesario para Mercado Pago.
- Integrar Mercado Pago (Checkout Pro + webhook, ahora viable con URL pública).
- Validación de formato en el checkout; recuperar contraseña; editar perfil.
