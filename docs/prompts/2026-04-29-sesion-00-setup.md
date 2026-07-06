# Sesión 00 — Setup inicial y arranque del proyecto

- **Fecha:** 2026-04-29
- **Fase del proyecto:** Pre-fase (preparación)
- **Herramienta de IA:** Claude Code (modelo Opus 4.7)

## Objetivo de la sesión

Definir el alcance del proyecto, dejar la carpeta limpia, armar la estructura de documentación obligatoria del parcial y acordar el flujo de trabajo con la IA.

---

## Prompts y resultados

### Prompt 1
> Le expliqué a la IA que estoy cursando Programación Web 71.38, que el proyecto consiste en armar un ecommerce con IA siguiendo la progresión HTML/CSS → JS → React → Next, y que el profe evalúa el proceso por encima del producto. Le pasé el PDF del parcial.

**Qué hizo la IA:**
- Leyó el PDF completo del parcial (modalidad, matriz de evaluación, requisitos del Momento 4).
- Guardó tres memorias persistentes: rol del usuario, plan del proyecto y feedback sobre cómo explicar cada cambio.
- Hizo preguntas de contexto (parcial, producto, setup técnico, flujo de trabajo).

**Por qué:**
- Antes de programar, la IA necesita entender el contexto para no adelantarse de fase ni recomendar tecnologías que el profesor no quiere ver todavía.
- La memoria persistente sirve para que en próximas sesiones la IA arranque con todo el contexto sin que yo lo repita.

**Qué entendí yo:**
- Claude Code guarda transcripciones automáticas de cada sesión en `~/.claude/projects/<proyecto>/`.
- Además del transcript automático, voy a llevar este registro de prompts en formato Markdown porque es entregable obligatorio del Momento 4.

---

### Prompt 2
> Le respondí las preguntas: el parcial es el jueves 7 de mayo, la marca se llama CIMAT (cintas adhesivas industriales), pedí que borre las imágenes sueltas, ya tengo Node/Git/GitHub, voy a usar Vercel y VS Code, arrancamos en fase 1, y le pedí que armara `docs/prompts/` y un documento aparte de explicaciones.

**Qué hizo la IA:**
- Eliminó las imágenes sueltas de la raíz (`12.jpeg`, `SIMEX.jpeg`, una de WhatsApp).
- Creó `README.md` en la raíz con la descripción del proyecto y las fases.
- Creó la carpeta `docs/prompts/` con `_plantilla.md` (formato a seguir) y este archivo (sesión 00).
- Creó la carpeta `docs/explicaciones/` con un README explicando para qué sirve.
- Actualizó las memorias con el nombre de la marca, el producto y la fecha del parcial.

**Por qué:**
- Limpiar la raíz para que el repo arranque sin basura.
- Armar la estructura de documentación antes de la primera línea de código deja todo listo para registrar desde el primer commit.
- Tener un README claro ayuda al docente cuando revise el repo durante el oral.

**Qué entendí yo:**
- Toda decisión, no solo el código, queda registrada. Esto es lo que diferencia "usar IA con criterio" (M4 excelente) de "copiar y pegar" (M4 insuficiente).

---

## Conclusión de la sesión

**Listo:**
- Carpeta limpia, README inicial, estructura de `docs/` armada, memoria de la IA configurada.

**Pendiente para la próxima sesión:**
- Crear el repo en GitHub y linkearlo (`git init` + `git remote add origin`).
- Decidir páginas mínimas para fase 1 (home, catálogo, producto, contacto).
- Decidir público objetivo (B2B vs B2C) e identidad visual base.
- Empezar a escribir los primeros archivos HTML.
