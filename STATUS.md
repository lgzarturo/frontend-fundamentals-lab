# STATUS — Refactor a Módulos ES6 (module-13)

> Fecha: 2026-09-06 · Rama: `module-13-modules-refactor` · Plan: `plans/01-plan-javascript-to-modules-es6.md`

## Resumen

La migración del monolito `assets/js/app.js` (~3 300 líneas) a la
arquitectura modular **está completa y en producción** (cutover total).
`index.html` ahora carga `assets/js/main.js` como módulo ES; el monolito
legacy fue eliminado del repositorio.

- **Tests:** 161/161 pasando (`npx vitest run`), incluidos 14 tests de
  integración nuevos del core (`tests/app-core.test.js`).
- **Diff del cutover:** 15 archivos, +431 / −3 859 líneas.

## Arquitectura actual

```
assets/js/
  main.js                  — bootstrap: i18n → app.init() → window.app + SW
  core/app.js              — DOSApp: orquestador, routing, modal, toasts,
                             undo, tema, datos (export/import/reset/clear)
                             y fachada pública para handlers inline
  core/eventBus.js         — pub/sub entre módulos
  services/storage.js      — localStorage con migración (dos-app-data-v2)
  services/i18n.js         — i18n es/en con invalidación de caché PWA
  modules/{budgets,tasks,habits,notes,home}/ — módulos de dominio
  utils/{confetti,date,html,id}.js           — helpers puros
  data/demoData.js         — datos semilla para reset
```

## Completado en esta iteración

| Ítem | Detalle |
| --- | --- |
| BC-001 Tasks | Migrado; drag & drop, filtros, subtareas y undo funcionando |
| BC-002 Habits | Migrado; rachas, marcas diarias, confeti `habit:allCompleted` |
| BC-003 Notes | Migrado; CRUD, búsqueda, markdown y preview |
| BC-004 Home | Migrado; MITs, hábitos y stats del día **interactivos** (delegación `toggle-task`/`toggle-habit` añadida al HomeModule) |
| BC-005 Limpieza | `assets/js/app.js` borrado; `index.html` carga `main.js` (`type="module"`); `<template>` legacy eliminados |
| Cutover | `sw.js` precachea los 24 archivos modulares (cache `pwa-cache-v4`); `i18n.js` sincronizado a v4 |
| Fachada global | `window.app` expone los 14 métodos usados por `onclick` inline (navigateTo, showCreate*Modal, filterTasks, searchNotes, toggleTheme, exportData, showImportModal, resetToDemo, clearAllData, closeModal, performUndo) |
| Datos | `reload()` por módulo: import/reset/clear recargan datos **sin duplicar listeners** del eventBus |
| i18n | Claves nuevas: `dataImportError`, `data.reset.confirm`, `data.clear.confirm` (es + en) |

### Bugs corregidos de paso

- `BudgetsModule` manejaba `view-budget` pero la plantilla emitía
  `data-action="view-details"` → el botón "Ver Detalles" no abría el modal.
- `launchConfetti` lanzaba `TypeError` sin contexto canvas 2d (ahora con
  guarda defensiva).
- La vista general estática de presupuestos en `index.html` (ids
  `budget-total` etc.) quedaba desactualizada; ahora la renderiza el módulo
  dentro de `#budgets-list`.
- Las estadísticas de hábitos (`habits-current-streak`,
  `habits-completion-rate`) no se actualizaban; ahora las renderiza
  `HabitsModule._renderStats()`.

## Evidencia

```
$ npx vitest run
 ✓ tests/app-core.test.js  (14 tests)
 Test Files  8 passed (8)
      Tests  161 passed (161)
```

- Handlers inline cubiertos: `grep -o 'app\.[a-zA-Z]*(' index.html` → 14
  métodos, todos presentes en `DOSApp`.
- URLs de precache de `sw.js` verificadas contra el sistema de archivos.

## Pendiente / próximos pasos

1. **BC-006** (PLANNED): dashboard de telemetría y resumen narrativo de uso.
2. Smoke test manual en navegador real (`npx serve .`): PWA/offline con la
   cache v4, cambio de idioma, drag & drop de tareas y descarga de backup.
3. Considerar migrar los `onclick` inline a delegación `data-action` y
   retirar la fachada `window.app` (deuda técnica menor).
4. `en/index.html` sigue siendo un stub de ejemplo (fuera del alcance de
   este refactor).
