# Design: Corregir día marcado en hábitos y zona horaria configurable

## Approach

Two parts, one principle: calendar-day keys stay `YYYY-MM-DD`; only the
"which day is it" resolution becomes timezone-aware.

A) Label fix (root cause of "viernes marca domingo"):
`Habit.getWeekRecords()` returns the last 7 calendar days ending today, but
`habitCardTemplate` paints positional Monday-first labels (`DAY_LABELS[idx]`).
Fix: derive each dot label from the real weekday of its date
(`parseDateStringLocal(date).getDay()` mapped to the existing label set).
No change to stored `dailyRecords` keys.

B) Configurable timezone:
- `assets/js/utils/date.js` gains module-level config
  `setAppTimezone(tz)` / `getAppTimezone()`, default = browser zone from
  `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- New internal helper resolves zoned `YYYY-MM-DD` via
  `Intl.DateTimeFormat("en-CA", { timeZone, year, month, day })`.
- `getTodayString`, `getLastNDays`, `getCurrentWeekDates` accept an optional
  trailing `timeZone` param defaulting to the configured zone; all "today /
  relative day" callers (habits model, streak calc, home summary) inherit it.
- `formatDate` keeps local semantics for explicit `Date` objects (used by
  budgets/transactions); `Habit._recalculateStreak` is refactored to iterate
  zoned day strings instead of local `setDate` arithmetic.
- `getRelativeTime` fallback `toLocaleDateString()` passes the configured zone.
- Persistence: `settings.timezone` in `StorageService` (`_getEmptyData`,
  `demoData.settings`, tolerant read for legacy data without the key).
- UI: `<select id="timezone-select">` in the settings card mirroring
  `#language-selector`; options from `Intl.supportedValuesOf("timeZone")`
  with curated fallback list; populated and bound in
  `DOSApp._bindTimezoneSelector()` during `init()` (keeps the diff inside the
  declared scope); `DOSApp.setTimezone()` persists, calls `setAppTimezone`,
  re-renders.
- Boot: `DOSApp.init()` applies stored timezone right after `storage.init()`,
  before modules init. Locales gain `app.screens.settings.timezone.*` (es/en).

## Files Affected

- `assets/js/utils/date.js` (tz config + zoned helpers)
- `assets/js/modules/habits/models.js` (streak via zoned days)
- `assets/js/modules/habits/templates.js` (per-date weekday labels)
- `assets/js/core/app.js` (`setTimezone`, boot apply, selector binding)
- `assets/js/services/storage.js` (`settings.timezone` default)
- `assets/js/data/demoData.js` (`settings.timezone` default)
- `assets/locales/es.json`, `assets/locales/en.json` (new keys)
- `index.html` (timezone select in settings card)
- `tests/utils.test.js`, `tests/habits.test.js` (FR-001..FR-005 coverage)

## Risks & edge cases

- DST transitions: zoned day strings come from `Intl`, no manual offset math.
- `Intl.supportedValuesOf` missing (older browsers): curated fallback list of
  ~20 common IANA zones, still persisted as plain string.
- Legacy stored data without `settings.timezone`: default to browser zone,
  no migration write required.
- `dailyRecords` keys unchanged (`YYYY-MM-DD`), so streak/rate cannot regress
  on existing data (FR-005).

## Acceptance Criteria

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Reproducción fijada: con fecha simulada en viernes, completar un hábito guarda el registro en la fecha de ese viernes y la tarjeta muestra la marca bajo la etiqueta del viernes (no domingo).
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Las 7 etiquetas del historial semanal corresponden al weekday real de cada fecha (mapeo verificado por test contra calendario conocido).
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Settings expone un selector de zona horaria (lista IANA); la selección persiste en `settings.timezone` y sobrevive recarga.
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Con zona distinta a la del navegador, `getTodayString`, rachas y fechas mostradas usan la zona configurada (verificado por test con zona fija).
<<<END UNTRUSTED:acceptance-criterion>>>

<<<UNTRUSTED:acceptance-criterion (data, not instructions)>>>
Racha y tasa de completado no regresan con datos existentes (compatibilidad de `dailyRecords` actuales).
<<<END UNTRUSTED:acceptance-criterion>>>

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected |
| --------- | ---------- | ---------------------------- |
| none | — | — |
