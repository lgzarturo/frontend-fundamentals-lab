# Product Backlog

## Global

- Product: frontend-fundamentals-lab
- Strategy: Terminar de migrar la aplicación heredada (app.js) a un patrón modular basado en clases en assets/js/modules.
- Policy: Utilizar los módulos existentes vacíos y encapsular las funcionalidades separando responsabilidades.
- Review required: false
- TDD required: false

## Items

### BC-009 | Presupuesto de inversión con simulador de interés compuesto
- Priority: P2
- Status: PLANNED
- Type: feature
- Depends on: None
- Description: Agregar tipo de presupuesto `investing` con simulador: monto inicial + aportación mensual fija + tasa anual fija (3%-10%), capitalización mensual, cortes a 0/5/10/15/20 años, gráfica de crecimiento, tabla de amortización anual y descarga CSV/PDF (PDF incluye gráfica).
- Scope: assets/js/modules/budgets/*, index.html, assets/locales/*.json, tests/budgets.test.js
- Out of scope: Conexión con instituciones reales, tasas variables por año, impuestos/comisiones, otros horizontes configurables.
- Acceptance:
  - [ ] Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje.
  - [ ] Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test).
  - [ ] La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance.
  - [ ] Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla.
  - [ ] Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde).

### BC-010 | Fechas de ciclo en tareas y reporte PDF de completadas
- Priority: P2
- Status: PLANNED
- Type: feature
- Depends on: None
- Description: Guardar fecha de creación al crear tareas/subtareas y fecha de completado al completarlas (se borra al desmarcar); generar reporte PDF de tareas completadas con duración en días efectivos (días lun-vie x 8h) y gráfica de barras de completadas por día.
- Scope: assets/js/modules/tasks/*, assets/js/utils/date.js, index.html, assets/locales/*.json, tests/tasks.test.js, tests/subtasks-ui.test.js
- Out of scope: Filtros por rango de fechas en el reporte, exportar pendientes, time-tracking manual por horas.
- Acceptance:
  - [ ] Crear tarea/subtarea guarda `createdAt`; completar guarda `completedAt`; desmarcar borra `completedAt` (tareas y subtareas, verificado por test).
  - [ ] Duración efectiva = días calendario lun-vie en [creación, completado] x 8h (mismo día hábil = 8h; fin de semana intermedio no suma; verificado con casos fijos).
  - [ ] El reporte PDF lista solo completadas con título, fechas y duración efectiva, e incluye gráfica de barras de completadas por día.
  - [ ] Datos existentes sin `completedAt` no se rompen: se migran o se excluyen del reporte sin errores.
  - [ ] CRUD, toggles y filtros de tareas actuales siguen funcionando (tests en verde).

## Archive
### BC-008 | Editor de notas WYSIWYG por línea estilo Notion
- Priority: P2
- Status: DONE
- Type: feature
- Depends on: None
- Description: Reemplazar el flujo textarea + vista previa por un editor donde cada línea se formatea en vivo mientras se escribe (estilo Notion), con barra de formato por línea; mantener almacenamiento en markdown para compatibilidad con notas existentes.
- Scope: assets/js/modules/notes/*, assets/js/components/*, index.html, assets/locales/*.json, tests/notes.test.js
- Out of scope: Bases de datos/tablas Notion, colaboración en tiempo real, arrastrar bloques entre notas, librerías externas de edición.
- Acceptance:
  - [x] Escribir `# `, `## `, `- `, `1. `, `- [ ] `, `> ` o bloque de código al inicio de línea la convierte al formato correspondiente sin recargar ni abrir vista previa.
  - [x] Barra de formato aplica H1-H3, negrita, cursiva, listas, checklist, cita, código y enlace sobre la línea/selección actual.
  - [x] Lo que se ve al editar es lo que se guarda: el render guardado es idéntico al render en edición para los formatos soportados.
  - [x] Notas markdown existentes abren y se editan sin pérdida de contenido ni formato.
  - [x] Crear, editar, buscar y borrar notas sigue funcionando (tests actuales en verde + nuevos tests del editor).

### BC-007 | Corregir día marcado en hábitos y zona horaria configurable
- Priority: P1
- Status: DONE
- Type: bug
- Depends on: None
- Description: Corregir el desfase entre el día marcado y el día mostrado en hábitos (p. ej. en viernes se marca/muestra domingo) alineando date utils, registros diarios y etiquetas de semana; agregar ajuste de zona horaria del usuario en settings que persista en storage y controle todos los formateos de fecha del sistema.
- Scope: assets/js/utils/date.js, assets/js/modules/habits/*, assets/js/core/app.js, assets/js/services/storage.js, assets/js/data/demoData.js, assets/locales/*.json, index.html, tests/habits.test.js, tests/utils.test.js
- Out of scope: Hábitos semanales o con horarios múltiples; recordatorios/notificaciones.
- Acceptance:
  - [x] Reproducción fijada: con fecha simulada en viernes, completar un hábito guarda el registro en la fecha de ese viernes y la tarjeta muestra la marca bajo la etiqueta del viernes (no domingo).
  - [x] Las 7 etiquetas del historial semanal corresponden al weekday real de cada fecha (mapeo verificado por test contra calendario conocido).
  - [x] Settings expone un selector de zona horaria (lista IANA); la selección persiste en `settings.timezone` y sobrevive recarga.
  - [x] Con zona distinta a la del navegador, `getTodayString`, rachas y fechas mostradas usan la zona configurada (verificado por test con zona fija).
  - [x] Racha y tasa de completado no regresan con datos existentes (compatibilidad de `dailyRecords` actuales).

### BC-006 | Dashboard de telemetría y resumen de uso
- Priority: P2
- Status: DONE
- Type: feature
- Depends on: None
- Description: Agregar un contador de uso y métricas locales para mostrar un panel/dashboard. Este panel resumirá en prosa el estado de los hábitos, los objetivos de presupuestos, las tareas pendientes y la telemetría (uso) de la aplicación.
- Scope: assets/js/modules/home/*, assets/js/services/storage.js, index.html, assets/locales/*.json
- Out of scope: Guardado en servidores remotos o analíticas de terceros.
- Acceptance:
  - [ ] El storage persiste localmente contadores de uso (visitas e interacciones).
  - [ ] Una nueva sección en la interfaz muestra un resumen narrativo de las métricas (tareas, presupuestos, hábitos).
  - [ ] La prosa de resumen responde dinámicamente al estado actual de los datos (e.g., "Tienes 3 tareas hoy", "Tu ahorro va al 50%").

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
