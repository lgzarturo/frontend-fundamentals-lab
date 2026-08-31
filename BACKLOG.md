# Product Backlog

## Global

- Product: frontend-fundamentals-lab
- Strategy: Terminar de migrar la aplicación heredada (app.js) a un patrón modular basado en clases en assets/js/modules.
- Policy: Utilizar los módulos existentes vacíos y encapsular las funcionalidades separando responsabilidades.
- Review required: false
- TDD required: false

## Items

### BC-001 | Migrar módulo Tasks
- Priority: P1
- Status: PLANNED
- Type: refactor
- Depends on: None
- Description: Extraer la lógica de tareas (creación, edición, completado, reordenamiento, filtrado) de assets/js/app.js al TasksModule (assets/js/modules/tasks/).
- Scope: assets/js/app.js, assets/js/modules/tasks/*
- Out of scope: Funcionalidades de tareas nuevas no existentes actualmente.
- Acceptance:
  - [ ] La lógica de la pantalla y el estado de las tareas está encapsulada en `TasksModule`.
  - [ ] La función global heredada `tasks()` y sus funciones auxiliares relacionadas a tareas son eliminadas de `app.js`.
  - [ ] Crear, borrar, editar y el drag & drop de tareas funciona exactamente igual usando la clase del módulo.

### BC-002 | Migrar módulo Habits
- Priority: P1
- Status: PLANNED
- Type: refactor
- Depends on: None
- Description: Extraer la lógica de hábitos (lista de hábitos, racha, marcas diarias) de assets/js/app.js al HabitsModule (assets/js/modules/habits/).
- Scope: assets/js/app.js, assets/js/modules/habits/*
- Out of scope: Crear hábitos semanales.
- Acceptance:
  - [ ] La lógica de hábitos se maneja a través de la clase `HabitsModule`.
  - [ ] Las funciones globales relacionadas a hábitos como `habits()` son eliminadas de `app.js`.
  - [ ] La creación de hábitos, eliminación y el chequeo diario (junto con rachas y la animación de confeti) funcionan correctamente.

### BC-003 | Migrar módulo Notes
- Priority: P2
- Status: PLANNED
- Type: refactor
- Depends on: None
- Description: Extraer la lógica de notas (editor, listado, auto-guardado, borrado) de assets/js/app.js al NotesModule (assets/js/modules/notes/).
- Scope: assets/js/app.js, assets/js/modules/notes/*
- Out of scope: Rich text editing con librerías externas.
- Acceptance:
  - [ ] El módulo de notas está completamente manejado por la clase `NotesModule`.
  - [ ] La función global `notes()` se remueve de `app.js`.
  - [ ] El CRUD de notas, además de su correcta visualización y ordenamiento, es migrado a `NotesModule` y funciona correctamente.

### BC-004 | Migrar módulo Home
- Priority: P2
- Status: READY
- Type: refactor
- Depends on: BC-001, BC-002, BC-003
- Description: Extraer el dashboard principal (most-important-tasks, widgets de presupuestos y hábitos) de assets/js/app.js al HomeModule.
- Scope: assets/js/app.js, assets/js/modules/home/*
- Out of scope: Agregar nuevos widgets estadísticos.
- Acceptance:
  - [ ] El resumen del día (incluyendo hábitos del día, tareas importantes y estado del presupuesto) se renderiza usando `HomeModule`.
  - [ ] La función heredada `home()` es eliminada de `app.js`.
  - [ ] La interacción desde el módulo home actualiza el estado (completar MITs y hábitos desde la vista de inicio) correctamente.

### BC-005 | Limpieza final y borrado de app.js
- Priority: P1
- Status: READY
- Type: refactor
- Depends on: BC-004
- Description: Borrar app.js (legacy) después de que todos los módulos y funciones globales hayan sido migrados a DOSApp y sus submódulos.
- Scope: assets/js/app.js, index.html, assets/js/core/app.js
- Out of scope: Refactorizar `assets/js/core/app.js`.
- Acceptance:
  - [ ] El archivo `assets/js/app.js` heredado está borrado.
  - [ ] Se retira la referencia a `<script src="./assets/js/app.js"></script>` en `index.html`.
  - [ ] Las funciones globales remanentes (como helpers de DOM, UI o utils menores) están ubicadas en el directorio `utils/` o en `DOSApp`.

## Archive
