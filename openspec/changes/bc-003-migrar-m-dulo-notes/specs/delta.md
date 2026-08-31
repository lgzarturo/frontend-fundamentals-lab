# Delta Spec: Migrar módulo Notes

## ADDED Requirements

- El módulo de notas está completamente manejado por la clase `NotesModule`.
- La función global `notes()` se remueve de `app.js`.
- El CRUD de notas, además de su correcta visualización y ordenamiento, es migrado a `NotesModule` y funciona correctamente.
