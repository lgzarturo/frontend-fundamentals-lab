# Delta Spec: Migrar módulo Tasks

## ADDED Requirements

- La lógica de la pantalla y el estado de las tareas está encapsulada en `TasksModule`.
- La función global heredada `tasks()` y sus funciones auxiliares relacionadas a tareas son eliminadas de `app.js`.
- Crear, borrar, editar y el drag & drop de tareas funciona exactamente igual usando la clase del módulo.
