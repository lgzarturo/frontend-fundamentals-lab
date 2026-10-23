# Delta Spec: Presupuesto de inversión con simulador de interés compuesto

## ADDED Requirements

### Requirement: FR-001 Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje.

The system MUST Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje..

#### Scenario: SC-001 Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje.

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje.

### Requirement: FR-002 Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test).

The system MUST Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test)..

#### Scenario: SC-002 Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test).

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test).

### Requirement: FR-003 La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance.

The system MUST La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance..

#### Scenario: SC-003 La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance.

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance.

### Requirement: FR-004 Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla.

The system MUST Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla..

#### Scenario: SC-004 Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla.

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla.

### Requirement: FR-005 Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde).

The system MUST Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde)..

#### Scenario: SC-005 Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde).

- GIVEN the relevant scoped behavior
- WHEN this change is applied
- THEN Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde).

