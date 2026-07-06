# Sesión 17 — Diagnóstico y fix del login/registro (cookies de sesión)

- **Fecha:** 2026-07-01
- **Fase del proyecto:** 5 (Backend con Supabase)
- **Herramienta de IA:** Claude Code (modelo Opus 4.8, 1M contexto)

## Objetivo de la sesión

Verificar si el ecommerce realmente funcionaba de punta a punta contra Supabase
(no solo "estar conectado") y arreglar lo que estuviera roto, hasta que el flujo
de un usuario cualquiera —registrarse, iniciar sesión, agregar al carrito— ande
como en una tienda normal.

---

## Cómo se diagnosticó (proceso, no adivinanza)

El valor de esta sesión está en el método: en vez de asumir, se fue aislando la
falla con pruebas que descartan variables una por una.

1. **Estado real de la base.** Se contó lo que había: 9 productos, 1 usuario, 0
   carrito, 0 órdenes. Nadie había completado nunca una compra.
2. **Login que no dejaba entrar.** Primer hallazgo: el usuario tenía
   `email_confirmed_at = null`. El log de la sesión 16 afirmaba que Supabase
   "auto-confirma"; era falso: el default de Supabase **exige** confirmar email.
3. **Se aisló Supabase del front.** Se probó el login directo contra la API de
   Supabase (`/auth/v1/token`) con curl: **funcionó**. Conclusión: Supabase, el
   usuario y la contraseña estaban perfectos → el bug estaba en la app Next.
4. **Se aisló la base del carrito.** Se insertó una fila en `cart_items` usando
   el token real del usuario vía REST: **funcionó**. Conclusión: base, RLS y
   esquema OK → el carrito fallaba por falta de sesión en el navegador.
5. **Página de diagnóstico temporal** (`/api/debug-auth`): reveló
   `total_cookies: 0`. El navegador no tenía NINGUNA cookie tras el login.
6. **Se probó que el navegador sí guarda cookies** con un Route Handler de
   prueba: al loguear por un endpoint, la cookie se guardaba y el servidor veía
   la sesión (`servidor_ve_usuario: true`). Entonces el problema era específico
   del **formulario (Server Action)**.
7. **Logs dentro del código de cookies.** Se instrumentó el `setAll` de
   `lib/supabase/server.js`. Resultado decisivo: al loguear por el formulario,
   `POST /login 303` corría el login **pero nunca se ejecutaba `setAll`** → la
   cookie de sesión jamás se escribía.

## Causa raíz

En esta versión de Next.js (16.2.4), **las cookies que Supabase intenta escribir
dentro de una Server Action no se persisten en el navegador**. El login, el
registro y el logout usaban Server Actions → los tres perdían la sesión.

Un Route Handler (endpoint POST) sí incluye correctamente las cookies en su
respuesta. Se confirmó con curl (`Set-Cookie: sb-...-auth-token` presente).

## Qué se cambió

- **Nuevos Route Handlers** (reemplazan a las Server Actions):
  - `app/api/auth/login/route.js` — valida, `signInWithPassword`, redirige.
  - `app/api/auth/registro/route.js` — valida, `signUp` con `full_name`, redirige.
  - `app/api/auth/logout/route.js` — `signOut`, redirige al home.
- **Formularios reescritos** como POST normal a esos endpoints (sin
  `useActionState`): `LoginForm.js`, `RegistroForm.js`. Los errores se pasan por
  `?error=...` en la URL y la página (Server Component) los traduce a un mensaje.
- **`AuthMenu.js`**: el botón "Salir" ahora postea a `/api/auth/logout`.
- **Borrados** (ya no se usan): `app/login/actions.js`, `app/registro/actions.js`,
  `lib/auth/actions.js`.
- **Config de Supabase**: se desactivó "Confirm email" (Authentication →
  Providers → Email) para que el alta abra sesión al instante.

## Punto de seguridad que se mantiene

El mensaje de error del login sigue siendo genérico ("Credenciales inválidas"):
no diferencia "email no existe" de "contraseña incorrecta", para no filtrar qué
emails están registrados.

## Verificación final (con cuentas de prueba, después borradas)

- Registro de usuario nuevo → devuelve cookie de sesión real → **queda logueado**.
- El nuevo usuario sale `email_confirmed_at` no nulo (auto-confirmado) y el
  trigger `handle_new_user` le creó la fila en `profiles` con su nombre.
- Login correcto → 303 a /catalogo con sesión. Login con contraseña mal → 303 a
  `/login?error=credenciales` (muestra el cartel).

## Decisiones para el oral

- **Por qué Route Handlers y no Server Actions para auth**: en esta versión de
  Next las Server Actions no persistían las cookies de Supabase. Un endpoint POST
  es además el patrón clásico y explícito para autenticación.
- **Por qué se desactivó la confirmación de email**: para el MVP, que el alta sea
  inmediata. En producción se reactiva junto con un SMTP propio (Resend/SendGrid)
  que garantice la entrega; el mailer gratis de Supabase es muy limitado.

## Pendiente (fases futuras)

- Checkout / crear orden real probado por un usuario (hoy hay 0 órdenes).
- Mercado Pago.
- Recuperar contraseña y edición de perfil.
- Reactivar confirmación de email con SMTP real antes de producción.
