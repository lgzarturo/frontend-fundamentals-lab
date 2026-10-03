# Delta Spec: Dashboard de telemetría y resumen de uso

## ADDED Requirements

### Requirement: FR-001 Persistencia de contadores de uso

`StorageService` SHALL persistir `usage.visits` y `usage.interactions` en `dos-app-data-v2`.

#### Scenario: Datos vacíos
- GIVEN almacenamiento sin datos
- WHEN se llama `init()`
- THEN `getUsage()` devuelve `{ visits: 0, interactions: 0 }`

#### Scenario: Datos previos sin `usage`
- GIVEN datos v2 guardados sin la clave `usage`
- WHEN se llama `getUsage()`
- THEN devuelve ceros sin lanzar error

#### Scenario: Importación sin `usage`
- GIVEN un JSON válido sin `usage`
- WHEN se llama `importData(json)`
- THEN devuelve `true`

### Requirement: FR-002 Conteo de interacciones

`HomeModule` SHALL incrementar `usage.interactions` en cada evento `task:created`, `task:toggled`, `task:updated`, `habit:toggled`, `budget:created` y `note:created`.

#### Scenario: Evento de tarea
- GIVEN `usage.interactions` es 4
- WHEN se emite `task:created`
- THEN `usage.interactions` es 5 y persiste

### Requirement: FR-003 Espejo de visitas

`HomeModule.init()` SHALL copiar `VisitTracker.getState().totalVisits` a `usage.visits`.

#### Scenario: Visitas existentes
- GIVEN `dos_visit_tracker` con `totalVisits` 7
- WHEN se inicializa `HomeModule`
- THEN `getUsage().visits` es 7

### Requirement: FR-004 Sección de resumen narrativo

La pantalla de inicio SHALL mostrar un bloque `#home-summary` con una frase por área: tareas, presupuestos, hábitos y uso.

#### Scenario: Render
- GIVEN datos de las cuatro áreas
- WHEN se llama `HomeModule.render()`
- THEN `#home-summary` contiene cuatro frases

### Requirement: FR-005 Prosa dinámica

`buildSummary` SHALL derivar cada frase del estado actual y usar la clave singular/plural y la de estado vacío según corresponda.

#### Scenario: Tareas de hoy
- GIVEN 3 tareas pendientes con `dueDate` de hoy
- WHEN se llama `buildSummary`
- THEN la frase de tareas es `tasksToday` con `n = 3`

#### Scenario: Una tarea
- GIVEN 1 tarea pendiente de hoy
- WHEN se llama `buildSummary`
- THEN se usa la variante `one`

#### Scenario: Progreso de ahorro
- GIVEN un presupuesto de ahorro con meta 200 y balance 100
- WHEN se llama `buildSummary`
- THEN `budgetProgress` tiene `percent = 50`

#### Scenario: Meta superada
- GIVEN un presupuesto de ahorro con balance mayor que la meta
- WHEN se llama `buildSummary`
- THEN `percent` es 100

#### Scenario: Sin datos
- GIVEN tareas, hábitos y presupuestos vacíos
- WHEN se llama `buildSummary`
- THEN cada área usa su clave de estado vacío

### Requirement: FR-006 Internacionalización

`es.json` y `en.json` SHALL contener las mismas claves `app.screens.home.summary.*`.

#### Scenario: Paridad de claves
- GIVEN ambos archivos de locale
- WHEN se comparan las claves bajo `summary`
- THEN los conjuntos son idénticos

### Requirement: FR-007 Alcance local

El sistema MUST NOT enviar métricas a servidores ni a analíticas de terceros desde este cambio.

#### Scenario: Sin red
- GIVEN el código añadido por BC-006
- WHEN se revisa su contenido
- THEN no contiene `fetch`, `XMLHttpRequest` ni `sendBeacon`

## Success Criteria

- SC-001: FR-001, FR-002 y FR-003 cubiertos por tests en `tests/storage.test.js` y `tests/home-summary.test.js` (AC1).
- SC-002: FR-004 visible en `#home-summary` (AC2).
- SC-003: FR-005 cubierto por tests de `buildSummary` (AC3).
- SC-004: `npm test` en verde.
