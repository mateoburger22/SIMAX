/* ========================================================================
   tests/sanitizeHtml.test.js
   Tests de la lista blanca de HTML para la descripción de productos
   (que la ficha pública renderiza con dangerouslySetInnerHTML).
   ======================================================================== */

import { describe, it, expect } from 'vitest';
import { sanitizeDescription } from '../lib/sanitizeHtml.js';

describe('sanitizeDescription', () => {
    it('conserva <strong> y <em> exactos', () => {
        expect(sanitizeDescription('Cinta <strong>reforzada</strong>')).toBe(
            'Cinta <strong>reforzada</strong>'
        );
        expect(sanitizeDescription('Uso <em>industrial</em>')).toBe(
            'Uso <em>industrial</em>'
        );
    });

    it('elimina <script> (XSS almacenado)', () => {
        expect(
            sanitizeDescription('Hola <script>alert("xss")</script> mundo')
        ).toBe('Hola alert("xss") mundo');
    });

    it('elimina tags con atributos, incluso strong/em', () => {
        expect(
            sanitizeDescription('<strong onclick="hack()">texto</strong>')
        ).toBe('texto</strong>');
        expect(sanitizeDescription('<img src=x onerror=alert(1)>')).toBe('');
    });

    it('elimina otros tags comunes', () => {
        expect(sanitizeDescription('<a href="http://evil">link</a>')).toBe(
            'link'
        );
        expect(sanitizeDescription('<iframe src="x"></iframe>')).toBe('');
    });

    it('devuelve el valor tal cual si viene vacío o null', () => {
        expect(sanitizeDescription('')).toBe('');
        expect(sanitizeDescription(null)).toBe(null);
        expect(sanitizeDescription(undefined)).toBe(undefined);
    });

    it('deja el texto plano intacto', () => {
        expect(sanitizeDescription('Cinta de 5 metros x 25 mm')).toBe(
            'Cinta de 5 metros x 25 mm'
        );
    });
});
