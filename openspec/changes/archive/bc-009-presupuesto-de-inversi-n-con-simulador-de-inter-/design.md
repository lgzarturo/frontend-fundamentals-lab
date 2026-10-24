# Design: Presupuesto de inversión con simulador de interés compuesto

## Approach

Deliver "Presupuesto de inversión con simulador de interés compuesto" inside:

<<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/modules/budgets/*, index.html, assets/locales/*.json, tests/budgets.test.js
<<<END UNTRUSTED:scope>>>

New `investing` budget type with a compound-interest simulator. No external
libs (no chart/PDF deps in the project): hand-rolled SVG chart, CSV via Blob,
PDF via hidden-iframe print of chart + table (user saves as PDF).

- Model (`budgets/models.js`): `Budget` accepts `type: "investing"` with
  `initialPrincipal` (>= 0), `monthlyContribution` (>= 0), `annualRate`
  (3-10 incl.); `validate` rejects out-of-range with message. New pure
  function `simulateInvestment({ principal, monthly, annualRate, years })`
  with monthly compounding, contributions at month end, returning yearly rows
  `{ year, contributed, interest, balance }` for 0..20; `getMilestones()`
  picks 0/5/10/15/20. `getBalance()` = principal (no ledger),
  `getProgress()` = 0, `getStatus()` = "safe" for investing; transactions
  rejected for this type. `normalizeData`/`toJSON`/`fromJSON` round-trip the
  new fields; legacy data untouched.
- Module (`budgets/index.js`): `createBudget` passes investing fields;
  `getTotals` excludes investing (savings/spending totals unchanged);
  `showDetailsModal` branches to the simulation view for investing;
  `downloadCsv(budgetId)` (Blob, same rows as table) and `downloadPdf`
  (hidden iframe with inline-styled doc: title, params, chart SVG, table,
  then print); modal click delegation extended for both actions.
- Templates (`budgets/templates.js`): create modal gains third type card +
  investing field group (principal/monthly/rate) toggled by `syncTypeFields`;
  investing card branch (params, 20y projection, details + CSV buttons, no
  add-transaction); details branch with milestone chips, SVG line/area chart
  (balance vs contributed, xp greens/blues), annual table, CSV/PDF buttons.
  All classes reused from the build (verified by grep).
- Locales: `types.investing(+Hint)`, create-field labels, simulation labels
  (legend, headers, milestones, buttons) es/en.
- `index.html`: no change expected (modals render from JS).

## Files Affected

- `assets/js/modules/budgets/models.js` (type, fields, simulation math)
- `assets/js/modules/budgets/index.js` (create/totals/details/downloads)
- `assets/js/modules/budgets/templates.js` (type card, fields, card, details)
- `assets/locales/es.json`, `assets/locales/en.json` (investing strings)
- `tests/budgets.test.js` (validation, fixed math vectors, CSV, chart, PDF)

## Risks & edge cases

- Float precision: compute full precision, round only at display/CSV (2dp);
  test vectors generated independently via Python decimal, tolerance ±0.01.
- Rate guard: r = 0 path (P + PMT*n) even though validation pins 3-10.
- Zero principal + zero monthly = all-zero rows (valid, tested).
- jsdom has no print/layout: PDF test stubs iframe print and asserts doc
  contains chart + table + values.
- Live browser check (chart render, print-to-PDF, mobile table scroll)
  stays pending: no browser in CLI.

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
