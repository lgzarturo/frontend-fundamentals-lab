# Design: Dashboard de telemetría y resumen de uso

## Approach

Contadores en `StorageService` (`usage`), resumen en prosa generado por una función pura en `home/summary.js` y renderizado por `HomeModule`. Todo local, sin red.

- **Visitas:** `VisitTracker` sigue siendo la fuente de verdad (`dos_visit_tracker`). `HomeModule.init()` copia `totalVisits` a `storage.usage.visits` (espejo exportable/importable). No se duplica la lógica de racha.
- **Interacciones:** `HomeModule` ya escucha `task:created`, `task:toggled`, `task:updated`, `habit:toggled`, `budget:created`, `note:created`. Cada evento incrementa `usage.interactions` vía `storage.incrementInteractions()` antes de re-renderizar. Sin eventos nuevos ni referencias entre módulos.
- **Resumen:** `buildSummary({ tasks, habits, budgets, usage, today })` devuelve una lista de `{ key, params }` (una por área). `HomeModule` traduce con `I18n.t(key, params)` y pinta en `#home-summary`. Lógica separada de i18n y DOM para testearla sin jsdom.
- **Texto:** plantillas en `es.json` y `en.json` bajo `app.screens.home.summary.*`, con claves `one`/`other` para plurales y `empty` por área.

## Data Shapes

```js
// StorageService._getEmptyData()
usage: { visits: 0, interactions: 0 }
```

- `getUsage()` devuelve `{ visits, interactions }` con default `0` si `usage` falta (datos v2 previos e importaciones antiguas).
- `_validateData` no exige `usage`.
- `incrementInteractions()` suma 1 y persiste con `save()`.
- `setVisits(n)` solo persiste si el valor cambió.

## Summary rules

| Área | Regla | Clave |
| ---- | ----- | ----- |
| Tareas | pendientes con `dueDate === today` (`n`), o total pendientes si no hay de hoy | `tasksToday`, `tasksPending`, `tasksNone` |
| Presupuestos | por cada presupuesto `savings` con `goalAmount > 0`: `Budget.getProgress()` (ya acotado 0–100); se resume el de mayor progreso | `budgetProgress`, `budgetNone` |
| Hábitos | `completados hoy / total` (`Habit.isCompletedToday()`) | `habitsToday`, `habitsNone` |
| Uso | `visits` e `interactions` | `usage` |

Se reutilizan `Budget` y `Habit` de los modelos; `buildSummary` no reimplementa su lógica.

## Files Affected

- `assets/js/services/storage.js` — `usage` en datos vacíos, `getUsage`, `incrementInteractions`, `setVisits`.
- `assets/js/modules/home/summary.js` — nuevo, `buildSummary` puro.
- `assets/js/data/demoData.js` — clave `usage` en el estado demo.
- `assets/js/modules/home/index.js` — contador de interacciones, espejo de visitas, `_renderSummary`.
- `assets/js/modules/home/templates.js` — template del bloque de resumen (tag `html`).
- `index.html` — contenedor `#home-summary` dentro de `#home-screen`.
- `assets/locales/es.json`, `assets/locales/en.json` — claves `summary.*`.
- `tests/storage.test.js`, `tests/home-summary.test.js` — cobertura.

## Tradeoffs

- Elegido: espejo de visitas en `usage` porque el criterio exige que el storage las persista y no se reescribe `VisitTracker`. Rechazado: mover el conteo a `StorageService`, porque rompe `visitTracker.test.js` y la clave `visit_counter`.
- Elegido: `buildSummary` pura. Rechazado: armar la prosa dentro de `HomeModule`, porque obliga a jsdom para cada caso.
- Rechazado: eventos nuevos o contador global en `EventBus`, porque acopla módulos.

## Risks

- `index.html` y `locales` quedan fuera del Scope original del backlog — mitigación: ampliar Scope del item BC-006 con estos archivos (cambio mínimo, requerido por AC2 y por la regla i18n).
- Contar en cada evento escribe a `localStorage` con frecuencia — mitigación: `save()` ya se ejecuta en cada mutación; el costo extra es marginal.
- `index.html` aún ejecuta racha de visitas; CLAUDE.md prohíbe "streaks" nuevos — mitigación: el resumen no menciona rachas, solo visitas e interacciones.

## Acceptance Criteria

- El storage persiste localmente contadores de uso (visitas e interacciones).
- Una nueva sección en la interfaz muestra un resumen narrativo de las métricas (tareas, presupuestos, hábitos).
- La prosa de resumen responde dinámicamente al estado actual de los datos (e.g., "Tienes 3 tareas hoy", "Tu ahorro va al 50%").
