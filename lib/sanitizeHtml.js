/* ========================================================================
   lib/sanitizeHtml.js
   La descripción de un producto admite un mínimo de HTML (<strong>, <em>)
   porque la ficha pública la renderiza con dangerouslySetInnerHTML.
   Eso abre la puerta a XSS almacenado: un <script> guardado en la base se
   ejecutaría en el navegador de CADA visitante de la ficha.

   Defensa: lista blanca. Se conservan SOLO los tags <strong>/<em> exactos
   (sin atributos — un <strong onclick=...> también se borra) y cualquier
   otro tag se elimina. Función pura para poder testearla
   (ver tests/sanitizeHtml.test.js).
   ======================================================================== */

export function sanitizeDescription(input) {
    if (!input) return input;
    // Borra todo lo que parezca un tag salvo <strong>, </strong>, <em>, </em>
    // escritos exactamente así (la lista blanca no admite atributos).
    return input.replace(/<(?!\/?(?:strong|em)>)[^>]*>?/gi, '');
}
