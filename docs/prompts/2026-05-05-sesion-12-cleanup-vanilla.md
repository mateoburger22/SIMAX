# Sesión 12 — Limpieza del proyecto vanilla y movida del React a la raíz

- **Fecha:** 2026-05-05
- **Fase del proyecto:** 3 (React)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Una vez confirmado que la versión React funcionaba bien, eliminar todo el código del proyecto vanilla (HTML/CSS/JS) y promover el contenido de `polytape-react/` a la raíz del proyecto, dejando una estructura limpia y estándar de un proyecto React + Vite.

---

## Prompts y resultados

### Prompt 1 (continuación de sesión 11)
> "todo funciona, procede" (después de confirmar que la app React andaba bien en `http://localhost:5176`)

**Qué hizo la IA:**

1. **Verificó el estado de la raíz** del proyecto, confirmando que coexistían los archivos vanilla (los `.html`, las carpetas `css/`, `js/`, `assets/`) y la subcarpeta `polytape-react/` con la app nueva.

2. **Comparó los `.gitignore`** de la raíz y de `polytape-react/`. El de la raíz era más completo (cubría `.next/`, `dist/`, `.env`, etc.), así que se conservó ese y se descartó el de la subcarpeta.

3. **Borró todo lo vanilla** de la raíz:
   - Archivos: `index.html`, `catalogo.html`, `carrito.html`, `checkout.html`, `confirmacion.html`.
   - Carpetas: `css/`, `js/`, `assets/`.

4. **Movió el contenido de `polytape-react/` a la raíz**: `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `node_modules/`, `public/`, `src/`. Hubo dos contratiempos:
   - La primera vez `src/` no se pudo mover porque el dev server de Vite estaba corriendo y tenía los archivos abiertos (Windows bloquea archivos en uso). Se le pidió al alumno cerrar la terminal con Vite.
   - Aún después de cerrar, `src/` seguía bloqueado (probablemente por VS Code teniendo el workspace abierto). Solución: en vez de `mv`, se usó `cp -r` para copiar `src/` a la raíz.
   - La carpeta vacía `polytape-react/` quedó sin poder borrarse desde el shell por el mismo bloqueo de Windows. Se le indicó al alumno que la borre desde el Explorador después de cerrar VS Code.

5. **Verificó** que `npm run dev` ejecutado desde la raíz nueva arrancara la app correctamente. El alumno confirmó que sí.

**Por qué (decisiones técnicas):**

- **Por qué subir el React a la raíz en vez de dejarlo en una subcarpeta**: la convención de un proyecto React es tener `package.json`, `vite.config.js` y `src/` en la raíz. Tenerlo en una subcarpeta requiere `cd polytape-react/` para cualquier comando, complica el deploy (Vercel/Netlify esperan el package.json en la raíz por defecto) y rompe herramientas como GitHub Pages.
- **Por qué borrar el vanilla en vez de dejarlo de respaldo**: el código viejo queda en la **historia de git** (commits anteriores), así que para el examen oral se puede mostrar la progresión navegando por commits. No hace falta tenerlo en el árbol de archivos actual.
- **Por qué no tocar `docs/`**: ahí viven todos los logs de prompts (sesión 00 a 11). Esos sí son la "memoria" del proceso para el oral y no se pueden reconstruir desde git.
- **`cp -r` vs `mv` en Windows**: Windows mantiene file locks más agresivamente que Linux/Mac. Si un proceso tiene un archivo abierto (aunque no esté escribiendo), no se puede mover. `cp` puede funcionar incluso con locks porque solo lee el archivo. Por eso después de copiar quedó la carpeta vacía sin poder borrarse — pero como el contenido ya estaba en la raíz, no era bloqueante.
- **Puerto 5176**: Vite usa por defecto el 5173, pero como había varias instancias previas corriendo (el alumno había hecho varios intentos antes de la limpieza), saltó al primer puerto libre. No es un problema, solo un side effect de ejecutar `npm run dev` varias veces sin cerrar las instancias.

**Qué entendí yo:**
- El "estado final" de un proyecto React tiene una estructura estándar (package.json + src/ en la raíz). Tenerlo en otro lado es contra-convención.
- Los prompt logs (`docs/`) son tan importantes como el código mismo: el código se puede reconstruir, los prompts no.
- Windows tiene un problema con los file locks: si una herramienta tiene un archivo abierto, no podés moverlo. La solución suele ser cerrar la herramienta o copiar en vez de mover.
- `git log` mantiene toda la historia: aunque borre un archivo del árbol actual, sigue existiendo en commits anteriores y puedo recuperarlo con `git show <commit>:<archivo>`.

---

## Conclusión de la sesión

**Listo:**
- Estructura final del proyecto en la raíz: `package.json`, `index.html`, `vite.config.js`, `src/`, `node_modules/`, `public/`, `docs/`, `.git/`, `.gitignore`, `README.md`.
- Comando `npm run dev` desde la raíz arranca la app y todo funciona igual que antes.
- Cero archivos vanilla en el árbol actual (siguen disponibles en la historia de git si los necesito para el oral).

**Pendiente:**
- Borrar manualmente la carpeta vacía `polytape-react/` desde el Explorador de Windows después de cerrar VS Code.
- Reabrir VS Code apuntando a la nueva raíz como workspace.
- En la próxima sesión: páginas que faltan (`producto.html` y `contacto.html`) o seguir con la migración a Next (Fase 4).