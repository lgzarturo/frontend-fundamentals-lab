# Design: Migrar módulo Notes

## Approach

(To be completed in design phase.)

## Files Affected

assets/js/app.js, assets/js/modules/notes/*

## Acceptance Criteria

- El módulo de notas está completamente manejado por la clase `NotesModule`.
- La función global `notes()` se remueve de `app.js`.
- El CRUD de notas, además de su correcta visualización y ordenamiento, es migrado a `NotesModule` y funciona correctamente.
