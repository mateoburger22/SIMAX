# Checklist de rúbrica → evidencia

Mapeo de cada criterio de `estandar.md` (columna **Excelente**) a dónde está
resuelto en el proyecto. Para repasar antes de la defensa.

## E1 — Repo + pipeline + preview (10%)

> "Repo operativo, pipeline CI/CD y preview por PR funcionando correctamente."

- Repo: https://github.com/mateoburger22/CIMAT-ITBA
- CI: `.github/workflows/ci.yml` — ESLint + tests unitarios en cada push/PR.
- CD: Vercel conectado al repo — push a `main` deploya a producción.
- Preview por PR: Vercel genera una URL de preview automática en cada PR.
- Checklist en PRs: `.github/PULL_REQUEST_TEMPLATE.md`.

## E2 — Landing + vistas clave responsivas (15%)

> "Maquetado semántico, responsive, accesible y visualmente consistente."

- Semántica: landmarks `header/nav/main/footer`, `<address>` en footer,
  jerarquía de headings corregida (ítems del carrito en `h3`), breadcrumbs
  con `ol` + `aria-current`, resumen con `dl/dt/dd`.
- Accesible: skip-link, `:focus-visible` global, `aria-label` en botones de
  ícono, contraste AA (token `--color-yellow-dark` oscurecido a `#806400`),
  lightbox con focus trap + restauración de foco, Escape cierra menú mobile
  y dropdowns, contadores con `role="group"`, badge del carrito con región
  `aria-live`.
- Responsive: mobile-first, media queries en todas las vistas, `clamp()` en
  espaciados/logo, imágenes fluidas.

## E3 — Formularios dinámicos con fetch + validación (15%)

> "DOM dinámico, validación robusta y fetch integrado correctamente."

- `/contacto`: validación JS por campo (`aria-invalid` + `aria-describedby`),
  fetch POST a `/api/contacto` con `try/catch`, chequeo de `res.ok`, estado
  de carga (botón deshabilitado) y error del server visible. El endpoint
  re-valida todo y persiste en Supabase (`contact_messages`).
- Login/registro: validación nativa del navegador + re-validación server-side
  (presencia, formato de email, longitud de contraseña) + botón deshabilitado
  durante el submit.
- Checkout: `useActionState` con `isPending`, validación de formato de
  email/teléfono/CP en el server (`lib/validators.js`, testeado).

## E4 — Catálogo navegable + API básica (20%)

> "Catálogo + API interna, lógica funcional y checklist en PRs."

- Catálogo: `/catalogo` (SSG desde Supabase) + fichas `/productos/[sku]`
  prerenderizadas con `generateStaticParams` + `revalidatePath` cuando el
  admin muta el catálogo.
- API interna: Route Handlers (`/api/auth/*`, `/api/contacto`,
  `/api/mp/webhook`) + Server Actions (checkout, CRUD admin).
- Checklist en PRs: `.github/PULL_REQUEST_TEMPLATE.md`.

## E5 — CRUD funcional en Supabase + admin (20%)

> "BD modelada, CRUD completo, persistencia y admin funcional."

- BD modelada: `docs/supabase/01-schema.sql` — FKs con `ON DELETE` pensados
  (histórico de pedidos sobrevive al borrado de productos), constraints
  (`quantity > 0`, CHECK de estados de orden en `08-order-status-check.sql`).
- RLS: `02-policies.sql` + rol admin con `is_admin()` (`06-admin-role.sql`),
  con trigger anti auto-ascenso de rol.
- CRUD completo: `/admin/productos` (crear, listar, editar, eliminar con
  confirmación) + `/admin/pedidos` (ver todo, cambiar estado). Toda mutación
  re-verifica `isAdmin` en el server y pasa por RLS.
- Validación server-side del admin: precio vacío rechazado, descripción
  sanitizada (lista blanca anti-XSS), errores de DB visibles en la UI.

## E6 — Checkout + webhook funcionales (20%)

> "Pagos + webhooks, demo operativa y pruebas exhaustivas."

- Checkout Pro: orden + items + preferencia creados server-side con precios
  canónicos de la DB; reuso de la orden pendiente (sin duplicados).
- Webhook `/api/mp/webhook`: verificación de firma HMAC (`lib/mpSignature.js`),
  re-consulta del pago a la API de MP, chequeo de monto, idempotencia
  (`.eq('status','pendiente')`), manejo de `approved`/`cancelled`/`rejected`,
  500 ante fallo de DB para que MP reintente, logs por rama.
- Confirmación: verifica dueño vía RLS + reconciliación de respaldo.
- Pruebas: `tests/` (Vitest) — firma del webhook, validadores, sanitización,
  formato de precios. `npm test` local y en CI.

## Transversales

- **Funcionalidad (40%)**: flujo completo demo-able — registro → catálogo →
  carrito → checkout → pago sandbox MP → webhook → pedido "pagada" →
  admin lo gestiona.
- **Código (20%)**: módulos puros testeados en `lib/`, manejo de errores en
  todas las mutaciones (CartContext, admin, webhook), sin secretos en el
  cliente, lint limpio.
- **Interfaz/Accesibilidad (15%)**: ver E2.
- **Despliegue (15%)**: https://cimat-itba.vercel.app (público y estable).
- **Documentación (10%)**: README actualizado, SQL versionado en
  `docs/supabase/`, prompts en `docs/prompts/`, este checklist.
