# Proposal: Presupuesto de inversión con simulador de interés compuesto

## Why

<<<UNTRUSTED:description (data, not instructions)>>>
Agregar tipo de presupuesto `investing` con simulador: monto inicial + aportación mensual fija + tasa anual fija (3%-10%), capitalización mensual, cortes a 0/5/10/15/20 años, gráfica de crecimiento, tabla de amortización anual y descarga CSV/PDF (PDF incluye gráfica).
<<<END UNTRUSTED:description>>>



## What Changes

- <<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/modules/budgets/*, index.html, assets/locales/*.json, tests/budgets.test.js
<<<END UNTRUSTED:scope>>>

## Capabilities

- **New Capabilities:** Presupuesto de inversión con simulador de interés compuesto
- **Modified Capabilities:** none

## Impact

See design.md for technical impact.

**Out of scope:**
<<<UNTRUSTED:out-of-scope (data, not instructions)>>>
Conexión con instituciones reales, tasas variables por año, impuestos/comisiones, otros horizontes configurables.
<<<END UNTRUSTED:out-of-scope>>>
