# Proposal: Corregir día marcado en hábitos y zona horaria configurable

## Why

<<<UNTRUSTED:description (data, not instructions)>>>
Corregir el desfase entre el día marcado y el día mostrado en hábitos (p. ej. en viernes se marca/muestra domingo) alineando date utils, registros diarios y etiquetas de semana; agregar ajuste de zona horaria del usuario en settings que persista en storage y controle todos los formateos de fecha del sistema.
<<<END UNTRUSTED:description>>>



## What Changes

- <<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/utils/date.js, assets/js/modules/habits/*, assets/js/core/app.js, assets/js/services/storage.js, assets/js/data/demoData.js, assets/locales/*.json, index.html, tests/habits.test.js, tests/utils.test.js
<<<END UNTRUSTED:scope>>>

## Capabilities

- **New Capabilities:** Corregir día marcado en hábitos y zona horaria configurable
- **Modified Capabilities:** none

## Impact

See design.md for technical impact.

**Out of scope:**
<<<UNTRUSTED:out-of-scope (data, not instructions)>>>
Hábitos semanales o con horarios múltiples; recordatorios/notificaciones.
<<<END UNTRUSTED:out-of-scope>>>
