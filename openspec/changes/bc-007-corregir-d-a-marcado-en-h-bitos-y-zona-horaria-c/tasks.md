# Implementation Tasks

## Setup

- [ ] Confirm scope and OpenSpec change folder (BC-007-discover)

## Foundational

- [ ] Read existing conventions in scope (BC-007-discover)

## Requirements

- [ ] Implement FR-001 (Reproducción fijada: con fecha simulada en viernes, completar un hábito guarda el registro en la fecha de ese viernes y la tarjeta muestra la marca bajo la etiqueta del viernes (no domingo).) (BC-007-implement)
- [ ] Verify SC-001 (BC-007-review)
- [ ] Implement FR-002 (Las 7 etiquetas del historial semanal corresponden al weekday real de cada fecha (mapeo verificado por test contra calendario conocido).) (BC-007-implement)
- [ ] Verify SC-002 (BC-007-review)
- [ ] Implement FR-003 (Settings expone un selector de zona horaria (lista IANA); la selección persiste en `settings.timezone` y sobrevive recarga.) (BC-007-implement)
- [ ] Verify SC-003 (BC-007-review)
- [ ] Implement FR-004 (Con zona distinta a la del navegador, `getTodayString`, rachas y fechas mostradas usan la zona configurada (verificado por test con zona fija).) (BC-007-implement)
- [ ] Verify SC-004 (BC-007-review)
- [ ] Implement FR-005 (Racha y tasa de completado no regresan con datos existentes (compatibilidad de `dailyRecords` actuales).) (BC-007-implement)
- [ ] Verify SC-005 (BC-007-review)

## Phase cards

- [ ] BC-007: Implementation (BC-007-implement)
- [ ] BC-007: Test coverage (BC-007-test)

## Polish

- [ ] Run openspec analyze and scorecard create --from-diff (BC-007-review)