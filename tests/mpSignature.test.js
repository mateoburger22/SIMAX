/* ========================================================================
   tests/mpSignature.test.js
   Tests de la verificación de firma del webhook de Mercado Pago.
   Simulamos lo que hace MP: firmar el manifest con HMAC-SHA256 y el
   secret compartido, y chequeamos que nuestra verificación acepte la
   firma buena y rechace las adulteradas.
   ======================================================================== */

import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyMpSignature } from '../lib/mpSignature.js';

const SECRET = 'super-secreto-de-prueba';

// Arma el header x-signature como lo manda MP.
function sign({ dataId, requestId, ts }) {
    let manifest = `id:${String(dataId).toLowerCase()};`;
    if (requestId) manifest += `request-id:${requestId};`;
    manifest += `ts:${ts};`;
    const v1 = createHmac('sha256', SECRET).update(manifest).digest('hex');
    return `ts=${ts},v1=${v1}`;
}

describe('verifyMpSignature', () => {
    it('acepta una firma legítima', () => {
        const xSignature = sign({ dataId: '12345', requestId: 'req-1', ts: '1700000000' });
        expect(
            verifyMpSignature({
                xSignature,
                xRequestId: 'req-1',
                dataId: '12345',
                secret: SECRET,
            })
        ).toBe(true);
    });

    it('acepta cuando no hay x-request-id (parte opcional del manifest)', () => {
        const xSignature = sign({ dataId: '12345', requestId: null, ts: '1700000000' });
        expect(
            verifyMpSignature({
                xSignature,
                xRequestId: null,
                dataId: '12345',
                secret: SECRET,
            })
        ).toBe(true);
    });

    it('rechaza si el payment id fue adulterado', () => {
        const xSignature = sign({ dataId: '12345', requestId: 'req-1', ts: '1700000000' });
        expect(
            verifyMpSignature({
                xSignature,
                xRequestId: 'req-1',
                dataId: '99999', // otro pago
                secret: SECRET,
            })
        ).toBe(false);
    });

    it('rechaza si el secret no coincide', () => {
        const xSignature = sign({ dataId: '12345', requestId: 'req-1', ts: '1700000000' });
        expect(
            verifyMpSignature({
                xSignature,
                xRequestId: 'req-1',
                dataId: '12345',
                secret: 'otro-secret',
            })
        ).toBe(false);
    });

    it('rechaza firmas malformadas o faltantes', () => {
        expect(
            verifyMpSignature({
                xSignature: null,
                xRequestId: 'req-1',
                dataId: '12345',
                secret: SECRET,
            })
        ).toBe(false);
        expect(
            verifyMpSignature({
                xSignature: 'basura-sin-formato',
                xRequestId: 'req-1',
                dataId: '12345',
                secret: SECRET,
            })
        ).toBe(false);
        expect(
            verifyMpSignature({
                xSignature: 'ts=1700000000,v1=deadbeef',
                xRequestId: 'req-1',
                dataId: '12345',
                secret: SECRET,
            })
        ).toBe(false);
    });

    it('rechaza si no hay secret configurado', () => {
        const xSignature = sign({ dataId: '12345', requestId: 'req-1', ts: '1700000000' });
        expect(
            verifyMpSignature({
                xSignature,
                xRequestId: 'req-1',
                dataId: '12345',
                secret: '',
            })
        ).toBe(false);
    });
});
