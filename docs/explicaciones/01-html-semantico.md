# 01 — HTML semántico

> Concepto evaluado en el Módulo 2 del parcial (HTML, CSS, JavaScript — 25 pts).

## Qué es HTML semántico

HTML semántico significa **usar la etiqueta correcta para cada parte de la página**, según el rol que cumple ese contenido. No es lo mismo `<div>` que `<header>`, aunque visualmente puedan verse iguales.

Un `<div>` es una caja vacía de significado: sirve para agrupar pero no le dice nada a nadie. Un `<header>`, `<nav>`, `<main>`, `<section>` o `<footer>` **comunica intención**: este bloque es el encabezado, este es el menú principal, este es el contenido principal, etc.

## Por qué importa

1. **Accesibilidad:** los lectores de pantalla (para personas con discapacidad visual) navegan saltando entre regiones (`<header>`, `<nav>`, `<main>`...). Si todo es `<div>`, no pueden saltar — tienen que escuchar todo.
2. **SEO:** Google entiende mejor la estructura del contenido. Un `<article>` le dice "esto es una pieza de contenido autónoma"; un `<nav>` le dice "estos son los enlaces de navegación". Mejora el ranking.
3. **Mantenibilidad:** abrís el HTML seis meses después y entendés qué es cada cosa sin leer el CSS.
4. **Es lo que pide la rúbrica:** la matriz del parcial dice "Justifica uso de HTML semántico" en el nivel Excelente del Módulo 2.

## Las etiquetas que usé en `index.html`

| Etiqueta | Para qué sirve | Dónde la usé |
|----------|----------------|--------------|
| `<header>` | Encabezado del sitio o de una sección | Barra superior con logo y navegación |
| `<nav>` | Bloque de enlaces de navegación | Menú principal (`aria-label="Navegación principal"`) y menú del footer |
| `<main>` | Contenido principal único de la página | Todo lo que hay entre el header y el footer |
| `<section>` | Sección temática con su propio encabezado | Hero, líneas de productos, "por qué CIMAT", CTA |
| `<article>` | Contenido autónomo, reutilizable fuera del contexto | Cada card de categoría de producto |
| `<footer>` | Pie de página del sitio o de una sección | Pie del sitio con contacto y enlaces |
| `<ul>` / `<li>` | Lista de elementos sin orden jerárquico | Menús, lista de features, lista de categorías |
| `<h1>` a `<h3>` | Jerarquía de títulos | Un solo `<h1>` por página (en el hero); `<h2>` para cada sección; `<h3>` dentro |

## Reglas que seguí (y por qué)

1. **Un solo `<h1>` por página.** Es el título principal. Tener varios confunde a los lectores de pantalla y al SEO. El `<h1>` está en el hero: "Soluciones técnicas para la industria que no se detiene."
2. **Jerarquía de títulos sin saltos.** `<h1>` → `<h2>` → `<h3>`. No salté de `<h1>` a `<h3>`.
3. **`<nav aria-label="...">`.** Si tengo dos `<nav>` (principal y footer), aclaro a cuál se refiere cada uno con `aria-label`.
4. **`aria-current="page"`** en el link "Inicio" del menú: indica al navegador y a los lectores de pantalla que esa es la página actual.
5. **`<a class="skip-link" href="#main">`** al principio del body: enlace oculto que aparece al recibir foco con Tab. Permite a usuarios de teclado saltarse el menú e ir directo al contenido.
6. **`alt` descriptivo en imágenes.** El logo tiene `alt="CIMAT"` (es un wordmark, el nombre ES la imagen).
7. **`<img>` decorativas con `aria-hidden="true"`.** En la banda inferior del hero usé un `<div aria-hidden="true">` porque es decoración pura, no aporta información.

## Cómo se relaciona esto con accesibilidad y ARIA

ARIA (Accessible Rich Internet Applications) son atributos extra (`aria-label`, `aria-current`, `aria-hidden`, `aria-labelledby`...) que se agregan **cuando el HTML semántico solo no alcanza**. La regla de oro: **usar HTML semántico primero, ARIA solo cuando no hay otra opción**.

En el home usé:
- `aria-label` en los `<nav>` (porque hay más de uno).
- `aria-labelledby` en cada `<section>` apuntando al ID de su título — así un lector de pantalla anuncia el nombre de la sección al entrar.
- `aria-current="page"` en el enlace de la página actual.
- `aria-hidden="true"` en elementos puramente decorativos (números 01-04, banda inferior del hero).

## Cómo lo explico en el oral (resumen de bolsillo)

> "Usé HTML semántico porque comunica intención. `<header>` es el encabezado, `<nav>` es el menú, `<main>` es el contenido principal, `<section>` agrupa por tema, `<article>` es contenido autónomo, `<footer>` es el pie. Esto sirve para accesibilidad (lectores de pantalla saltan entre regiones), para SEO (Google entiende la estructura) y para mantener el código legible. Donde el HTML solo no alcanza, agregué ARIA: `aria-label` para distinguir los dos `<nav>`, `aria-current` para marcar la página actual, `aria-hidden` para decoración."
