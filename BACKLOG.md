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
- Status: DONE
- Type: refactor
- Depends on: None
- Description: Extraer la lógica de tareas (creación, edición, completado, reordenamiento, filtrado) de assets/js/app.js al TasksModule (assets/js/modules/tasks/).
- Scope: assets/js/app.js, assets/js/modules/tasks/*
- Out of scope: Funcionalidades de tareas nuevas no existentes actualmente.
- Acceptance:
  - [x] La lógica de la pantalla y el estado de las tareas está encapsulada en `TasksModule`.
  - [x] La función global heredada `tasks()` y sus funciones auxiliares relacionadas a tareas son eliminadas de `app.js`.
  - [x] Crear, borrar, editar y el drag & drop de tareas funciona exactamente igual usando la clase del módulo.

### BC-002 | Migrar módulo Habits
- Priority: P1
- Status: DONE
- Type: refactor
- Depends on: None
- Description: Extraer la lógica de hábitos (lista de hábitos, racha, marcas diarias) de assets/js/app.js al HabitsModule (assets/js/modules/habits/).
- Scope: assets/js/app.js, assets/js/modules/habits/*
- Out of scope: Crear hábitos semanales.
- Acceptance:
  - [x] La lógica de hábitos se maneja a través de la clase `HabitsModule`.
  - [x] Las funciones globales relacionadas a hábitos como `habits()` son eliminadas de `app.js`.
  - [x] La creación de hábitos, eliminación y el chequeo diario (junto con rachas y la animación de confeti) funcionan correctamente.

### BC-003 | Migrar módulo Notes
- Priority: P2
- Status: DONE
- Type: refactor
- Depends on: None
- Description: Extraer la lógica de notas (editor, listado, auto-guardado, borrado) de assets/js/app.js al NotesModule (assets/js/modules/notes/).
- Scope: assets/js/app.js, assets/js/modules/notes/*
- Out of scope: Rich text editing con librerías externas.
- Acceptance:
  - [x] El módulo de notas está completamente manejado por la clase `NotesModule`.
  - [x] La función global `notes()` se remueve de `app.js`.
  - [x] El CRUD de notas, además de su correcta visualización y ordenamiento, es migrado a `NotesModule` y funciona correctamente.

### BC-004 | Migrar módulo Home
- Priority: P2
- Status: DONE
- Type: refactor
- Depends on: BC-001, BC-002, BC-003
- Description: Extraer el dashboard principal (most-important-tasks, widgets de presupuestos y hábitos) de assets/js/app.js al HomeModule.
- Scope: assets/js/app.js, assets/js/modules/home/*
- Out of scope: Agregar nuevos widgets estadísticos.
- Acceptance:
  - [x] El resumen del día (incluyendo hábitos del día, tareas importantes y estado del presupuesto) se renderiza usando `HomeModule`.
  - [x] La función heredada `home()` es eliminada de `app.js`.
  - [x] La interacción desde el módulo home actualiza el estado (completar MITs y hábitos desde la vista de inicio) correctamente.

### BC-005 | Limpieza final y borrado de app.js
- Priority: P1
- Status: DONE
- Type: refactor
- Depends on: BC-004
- Description: Borrar app.js (legacy) después de que todos los módulos y funciones globales hayan sido migrados a DOSApp y sus submódulos.
- Scope: assets/js/app.js, index.html, assets/js/core/app.js
- Out of scope: Refactorizar `assets/js/core/app.js`.
- Acceptance:
  - [x] El archivo `assets/js/app.js` heredado está borrado.
  - [x] Se retira la referencia a `<script src="./assets/js/app.js"></script>` en `index.html`.
  - [x] Las funciones globales remanentes (como helpers de DOM, UI o utils menores) están ubicadas en el directorio `utils/` o en `DOSApp`.

### BC-006 | Dashboard de telemetría y resumen de uso
- Priority: P2
- Status: PLANNED
- Type: feature
- Depends on: None
- Description: Agregar un contador de uso y métricas locales para mostrar un panel/dashboard. Este panel resumirá en prosa el estado de los hábitos, los objetivos de presupuestos, las tareas pendientes y la telemetría (uso) de la aplicación.
- Scope: assets/js/modules/home/*, assets/js/services/storage.js
- Out of scope: Guardado en servidores remotos o analíticas de terceros.
- Acceptance:
  - [ ] El storage persiste localmente contadores de uso (visitas e interacciones).
  - [ ] Una nueva sección en la interfaz muestra un resumen narrativo de las métricas (tareas, presupuestos, hábitos).
  - [ ] La prosa de resumen responde dinámicamente al estado actual de los datos (e.g., "Tienes 3 tareas hoy", "Tu ahorro va al 50%").

## Archive
