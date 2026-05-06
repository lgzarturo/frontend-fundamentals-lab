# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

**Frontend Fundamentals Lab** is a learning project and single-page productivity
app ("Daily Operating System" / DOSApp) built with **vanilla HTML, Tailwind CSS
v3, and plain JavaScript** — no build tools, no bundlers, no frameworks. The
entire app runs by opening `index.html` directly in a browser.

There are two coexisting layers:
- **Legacy** — `assets/js/app.js` (~3,500 lines, monolithic, no ES6 modules). Still used by `index.html`.
- **Modular** — `assets/js/core/`, `modules/`, `services/`, `utils/`. ES6 modules, tested with Vitest. Only the `budgets` module is complete; others are stubs.

New code goes in the modular layer. Do not extend the legacy `app.js`.

## Running Locally

```bash
# Open directly (no server needed)
open index.html

# Optional: local server for PWA/service worker testing
npx serve .
```

## Version Management

`package.json` is the single source of truth for the version. Never edit version strings manually in other files.

```bash
npm version patch          # 0.0.15 → 0.0.16 — syncs + commits
npm version minor          # 0.0.15 → 0.1.0  — syncs + commits
npm version major          # 0.0.15 → 1.0.0  — syncs + commits
npm run version:sync       # sync only, no version bump
```

The `version` lifecycle hook auto-propagates to:
- `assets/locales/en.json` → `app.screens.settings.about.version`
- `assets/locales/es.json` → `app.screens.settings.about.version`
- `index.html` → fallback text in the about span

## Testing

```bash
npm install
npm test                 # Run all tests (Vitest)
npm run test:ui          # Tests with browser UI
npm run test:coverage    # Coverage report (v8 provider)
```

Tests live in `tests/`. Use jsdom environment (configured in `vitest.config.js`).

## Architecture

### Entry Points

- `index.html` — Spanish SPA (primary). Uses legacy `app.js`.
- `en/index.html` — English stub (not implemented).
- `sw.js` — Service worker: cache-first for assets, network-first for HTML/JS/CSS.

### Modular Layer (`assets/js/`)

```
core/
  app.js        — DOSApp class: orchestrates modules, EventBus, StorageService
  eventBus.js   — Pub/sub event system (also exports singleton `eventBus`)
modules/
  budgets/
    index.js    — BudgetsModule class (fully implemented)
    models.js   — Budget, BudgetItem, Transaction classes
    templates.js — HTML templates via tagged template literals (auto-escaping)
  tasks/habits/notes/home/  — TODO stubs
services/
  storage.js    — StorageService: reads/writes localStorage `dos-app-data-v2`,
                  migrates legacy `dos-app-data-v1` automatically
utils/
  id.js / date.js / html.js
data/
  demoData.js
```

### Inter-Module Communication

Modules communicate via `EventBus` — never direct references between modules.

Key events emitted by `BudgetsModule`:
`budget:created`, `budget:deleted`, `budget:itemAdded`, `budget:itemRemoved`, `budget:transactionAdded`

Key events consumed by `DOSApp`:
`toast:show`, `modal:close`, `screen:change`

### Internationalization

- Locale files: `assets/locales/es.json` (primary), `assets/locales/en.json`.
- HTML: `data-i18n="dotted.key.path"` attributes.
- JS: `I18n.getMessage("key")` / `I18n.t("key", params)`.
- `I18n.init()` on startup; `I18n.setLanguage(lang)` to switch.
- Always add keys to **both** locale files.

### State & Persistence

- Storage key: `dos-app-data-v2` (StorageService migrates from v1 automatically).
- Settings (theme, currency, firstDayOfWeek, language) are part of app state.
- Export/import as JSON available from Settings screen.

### Screens

SPA shows one screen at a time via visibility toggling. Screen names:
`home`, `budgets`, `tasks`, `habits`, `notes`, `settings`.

## Key Conventions

- **No build pipeline for the app** — Vitest is only for unit tests of the modular layer.
- **Tailwind classes only** — `assets/css/styles.css` has minimal custom overrides.
- **Dark mode by default** — class-based (`dark` on `<html>`), initialized by `theme.js`.
- **Mobile-first** — `sm:`, `md:`, `lg:` Tailwind breakpoints.
- **Spanish primary** — always add i18n keys to both `es.json` and `en.json`.
- **StandardJS style** — no semicolons (except where required), 2-space indent, single quotes.
- **Tagged template literals** for HTML in modules — use the `html` tag from `templates.js` for auto-escaping.
- Features **not** to implement: ML, gamification, streaks, push notifications, custom habits, free-form long text fields.
