/* ========================================================================
   lib/mpSignature.js
   Verificación de la firma HMAC que Mercado Pago manda en cada webhook.

   MP firma cada notificación con el "secret" del webhook (se copia del
   panel de MP → Webhooks → Clave secreta, env var MP_WEBHOOK_SECRET).
   El header `x-signature` trae `ts=<timestamp>,v1=<hmac>`. La firma se
   calcula sobre el "manifest":

       id:<data.id en minúsculas>;request-id:<x-request-id>;ts:<ts>;

   (si falta x-request-id, esa parte se omite del manifest, según la doc
   oficial). Si el HMAC-SHA256 del manifest con nuestro secret coincide
   con v1, la notificación es auténtica: la mandó MP y nadie la alteró.

   Es una función pura (headers + secret → boolean) para poder testearla
   sin levantar el server (ver tests/mpSignature.test.js).
   ======================================================================== */

import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyMpSignature({ xSignature, xRequestId, dataId, secret }) {
    if (!secret || !xSignature || !dataId) return false;

    // Parsear "ts=123,v1=abc" → { ts: '123', v1: 'abc' }
    const parts = {};
    for (const chunk of xSignature.split(',')) {
        const [key, value] = chunk.split('=').map((s) => s?.trim());
        if (key && value) parts[key] = value;
    }
    if (!parts.ts || !parts.v1) return false;

    let manifest = `id:${String(dataId).toLowerCase()};`;
    if (xRequestId) manifest += `request-id:${xRequestId};`;
    manifest += `ts:${parts.ts};`;

    const expected = createHmac('sha256', secret).update(manifest).digest('hex');

    // Comparación en tiempo constante: evita que un atacante deduzca la
    // firma byte a byte midiendo cuánto tarda la comparación.
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1);
    return a.length === b.length && timingSafeEqual(a, b);
}
