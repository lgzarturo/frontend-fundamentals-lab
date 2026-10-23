# Design: Presupuesto de inversión con simulador de interés compuesto

## Approach

Deliver "Presupuesto de inversión con simulador de interés compuesto" inside:

<<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/modules/budgets/*, index.html, assets/locales/*.json, tests/budgets.test.js
<<<END UNTRUSTED:scope>>>

The architect MUST refine files and risks before implementation.

## Files Affected

<<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/modules/budgets/*, index.html, assets/locales/*.json, tests/budgets.test.js
<<<END UNTRUSTED:scope>>>

## Acceptance Criteria

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Crear presupuesto tipo inversión exige monto inicial >= 0, aportación mensual >= 0 y tasa anual entre 3% y 10%; fuera de rango se rechaza con mensaje.
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Los saldos a 0/5/10/15/20 años coinciden con capitalización mensual compuesta con tolerancia ±0.01 (casos fijos en test).
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
La vista muestra gráfica de crecimiento (balance vs aportaciones acumuladas) y tabla anual con aportado, interés y balance.
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Descarga CSV con las mismas filas de la tabla anual; descarga PDF con gráfica + tabla.
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Presupuestos `savings`/`spending` existentes no cambian comportamiento (tests actuales en verde).
<<<END UNTRUSTED:acceptance-criterion>>>

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected |
| --------- | ---------- | ---------------------------- |
| none | — | — |
