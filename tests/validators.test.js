/* ========================================================================
   tests/validators.test.js
   Tests de los validadores compartidos entre formularios y endpoints.
   Se corren con `npm test` (Vitest) y en el CI de GitHub Actions.
   ======================================================================== */

import { describe, it, expect } from 'vitest';
import {
    isValidEmail,
    isValidPostalCode,
    isValidPhone,
} from '../lib/validators.js';

describe('isValidEmail', () => {
    it('acepta emails normales', () => {
        expect(isValidEmail('mateo@example.com')).toBe(true);
        expect(isValidEmail('nombre.apellido+tag@empresa.com.ar')).toBe(true);
    });

    it('acepta con espacios alrededor (los trimea)', () => {
        expect(isValidEmail('  mateo@example.com  ')).toBe(true);
    });

    it('rechaza formatos inválidos', () => {
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('sin-arroba.com')).toBe(false);
        expect(isValidEmail('dos@@arrobas.com')).toBe(false);
        expect(isValidEmail('sin@dominio')).toBe(false);
        expect(isValidEmail('con espacios@mail.com')).toBe(false);
    });

    it('rechaza valores que no son string', () => {
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail(undefined)).toBe(false);
        expect(isValidEmail(123)).toBe(false);
    });
});

describe('isValidPostalCode', () => {
    it('acepta el CP numérico viejo (4 dígitos)', () => {
        expect(isValidPostalCode('1425')).toBe(true);
    });

    it('acepta el CPA nuevo (letra + 4 dígitos + 3 letras)', () => {
        expect(isValidPostalCode('C1425DKE')).toBe(true);
        expect(isValidPostalCode('b1900aaa')).toBe(true); // case-insensitive
    });

    it('rechaza otros formatos', () => {
        expect(isValidPostalCode('')).toBe(false);
        expect(isValidPostalCode('123')).toBe(false);
        expect(isValidPostalCode('12345')).toBe(false);
        expect(isValidPostalCode('ABCD')).toBe(false);
    });
});

describe('isValidPhone', () => {
    it('acepta formatos comunes', () => {
        expect(isValidPhone('11 4000-0000')).toBe(true);
        expect(isValidPhone('+54 9 11 4000 0000')).toBe(true);
        expect(isValidPhone('(011) 4000-0000')).toBe(true);
    });

    it('rechaza texto, muy corto o muy largo', () => {
        expect(isValidPhone('')).toBe(false);
        expect(isValidPhone('llamame')).toBe(false);
        expect(isValidPhone('123')).toBe(false);
        expect(isValidPhone('1'.repeat(25))).toBe(false);
    });
});
