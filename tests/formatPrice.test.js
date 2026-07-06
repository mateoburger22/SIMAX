/* ========================================================================
   tests/formatPrice.test.js
   Tests del helper de formato de precios (pesos argentinos).
   ======================================================================== */

import { describe, it, expect } from 'vitest';
import { formatPrice } from '../data/productos.js';

describe('formatPrice', () => {
    it('formatea con separador de miles es-AR', () => {
        expect(formatPrice(1000)).toBe('$' + (1000).toLocaleString('es-AR'));
        expect(formatPrice(25990)).toBe('$' + (25990).toLocaleString('es-AR'));
    });

    it('formatea el cero', () => {
        expect(formatPrice(0)).toBe('$0');
    });

    it('no explota con null/undefined (dato faltante en una fila vieja)', () => {
        expect(formatPrice(null)).toBe('$0');
        expect(formatPrice(undefined)).toBe('$0');
    });

    it('acepta números que llegan como string desde la DB', () => {
        expect(formatPrice('1500')).toBe('$' + (1500).toLocaleString('es-AR'));
    });
});
