/* ========================================================================
   lib/validators.js
   Validadores de formato compartidos entre formularios (client) y sus
   endpoints/actions (server). La regla de oro: el server SIEMPRE re-valida,
   porque los atributos del HTML (required, type=email) se sacan con F12.

   Son funciones puras (string → boolean) para poder testearlas aisladas
   (ver tests/validators.test.js).
   ======================================================================== */

// Suficiente para un form: algo@algo.algo, sin espacios.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Código postal argentino: "1425" (viejo) o "C1425DKE" (CPA nuevo).
const CP_RE = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

// Teléfono: dígitos, espacios, +, -, paréntesis; entre 6 y 20 caracteres.
const PHONE_RE = /^[\d\s()+-]{6,20}$/;

export function isValidEmail(value) {
    return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

export function isValidPostalCode(value) {
    return typeof value === 'string' && CP_RE.test(value.trim());
}

export function isValidPhone(value) {
    return typeof value === 'string' && PHONE_RE.test(value.trim());
}
