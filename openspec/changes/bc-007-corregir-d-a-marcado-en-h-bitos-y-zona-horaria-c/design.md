# Design: Corregir día marcado en hábitos y zona horaria configurable

## Approach

Deliver "Corregir día marcado en hábitos y zona horaria configurable" inside:

<<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/utils/date.js, assets/js/modules/habits/*, assets/js/core/app.js, assets/js/services/storage.js, assets/js/data/demoData.js, assets/locales/*.json, index.html, tests/habits.test.js, tests/utils.test.js
<<<END UNTRUSTED:scope>>>

The architect MUST refine files and risks before implementation.

## Files Affected

<<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/utils/date.js, assets/js/modules/habits/*, assets/js/core/app.js, assets/js/services/storage.js, assets/js/data/demoData.js, assets/locales/*.json, index.html, tests/habits.test.js, tests/utils.test.js
<<<END UNTRUSTED:scope>>>

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
