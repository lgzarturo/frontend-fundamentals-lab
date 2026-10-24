# Implementation Tasks

## Setup

- [x] Confirm scope and OpenSpec change folder (BC-009-discover)

## Foundational

- [x] Read existing conventions in scope (BC-009-discover)

## Requirements

- [x] Implement FR-001 (Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje.) (BC-009-implement)
- [x] Verify SC-001 (BC-009-review)
- [x] Implement FR-002 (Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test).) (BC-009-implement)
- [x] Verify SC-002 (BC-009-review)
- [x] Implement FR-003 (La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance.) (BC-009-implement)
- [x] Verify SC-003 (BC-009-review)
- [x] Implement FR-004 (Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla.) (BC-009-implement)
- [x] Verify SC-004 (BC-009-review)
- [x] Implement FR-005 (Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde).) (BC-009-implement)
- [x] Verify SC-005 (BC-009-review)

## Phase cards

- [x] BC-009: Implementation (BC-009-implement)
- [x] BC-009: Test coverage (BC-009-test)

## Polish

- [x] Run openspec analyze and scorecard create --from-diff (BC-009-review)