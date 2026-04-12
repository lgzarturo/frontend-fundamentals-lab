# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

**Frontend Fundamentals Lab** is a learning project and single-page productivity
app ("Daily Operating System" / DOSApp) built with **vanilla HTML, Tailwind CSS
v3, and plain JavaScript** — no build tools, no bundlers, no frameworks. The
entire app runs by opening `index.html` directly in a browser.

## Running Locally

No build step or dev server is needed:

```bash
# Just open the file in a browser
open index.html
# Or serve locally (optional, for PWA/service worker testing)
npx serve .
```

No `npm install`, no `package.json`, no transpilation.

## Architecture

### Entry Points

- `index.html` — Spanish SPA (primary). Loads all scripts and contains all
  screen markup as hidden sections.
- `en/index.html` — English version stub (not yet implemented).
- `sw.js` — Service worker for PWA/offline support (cache-first for assets,
  network-first for HTML/JS/CSS).

### JavaScript (`assets/js/`)

- **`app.js`** — The entire application logic. Contains:
  - `DOSApp` class (instantiated as `application`) — manages app state
    (`budgets`, `tasks`, `notes`, `habits`, `settings`), screen routing, and
    localStorage persistence under key `dos-app-data-v1`.
  - `I18n` object — handles translations. Uses `data-i18n="key.path"` attributes
    in HTML, loads locale files from `assets/locales/`, stores current language
    in `localStorage` under `userLanguage`.
  - Screen render functions (`home()`, `budgets()`, `tasks()`, `habits()`,
    `notes()`) — each re-renders the relevant DOM section.
  - Global utilities: `generateId()`, `formatDate()`, `escapeHtml()`,
    `launchConfetti()`, etc.
- **`theme.js`** — Initializes dark/light mode from `localStorage.theme` on page
  load.
- **`tailwindcss.js`** — Tailwind CSS v3 CDN script (inline config, JIT in
  browser).
- **`analytics.js`** — Google Tag Manager / analytics initialization.

### Internationalization

- Translation files: `assets/locales/es.json` (primary) and
  `assets/locales/en.json`.
- HTML elements use `data-i18n="dotted.key.path"` to be auto-translated.
- `I18n.init()` loads translations on startup; `I18n.setLanguage(lang)` switches
  language and re-applies all `data-i18n` bindings.
- `I18n.getMessage("key")` for JS-side lookups; `I18n.t("key", params)` for
  interpolation.

### State & Persistence

- All app data lives in `localStorage` under `dos-app-data-v1`.
- Current screen is also persisted to `localStorage` so the user returns to
  where they left off.
- Settings (theme, currency, firstDayOfWeek, language) are part of app state.
- Export/import as JSON is available from the Settings screen.

### Screens

The SPA shows one screen at a time by toggling visibility of pre-rendered
sections in `index.html`. Screen names: `home`, `budgets`, `tasks`, `habits`,
`notes`, `settings`.

## Key Conventions

- **No build pipeline** — keep JS/CSS as vanilla files; don't introduce npm or
  bundlers.
- **Tailwind classes only** — all styling via Tailwind utility classes;
  `assets/css/styles.css` holds only minimal custom overrides.
- **Dark mode by default** — Tailwind's `dark:` variant is used throughout; dark
  mode is class-based (`dark` on `<html>`).
- **Mobile-first** — responsive breakpoints follow Tailwind's `sm:`, `md:`,
  `lg:` conventions.
- **Spanish primary** — UI strings belong in `assets/locales/es.json`; always
  add matching keys to `en.json`.
- **StandardJS style** — no semicolons (except where required), 2-space
  indentation, single quotes. See `docs/standardjs-best-practices.md`.
- Features **not** to implement: ML, gamification, streaks, notifications,
  custom habits, free-form long text fields.
