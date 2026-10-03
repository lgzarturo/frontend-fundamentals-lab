# Proposal: Dashboard de telemetría y resumen de uso

## Why

Agregar un contador de uso y métricas locales para mostrar un panel/dashboard. Este panel resumirá en prosa el estado de los hábitos, los objetivos de presupuestos, las tareas pendientes y la telemetría (uso) de la aplicación.



## What Changes

- assets/js/modules/home/*, assets/js/services/storage.js

## Capabilities

- **New Capabilities:** contadores de uso persistentes; resumen narrativo en Inicio.
- **Modified Capabilities:** `StorageService` (clave `usage`); `HomeModule` (conteo y render del resumen).

## Impact

Ver design.md. Archivos adicionales al Scope original: `index.html`, `assets/locales/*.json`, `home/summary.js`.

**Out of scope:** Guardado en servidores remotos o analíticas de terceros.
