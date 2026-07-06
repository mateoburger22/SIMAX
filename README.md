# SIMAX

Ecommerce de cintas adhesivas industriales: reparación con fibra de vidrio activada con agua, aislación eléctrica, sellado de tuberías y aplicaciones de alta temperatura.

## Stack

- **Framework**: [Next.js 16](https://nextjs.org/) con App Router
- **UI**: React 19 + JavaScript (sin TypeScript)
- **Estilos**: CSS Modules + custom properties para tokens de marca
- **Base de datos + Auth**: [Supabase](https://supabase.com/) (Postgres con Row Level Security)
- **Pagos**: [Mercado Pago Checkout Pro](https://www.mercadopago.com.ar/developers) + webhook firmado
- **Tests**: Vitest (unitarios de la lógica pura: validadores, firma del webhook, sanitización)
- **CI/CD**: GitHub Actions (lint + tests en cada push/PR) + Vercel (build, deploy a producción y preview por PR)
- **Fonts**: `next/font` (Inter + Barlow Condensed self-hosted)
- **Imágenes**: `next/image` (WebP/AVIF + srcset automático)

## Cómo correrlo

```bash
npm install      # primera vez
npm run dev      # http://localhost:3000
```

Otros comandos:

```bash
npm run build    # build de producción
npm run start    # servir el build en local
npm run lint     # ESLint
npm test         # tests unitarios (Vitest)
```

### Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase (pública, RLS la limita) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **solo server**, saltea RLS |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago — **solo server** |
| `MP_WEBHOOK_SECRET` | Clave secreta del webhook de MP (verifica la firma `x-signature`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (back_urls y notification_url de MP) |

## Arquitectura

```
SIMAX/
├── app/                          # App Router — una carpeta por ruta
│   ├── layout.js                 # raíz: <html>, fonts, Header, Footer, CartProvider
│   ├── page.js                   # /  (Home)
│   ├── catalogo/                 # /catalogo (SSG, lee productos de Supabase)
│   ├── productos/[id]/           # /productos/<sku> (SSG por producto)
│   ├── carrito/                  # /carrito (cliente, useCart)
│   ├── checkout/                 # /checkout (Server Action → orden + preferencia MP)
│   ├── confirmacion/[id]/        # vuelta de MP; verifica dueño + reconcilia pago
│   ├── contacto/                 # form con validación + fetch a /api/contacto
│   ├── login/ · registro/        # auth (POST a Route Handlers)
│   ├── cuenta/pedidos/           # pedidos del usuario logueado (RLS)
│   ├── admin/                    # panel: CRUD de productos + gestión de pedidos
│   └── api/
│       ├── auth/{login,registro,logout}/  # Route Handlers de sesión
│       ├── contacto/             # guarda mensajes (valida server-side)
│       └── mp/webhook/           # webhook de MP (firma + idempotencia)
├── components/                   # componentes compartidos (.js + .module.css)
├── context/CartContext.js        # carrito global persistido en Supabase
├── lib/
│   ├── supabase/                 # clientes: browser, server (cookies), admin (service role)
│   ├── mercadopago.js            # SDK de MP (server-only)
│   ├── mpSignature.js            # verificación HMAC del webhook (pura, testeada)
│   ├── validators.js             # validadores compartidos client/server (testeados)
│   ├── sanitizeHtml.js           # lista blanca de HTML para descripciones (testeada)
│   ├── adminAuth.js              # helper: ¿la sesión es de un admin?
│   └── productos.js              # data access del catálogo
├── data/productos.js             # metadata de UI (líneas) + formatPrice
├── docs/supabase/                # SQL versionado: schema, RLS, triggers, seeds
├── tests/                        # tests unitarios (Vitest)
├── proxy.js                      # middleware de Next 16: refresca la sesión Supabase
└── .github/
    ├── workflows/ci.yml          # CI: lint + tests
    └── PULL_REQUEST_TEMPLATE.md  # checklist de PR
```

## Decisiones de seguridad (resumen)

- **RLS en todas las tablas**: cada usuario solo ve/edita lo suyo; el admin se
  verifica con `is_admin()` en Postgres, no solo en la UI.
- **Precios canónicos**: el checkout re-lee carrito y precios de la DB en el
  server; lo que manda el cliente nunca se usa para cobrar.
- **Webhook verificado**: firma HMAC `x-signature` + re-consulta del pago a la
  API de MP + chequeo de monto + update idempotente (`status = 'pendiente'`).
- **Validación doble**: todos los forms validan en cliente (UX) **y** en
  server (seguridad) — el HTML se puede editar con F12.
- **Secretos solo server**: service role key y tokens de MP sin `NEXT_PUBLIC_`,
  nunca importados desde Client Components.
- **XSS**: la descripción de producto (renderizada con `dangerouslySetInnerHTML`)
  pasa por una lista blanca que solo admite `<strong>`/`<em>`.
