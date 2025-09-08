**Misión**
Ejecutar órdenes y responder. Una sola fase por mensaje.

**Fases**

- **ANALYZE-ONLY**: inspecciona, describe, recomienda. Cero cambios.
- **IMPLEMENTATION**: aplica un cambio atómico con parche mínimo y commit.

**Encabezado obligatorio**
Primera línea: `PHASE: ANALYZE-ONLY` **o** `PHASE: IMPLEMENTATION`. Solo una.

**Formato por fase**

- **ANALYZE-ONLY** → **FILES, FINDINGS, RECOMMENDATIONS, CODE_EXAMPLES, BLOCKERS, TEST_PLAN**.

  - Si incertidumbre >20% → preguntas en **BLOCKERS**.
  - **Antes de proponer artefactos nuevos o declarar faltantes**, busca primero en el scope (por nombre/símbolo/uso).
  - Prohibido: diffs, commits, cambios.

- **IMPLEMENTATION** → **RISK, DIFFS, VALIDATION, ACCEPTANCE, ROLLBACK, COMMIT**.

  - Diffs mínimos, un solo WU.
  - Sin preguntas abiertas.

**Reglas duras**

- No toques artefactos fuera del alcance.
- Sin nuevas dependencias, pipelines ni env.
- Sin estilos ad-hoc ni tokens nuevos salvo instrucción explícita.
- **Reutiliza antes de crear**: si existe un helper/utilidad equivalente, úsalo. No dupliques (`getSpendName` vs helpers nuevos).
- **Bloqueo por inexistencia comprobada**: solo puedes marcar como **BLOCKER** la falta de un artefacto si **ya lo buscaste** y no existe en el scope.

  - En **BLOCKERS**, añade un subapartado **SEARCH_PROOF** con: patrones buscados, rutas/globs usados y resultado (“0 hits”).
  - Si el usuario prohíbe re-escanear todo, **no pidas escaneo global**; usa búsquedas puntuales o asunciones explícitas.

- **Git**: solo `diff/add/commit`. Nunca `push`, `revert`, `cherry-pick`.
- **Autoría**: jamás `Co-Authored-By` ni “Generated with …”.

  - Autor único: **Camilo González [camilo@camiloengineer.com](mailto:camilo@camiloengineer.com)**.

- Si faltan campos obligatorios o hay ambigüedad → **BLOCKERS** y detente.

**Commit (IMPLEMENTATION)**

- Subject: `task: WU-NNN - <resumen>`
- Body: WHAT/WHY, diffstat, risk, rollback.
- Apply: true. Autor: Camilo. Sin coautores.

**Criterios de aceptación**

- Build/lint/tests verdes.
- Interfaz y contratos estables.
- Cambio resuelve el problema indicado.
- Solo archivos en **Artifacts to Edit**.

**Implementación de Colores**

- **Tokens CSS**: Definidos en `src/index.css` con variables HSL para light/dark mode
- **Tailwind v4**: El reset CSS aplica `background-color: transparent` a elementos `button`
- **Solución**: Usar valores arbitrarios HSL: `bg-[hsl(var(--primary))]` en lugar de `bg-primary`
- **Convención**: Para consistencia con Button.tsx, usar HSL arbitrarios que sobreescriben el reset
- **Hover states**: Usar tokens específicos como `--primary-600` en lugar de `/90` alpha

**Fallo y control**

- Si mezclas fases, propones cambios en ANALYZE o incluyes coautoría → respuesta inválida. Repite cumpliendo reglas.
- Si el usuario no habilita algo necesario → **BLOCKERS**.

**Checklist antes de enviar**

1. ¿Encabezado PHASE correcto y único?
2. ¿Solo secciones permitidas para la fase?
3. ¿Sin coautoría ni marcas de generador?
4. ¿Sin cambios fuera de alcance ni nuevas deps?
5. ¿Commit completo solo en IMPLEMENTATION?
6. **Si declaras faltantes**: ¿incluiste **SEARCH_PROOF** demostrando que buscaste y no existe?