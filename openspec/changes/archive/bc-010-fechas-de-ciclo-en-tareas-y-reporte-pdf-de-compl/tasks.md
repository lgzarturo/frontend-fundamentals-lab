# Implementation Tasks

## Setup

- [x] Confirm scope and OpenSpec change folder (BC-010-discover)

## Foundational

- [x] Read existing conventions in scope (BC-010-discover)

## Requirements

- [x] Implement FR-001 (Crear tarea/subtarea guarda `createdAt`; completar guarda `completedAt`; desmarcar borra `completedAt` (tareas y subtareas, verificado por test).) (BC-010-implement)
- [x] Verify SC-001 (BC-010-review)
- [x] Implement FR-002 (Duración efectiva = días calendario lun-vie en [creación, completado] x 8h (mismo día hábil = 8h; fin de semana intermedio no suma; verificado con casos fijos).) (BC-010-implement)
- [x] Verify SC-002 (BC-010-review)
- [x] Implement FR-003 (El reporte PDF lista solo completadas con título, fechas y duración efectiva, e incluye gráfica de barras de completadas por día.) (BC-010-implement)
- [x] Verify SC-003 (BC-010-review)
- [x] Implement FR-004 (Datos existentes sin `completedAt` no se rompen: se migran o se excluyen del reporte sin errores.) (BC-010-implement)
- [x] Verify SC-004 (BC-010-review)
- [x] Implement FR-005 (CRUD, toggles y filtros de tareas actuales siguen funcionando (tests en verde).) (BC-010-implement)
- [x] Verify SC-005 (BC-010-review)

## Phase cards

- [x] BC-010: Implementation (BC-010-implement)
- [x] BC-010: Test coverage (BC-010-test)

## Polish

- [x] Run openspec analyze and scorecard create --from-diff (BC-010-review)