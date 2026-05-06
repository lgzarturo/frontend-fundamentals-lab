# AGENTS.md

## What this is

Vanilla HTML + Tailwind CSS v3 + JS SPA ("Daily Operating System"). No bundler, no framework, no build step for the app itself. Tests use Vitest.

## Run the app

Open `index.html` directly in a browser. For PWA/service-worker testing: `npx serve .`

## Tests

```bash
npm install   # required — vitest is a devDependency
npm test      # runs all tests (vitest, jsdom environment)
```

- Tests live in `tests/*.test.js`
- Imports use relative paths to source: `import { ... } from "../assets/js/services/storage.js"`
- `localStorage` is mocked in tests (jsdom doesn't persist)
- Coverage: `npm run test:coverage`

## Code style

- **Double quotes, no semicolons** — this is the real convention (Prettier, ESLint, editorconfig all agree)
- 2-space indent, no trailing commas, max 80 chars
- StandardJS-inspired but with double quotes (not single)
- Prettier is the formatter; ESLint validates

## Commits

- **Conventional Commits in Spanish** — see `.agents/rules/commit-style.md`
- Header max 69 chars, no gerunds, no period
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

## Architecture

```
assets/js/
  core/app.js          — DOSApp class (orchestrator, screen routing, state)
  core/eventBus.js     — pub/sub for module communication
  modules/<domain>/    — feature modules (budgets/, tasks/, habits/, notes/, home/)
  services/storage.js  — localStorage wrapper with migration (key: dos-app-data-v2)
  utils/               — pure helpers (date.js, html.js, id.js)
  data/demoData.js     — seed data for reset
  app.js               — legacy monolith (being migrated to modular架构)
```

- Only `BudgetsModule` is implemented; tasks/habits/notes/home modules are empty shells
- `DOSApp` is instantiated as `application` in `index.html`
- State persisted to `localStorage` key `dos-app-data-v2`

## i18n

- Spanish primary. Always add keys to `assets/locales/es.json` first, then `en.json`
- HTML: `data-i18n="key.path"` attributes auto-translated on load
- JS: `I18n.getMessage("key")` or `I18n.t("key", { param })` for interpolation

## Do NOT

- No ML, gamification, streaks, notifications, custom habits, free-form long text fields
- Don't introduce npm/bundlers for app code (only for test tooling)
- Don't use single quotes — the codebase uses double quotes everywhere
