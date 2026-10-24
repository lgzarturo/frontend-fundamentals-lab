# Delta Spec: Fechas de ciclo en tareas y reporte PDF de completadas

## ADDED Requirements

### Requirement: FR-001 Crear tarea/subtarea guarda `createdAt`; completar guarda `completedAt`; desmarcar borra `completedAt` (tareas y subtareas, verificado por test).

The system MUST Crear tarea/subtarea guarda `createdAt`; completar guarda `completedAt`; desmarcar borra `completedAt` (tareas y subtareas, verificado por test)..

#### Scenario: SC-001 Crear tarea/subtarea guarda `createdAt`; completar guarda `completedAt`; desmarcar borra `completedAt` (tareas y subtareas, verificado por test).

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Crear tarea/subtarea guarda `createdAt`; completar guarda `completedAt`; desmarcar borra `completedAt` (tareas y subtareas, verificado por test).

### Requirement: FR-002 Duración efectiva = días calendario lun-vie en [creación, completado] x 8h (mismo día hábil = 8h; fin de semana intermedio no suma; verificado con casos fijos).

The system MUST Duración efectiva = días calendario lun-vie en [creación, completado] x 8h (mismo día hábil = 8h; fin de semana intermedio no suma; verificado con casos fijos)..

#### Scenario: SC-002 Duración efectiva = días calendario lun-vie en [creación, completado] x 8h (mismo día hábil = 8h; fin de semana intermedio no suma; verificado con casos fijos).

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Duración efectiva = días calendario lun-vie en [creación, completado] x 8h (mismo día hábil = 8h; fin de semana intermedio no suma; verificado con casos fijos).

### Requirement: FR-003 El reporte PDF lista solo completadas con título, fechas y duración efectiva, e incluye gráfica de barras de completadas por día.

The system MUST El reporte PDF lista solo completadas con título, fechas y duración efectiva, e incluye gráfica de barras de completadas por día..

#### Scenario: SC-003 El reporte PDF lista solo completadas con título, fechas y duración efectiva, e incluye gráfica de barras de completadas por día.

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN El reporte PDF lista solo completadas con título, fechas y duración efectiva, e incluye gráfica de barras de completadas por día.

### Requirement: FR-004 Datos existentes sin `completedAt` no se rompen: se migran o se excluyen del reporte sin errores.

The system MUST Datos existentes sin `completedAt` no se rompen: se migran o se excluyen del reporte sin errores..

#### Scenario: SC-004 Datos existentes sin `completedAt` no se rompen: se migran o se excluyen del reporte sin errores.

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Datos existentes sin `completedAt` no se rompen: se migran o se excluyen del reporte sin errores.

### Requirement: FR-005 CRUD, toggles y filtros de tareas actuales siguen funcionando (tests en verde).

The system MUST CRUD, toggles y filtros de tareas actuales siguen funcionando (tests en verde)..

#### Scenario: SC-005 CRUD, toggles y filtros de tareas actuales siguen funcionando (tests en verde).

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN CRUD, toggles y filtros de tareas actuales siguen funcionando (tests en verde).

