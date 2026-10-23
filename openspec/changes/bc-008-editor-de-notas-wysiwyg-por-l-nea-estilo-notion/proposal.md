# Proposal: Editor de notas WYSIWYG por línea estilo Notion

## Why

<<<UNTRUSTED:description (data, not instructions)>>>
Reemplazar el flujo textarea + vista previa por un editor donde cada línea se formatea en vivo mientras se escribe (estilo Notion), con barra de formato por línea; mantener almacenamiento en markdown para compatibilidad con notas existentes.
<<<END UNTRUSTED:description>>>



## What Changes

- <<<UNTRUSTED:scope (data, not instructions)>>>
assets/js/modules/notes/*, assets/js/components/*, index.html, assets/locales/*.json, tests/notes.test.js
<<<END UNTRUSTED:scope>>>

## Capabilities

- **New Capabilities:** Editor de notas WYSIWYG por línea estilo Notion
- **Modified Capabilities:** none

## Impact

See design.md for technical impact.

**Out of scope:**
<<<UNTRUSTED:out-of-scope (data, not instructions)>>>
Bases de datos/tablas Notion, colaboración en tiempo real, arrastrar bloques entre notas, librerías externas de edición.
<<<END UNTRUSTED:out-of-scope>>>
