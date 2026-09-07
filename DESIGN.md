# DESIGN.md

> Documento vivo que describe el diseño, la arquitectura visual y las
> decisiones de implementación de **Frontend Fundamentals Lab** (Daily
> Operating System).

## 1. Propósito del Documento

Este documento describe el concepto de producto, el sistema de diseño, la
arquitectura visual, el template HTML y la integración con TailwindCSS del
proyecto **Frontend Fundamentals Lab**.

Sirve como referencia única para:

- Entender **cómo está construida la SPA** que ve el usuario al abrir
  `index.html`.
- Conocer **por qué** se tomaron decisiones de diseño visual, responsive,
  accesibilidad y motion.
- Servir de guía para **evolucionar** la UI sin romper los principios base.
- Documentar el **contrato** entre el template `index.html`, el CSS
  compilado de Tailwind y los módulos JavaScript.

El documento refleja el estado del proyecto en la rama
`module-13-modules-refactor` (v0.0.17), tras la migración del monolito
`assets/js/app.js` a la arquitectura modular ES6.

## 2. Concepto de Producto

Frontend Fundamentals Lab es una **SPA de productividad personal** construida
con HTML semántico, CSS (Tailwind compilado) y JavaScript puro — sin
framework, sin bundler para la app, sin cuentas de usuario. Funciona como un
**Daily Operating System** personal: una caja de herramientas para registrar
y operar la rutina diaria (tareas, hábitos, notas, presupuestos) desde el
navegador, con datos locales y soporte offline instalable.

### 2.1 Identidad visual

La identidad visual actual toma prestados elementos del lenguaje de
**videojuegos de rol con barras de XP**:

- **Acento verde eléctrico** como color primario (`xp-primary` `#0acc71`).
- **Acento azul** para acciones secundarias (`xp-secondary` `#007acc`).
- **Amarillo cálido** para advertencias (`xp-warning` `#b57800`).
- **Rojo intenso** para peligro (`xp-danger` `#ff0055`).
- **Fondos oscuros profundos** (`xp-dark` `#0a0e1a`, `xp-darker` `#05070f`)
  que evocan un "modo terminal".
- **Bordes pixelados** vía `clip-path` (`.pixel-corners`) en botones de
  navegación, como guiño retro.
- **Tipografía dual**: `Nova Square` para titulares y `Open Sans` para el
  cuerpo, en una mezcla de display + lectura cómoda.

### 2.2 Lo que la app debe seguir haciendo

- Entrada rápida desde móvil.
- Información clave visible en el dashboard.
- Acciones de baja fricción.
- Persistencia local sin requerir cuenta.
- Experiencia instalable y usable sin conexión.
- Feedback inmediato después de cada acción.

## 3. Principios de Diseño

### 3.1 Mobile First

La experiencia se diseña primero para pantallas pequeñas. La versión móvil
**no es una versión reducida** de desktop: es la base.

**Criterios actuales (implementados en `index.html`):**

- Navegación principal fija en la parte inferior en móvil (`<nav>` con clase
  `md:hidden`, `fixed bottom-0`).
- Sidebar fijo a la izquierda solo a partir de `md` (`hidden md:block`).
- Top bar móvil sticky con acceso rápido a Settings y PWA install
  (`md:hidden sticky top-0`).
- Contenido en una columna por defecto; grids progresivos (`grid-cols-2
  md:grid-cols-4`).
- Padding base compacto (`p-4`) y mayor respiración en desktop (`md:p-6`).
- `main` con `pb-20` en móvil para no quedar oculto bajo la nav inferior y
  `md:pb-6 md:ml-64` en desktop para liberar el sidebar.
- Tap targets mínimos de **44×44 px** garantizados en
  `assets/css/styles.css` (`button, a, input, select { min-height: 44px;
  min-width: 44px; }`), con excepciones para `btn-icon` y `btn-compact`.

**Lineamiento:**

- Toda nueva pantalla debe funcionar correctamente desde 360px de ancho.
- Las acciones principales deben alcanzarse con el pulgar.
- No depender de hover para flujos críticos.
- Evitar tablas rígidas; preferir cards, listas y resúmenes apilables.
- Mantener filtros y botones en layouts que puedan envolver o desplazarse
  sin romper el contenido.

### 3.2 Offline First

La app está pensada para seguir siendo útil sin conexión. Los datos viven
en `localStorage` y un service worker (`sw.js`) cachea recursos
esenciales.

**Implementación actual:**

- `sw.js` registra el cache `pwa-cache-v4`.
- Se precachean HTML, CSS, JavaScript modular, locales y manifests.
- HTML, scripts, estilos y locales usan estrategia **network-first** con
  fallback a cache.
- Assets estables (imágenes, favicons) usan estrategia **cache-first**.
- La activación limpia cachés antiguas y reclama clientes con
  `clients.claim()`.
- El servicio `i18n.js` invalida el cache de locales antes de cambiar de
  idioma para evitar servir traducciones desactualizadas desde la PWA
  (`invalidateLocaleCache`).

**Lineamiento:**

- Las funciones core no deben depender de APIs remotas para operar.
- Cualquier integración futura con backend debe degradar correctamente a
  modo offline.
- Los estados de error de red deben ser claros y recuperables.
- Exportación/importación JSON debe seguir existiendo como respaldo manual.

### 3.3 Feedback Inmediato

Cada acción importante debe comunicar resultado sin bloquear al usuario.

**Implementación actual:**

- Toasts para confirmaciones y errores (`#toast-container` `fixed top-4
  right-4 z-50`).
- Toast con deshacer (`#undo-toast`) para acciones destructivas reversibles.
- Transición `fadeIn 0.2s ease-out` al cambiar de pantalla
  (`.screen.active` en `styles.css`).
- Confeti (`launchConfetti`) en hitos como `habit:allCompleted` y cada 10
  visitas al contador.
- Estados activos en navegación (botón seleccionado con `bg-xp-primary`).
- Barras de progreso para presupuesto y avance de hábitos.

**Lineamiento:**

- Toda acción destructiva debe pedir confirmación o permitir deshacer.
- Los mensajes deben ser breves y accionables.
- El feedback visual debe reforzar el estado real del sistema, no decorar
  sin propósito.
- Las microanimaciones deben durar poco y no bloquear la interacción.

### 3.4 Claridad Sobre Densidad

La aplicación muestra datos operativos personales. La UI prioriza lectura
rápida, jerarquía clara y acciones evidentes.

**Lineamiento:**

- El dashboard debe resumir lo más importante del día.
- Cada módulo debe tener una acción primaria evidente.
- Los estados vacíos deben indicar el siguiente paso.
- Los textos largos deben ir en notas o detalles, no en tarjetas de
  resumen.
- Los formularios deben agrupar campos relacionados y evitar capturar
  datos que no se usan.

### 3.5 Sin Gamificación Agresiva

Aunque el lenguaje visual apela a "XP", el producto no debe empujar al
usuario hacia métricas obsesivas. La gamificación es decorativa, no
coercitiva:

- Rachas como motivación, no como culpa.
- Confeti y recompensas solo en hitos reales (completar hábitos del día,
  múltiplos de 10 visitas).
- No hay notificaciones push, niveles competitivos ni métricas
  comparativas.

## 4. Template `index.html`

`index.html` es el documento raíz de la SPA. Está organizado como un layout
de tres bloques (nav inferior móvil, sidebar desktop, main) más
contenedores auxiliares (modal, toasts, undo toast).

### 4.1 Layout general

```
<body class="bg-gray-50 dark:bg-xp-darker ...">
  ├─ <noscript> GTM iframe
  ├─ <nav> Bottom navigation (md:hidden)
  ├─ <aside> Sidebar (hidden md:block)
  └─ <main class="pb-20 md:pb-6 md:ml-64">
       ├─ Top bar móvil (md:hidden sticky top-0)
       ├─ <div id="home-screen" class="screen active">
       ├─ <div id="budgets-screen" class="screen">
       ├─ <div id="tasks-screen" class="screen">
       ├─ <div id="notes-screen" class="screen">
       ├─ <div id="habits-screen" class="screen">
       └─ <div id="settings-screen" class="screen">
  ├─ #modal-backdrop (oculto, inyecta contenido)
  ├─ #toast-container (fixed top-right)
  └─ #undo-toast (fixed bottom)
```

### 4.2 Sistema de pantallas (`.screen`)

Todas las pantallas comparten el contrato:

- Son `div` con clase `.screen` (ocultas por defecto: `display: none`).
- Solo una está activa a la vez: `.screen.active` (mostrada con
  animación `fadeIn 0.2s`).
- El switching lo hace `DOSApp.navigateTo(screenName)`, que además
  persiste la pantalla actual en `localStorage`.

Pantallas implementadas:

| ID | Nombre | Propósito |
| --- | --- | --- |
| `#home-screen` | Home | Resumen del día: racha, tareas, presupuesto, notas, MITs, hábitos de hoy, actividad reciente. |
| `#budgets-screen` | Budgets | Lista de presupuestos y creación de nuevos. Render delegado a `BudgetsModule`. |
| `#tasks-screen` | Tasks | Tareas y checklist con filtros (`all`, `today`, `high`, `completed`). |
| `#notes-screen` | Notes | Notas Markdown con búsqueda en cliente. |
| `#habits-screen` | Habits | Tracker de hábitos con racha actual y tasa de completado. |
| `#settings-screen` | Settings | Tema, idioma, gestión de datos, acerca de. |

### 4.3 Navegación

**Móvil (`md:hidden`):** barra inferior fija (`fixed bottom-0`) con 5
botones (`home`, `budgets`, `tasks`, `notes`, `habits`) + acceso a
Settings desde la top bar. Cada botón usa `app.navigateTo('xxx')` y
lleva `data-screen` para marcar el estado activo.

**Desktop (`hidden md:block`):** sidebar fijo a la izquierda (`fixed
left-0 top-0 bottom-0 w-64`) con los mismos 5 destinos + Settings,
separados por un divisor. Cada botón usa `class="nav-btn ..."` con
`pixel-corners` y la transición `hover:bg-gray-100
dark:hover:bg-xp-darker`.

**Contrato de los botones de navegación:**

- `onclick="app.navigateTo('<screen>')"`.
- `data-screen="<screen>"` (permite resaltar el activo desde CSS/JS).
- `class="nav-btn ..."` (ancla visual común).

### 4.4 Handlers inline y fachada `window.app`

`index.html` mantiene handlers `onclick` legibles que delegan en métodos
expuestos por `DOSApp`. La fachada se crea en `assets/js/main.js`:

```js
window.app = app
```

Los 14 métodos invocados desde HTML son la **fachada pública** de la
app:

- Navegación: `navigateTo`
- Modales: `showCreateBudgetModal`, `showCreateTaskModal`,
  `showCreateNoteModal`, `showHabitTemplatesModal`, `closeModal`,
  `showImportModal`
- Datos: `exportData`, `resetToDemo`, `clearAllData`, `performUndo`
- Filtros: `filterTasks`, `searchNotes`
- Tema: `toggleTheme`

Esta fachada es deuda técnica documentada en `STATUS.md`; el plan es
migrar a delegación `data-action` y retirarla.

### 4.5 Modal, Toasts y Undo

- **Modal:** `#modal-backdrop` con `z-50` y `#modal-content` (`max-w-2xl
  w-full max-h-[90vh] overflow-y-auto`). La lógica de mostrar/ocultar
  vive en `DOSApp._bindModalEvents()` y los módulos emiten
  `modal:open` / `modal:close` al `eventBus`.
- **Toasts:** `#toast-container` (`fixed top-4 right-4 z-50 space-y-2`).
  `DOSApp.showToast(message, type)` se dispara desde el evento
  `toast:show` del bus.
- **Undo:** `#undo-toast` con posicionamiento adaptativo
  (`bottom-24 md:bottom-8`) para no chocar con la nav inferior móvil.
  `DOSApp.performUndo()` revierte la última acción destructiva
  registrada.

### 4.6 SEO, accesibilidad y performance del template

El template aplica un set curado de prácticas de SEO y performance
(documentadas en detalle en `docs/seo-best-practices.md` y
`docs/optimizacion-lighthouse.md`):

- `<html lang="es" id="html-root">` y `<meta charset="UTF-8" />`.
- `meta viewport` correcto para mobile-first indexing.
- `meta description` rico en palabras clave y `meta robots` con
  directivas `max-snippet:-1`, `max-image-preview:large`.
- `<link rel="canonical">` y `<link rel="alternate" hreflang="es|en|
  x-default">` para evitar duplicidad.
- Open Graph y Twitter Card con dimensiones explícitas y `og:image:alt`.
- **JSON-LD** con tres esquemas: `WebSite` + `Person` + `Organization`,
  `Course` y `BreadcrumbList`.
- **Preconnect** a `fonts.googleapis.com` y `fonts.gstatic.com`.
- **Preload** de la hoja de Google Fonts con `onload` no-bloqueante y
  `<noscript>` fallback.
- Tailwind compilado (`assets/css/tailwind.min.css`), **no CDN**, para
  no penalizar Lighthouse.
- Favicons completos (`favicon.ico`, `apple-touch-icon.png`,
  `favicon-32x32.png`, `favicon-16x16.png`, `site.webmanifest`).
- `theme-color` y `msapplication-TileColor` alineados con la paleta
  oscura.
- Iframe `<noscript>` y script inline de Google Tag Manager
  (`GTM-N9PXJX8V`) instalados al final del body para minimizar impacto
  en LCP.
- PWA install button (`#pwa-install-btn`) que captura
  `beforeinstallprompt` y solo aparece si la app **no** está ya
  instalada como standalone.

## 5. Sistema de Diseño Visual

### 5.1 Paleta de colores

Definida en `tailwind.config.cjs` bajo `theme.extend.colors.xp` y
consumida como `bg-xp-primary`, `text-xp-primary-text`, etc.

| Token | HEX | Uso |
| --- | --- | --- |
| `xp-primary` | `#0acc71` | Color de marca, CTA primarios, hitos de racha. |
| `xp-primary-text` | `#0a9e57` | Texto sobre fondos claros que requieren contraste. |
| `xp-secondary` | `#007acc` | Acciones informativas (exportar, depósito). |
| `xp-danger` | `#ff0055` | Acciones destructivas, eliminar. |
| `xp-warning` | `#b57800` | Reset, atención suave. |
| `xp-dark` | `#0a0e1a` | Fondo secundario en dark mode. |
| `xp-darker` | `#05070f` | Fondo base en dark mode. |
| `xp-card` | `#131829` | Fondo de tarjetas en dark mode. |

En modo claro se usan los grises de Tailwind (`bg-gray-50`,
`text-gray-900`, `border-gray-200`) y en modo oscuro los tokens `xp-*`
con texto `text-gray-100` / `text-gray-400`.

### 5.2 Tipografía

Cargadas desde Google Fonts con `font-display=swap` (vía preload +
onload):

- **`Nova Square`** (display): titulares, encabezados de pantalla
  (`h1` global, marca "Productivity XP" en sidebar/top bar).
- **`Open Sans`** (400, 600, 700, italic 400): cuerpo de texto,
  botones, formularios, párrafos.

Stack de fallback definido en `styles.css`:

```css
font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, sans-serif;
```

Tamaño base `body { font-size: 18px; }` para mejorar lectura en móvil
sin perder densidad.

### 5.3 Componentes visuales clave

| Componente | Implementación |
| --- | --- |
| Card | `bg-white dark:bg-xp-card rounded-xl p-4\|6 border-2 border-gray-200 dark:border-xp-primary/20` |
| Botón primario | `bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold px-6 py-3 rounded-lg transition-all` |
| Botón secundario (settings) | `bg-xp-secondary/20 hover:bg-xp-secondary/30` |
| Botón destructivo | `bg-xp-danger/20 hover:bg-xp-danger/30` |
| Nav-btn | `nav-btn` + `pixel-corners` + `hover:bg-gray-100 dark:hover:bg-xp-darker` |
| Toggle de tema | Switch Tailwind clásico (`peer`, `peer-checked:after:translate-x-full`). |
| Tarjeta de presupuesto | Render delegado a `BudgetsModule` dentro de `#budgets-list`. |
| Tarjeta de hábito | Render delegado a `HabitsModule` dentro de `#habits-list`. |
| Filtros de tareas | `<button class="task-filter-btn" data-filter="...">` con estado activo `bg-xp-primary text-xp-darker`. |

### 5.4 Iconografía

Por simplicidad y para mantener el bundle pequeño, se usan **emojis**
como iconos en la nav, encabezados y tarjetas (`🏠`, `💰`, `✓`, `📝`,
`🎯`, `⚙️`, `⚡`). Esta decisión es consciente: la iconografía emoji es
universal, no requiere sprites, no bloquea el render y es coherente
con el tono informal del producto.

### 5.5 Pixel-corners y guiño retro

`.pixel-corners` (en `assets/css/styles.css`) aplica
`clip-path: polygon(...)` con un bisel de 4px para dar bordes
pixelados. Se usa en los botones de navegación del sidebar y top bar
para reforzar la estética "XP". Es decorativa y no afecta la
accesibilidad: el contenido textual sigue siendo claro.

### 5.6 Animaciones

Definidas en `styles.css`:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.screen.active { animation: fadeIn 0.2s ease-out; }
```

- Transición de tema: `transition-colors duration-300` en `<body>`
  para que el cambio de dark/light mode sea suave.
- Confeti: `launchConfetti()` (en `utils/confetti.js`) se dispara en
  hitos (racha, visitas) y está protegido con guarda defensiva si no
  hay contexto canvas 2D.

## 6. TailwindCSS: Integración y Decisiones

### 6.1 Por qué Tailwind compilado (no CDN)

- **Performance**: el navegador descarga un CSS ya compilado y
  minificado (`tailwind.min.css`, ~24KB) en lugar del runtime JIT de
  Tailwind.
- **Estrategia offline-first coherente**: el CSS compilado se puede
  precachear desde el service worker junto al resto de assets.
- **Predictibilidad**: las clases están disponibles en el HTML sin
  dependencia de red en tiempo de ejecución.
- **Mismo modelo en CI y producción**: `npm run build:css` regenera
  el bundle antes de cada deploy.

### 6.2 Pipeline de build

Definido en `package.json`:

```json
"scripts": {
  "build:css": "tailwindcss -i assets/css/tailwind.input.css -o assets/css/tailwind.min.css --minify"
}
```

Flujo:

1. Editar `index.html` o `assets/js/**/*.js` (pueden contener clases
   Tailwind usadas por módulos).
2. Ejecutar `npm run build:css` para regenerar `tailwind.min.css`.
3. Confirmar que el cambio quedó en el HTML servido.

`content: ["./index.html", "./assets/js/**/*.js"]` en
`tailwind.config.cjs` garantiza que el JIT escanee tanto el template
como los módulos para incluir solo las clases efectivamente usadas.

### 6.3 Tema personalizado

`tailwind.config.cjs` extiende la paleta con `xp` y declara
`darkMode: "class"`. Esto habilita el patrón:

```html
<body class="bg-gray-50 dark:bg-xp-darker text-gray-900 dark:text-gray-100">
```

La clase `dark` se aplica en `<html>` desde `assets/js/theme.js` al
cargar, respetando `localStorage.theme` o `prefers-color-scheme`.

`assets/js/tailwindcss.js` mantiene un duplicado de la configuración
para referencia/documentación (no se usa en runtime; la fuente de
verdad es `tailwind.config.cjs`).

### 6.4 Contraste y accesibilidad del color

Decisiones explícitas para mantener contraste WCAG AA:

- Texto principal claro `text-gray-900` sobre `bg-gray-50` (ratio >
  15:1).
- Texto principal oscuro `text-gray-100` sobre `bg-xp-darker` (ratio
  > 14:1).
- Texto secundario `text-gray-600 dark:text-gray-400` (ratio ~7:1).
- Botón primario `bg-xp-primary` con texto `text-xp-darker` (ratio
  > 7:1).
- Estados activos de nav: `bg-xp-primary text-xp-darker` (contraste
  alto).
- Botones destructivos/atención usan **fondos tintados con 20-30% de
  opacidad** para que el texto siga siendo el elemento dominante.

Deuda pendiente: revisar combinaciones secundarias en modo claro y
agregar soporte para `prefers-reduced-motion` (ver §10).

### 6.5 Convenciones de uso

- **Clases de Tailwind primero**: solo se recurre a `styles.css` para
  reglas que Tailwind no cubre de forma natural (pixel-corners, tap
  targets, fadeIn, reset, `.screen`).
- **No usar CDN**: cualquier cambio de diseño pasa por
  `npm run build:css`.
- **Mobile-first**: orden recomendado `base, md:, lg:` al componer
  utilities.
- **Estados activos con tokens `xp-*`**: `bg-xp-primary`,
  `text-xp-primary-text`, `bg-xp-card` en dark mode.

## 7. Arquitectura de Implementación

El template `index.html` se apoya en una arquitectura modular ES6 que
convive en dos etapas (la legacy ya está eliminada tras el cutover de
v0.0.17):

```
assets/js/
  main.js                  — bootstrap: i18n → app.init() → window.app + SW
  core/
    app.js                 — DOSApp: orquestador, routing, modal, toasts,
                             undo, tema, datos, fachada pública
    eventBus.js            — pub/sub entre módulos
  services/
    storage.js             — localStorage con migración (dos-app-data-v2)
    i18n.js                — i18n es/en con invalidación de cache PWA
    visitTracker.js        — contador de visitas y rachas
  modules/
    budgets/{index,models,templates}.js
    tasks/{index,models,templates}.js
    habits/{index,models,templates}.js
    notes/{index,models,templates}.js
    home/{index,templates}.js
  components/
    shareModal.js          — modal reutilizable de compartir
  utils/
    {confetti,date,html,id}.js
  data/
    demoData.js            — datos semilla
  theme.js                 — inicialización de dark mode (preload)
  tailwindcss.js           — referencia de tema (no runtime)
  analytics.js             — GA4 + GTM + métricas locales
```

Detalles:

- `DOSApp` (en `core/app.js`) es el único punto de entrada.
  `main.js` lo importa, inyecta el servicio `i18n` y lo expone como
  `window.app` para atender los handlers `onclick` del HTML.
- Los módulos se comunican entre sí **exclusivamente** vía
  `EventBus`. No hay referencias cruzadas entre módulos.
- `StorageService` lee/escribe la clave `dos-app-data-v2` y migra
  automáticamente desde `dos-app-data-v1` cuando detecta el formato
  legacy.
- Los **tagged template literals** (`html` tag en `templates.js`)
  hacen escape automático de valores, evitando XSS en módulos como
  `BudgetsModule`.
- Los módulos exponen un método `reload()` que el orquestador llama
  tras import/reset/clear, recargando datos **sin duplicar listeners**
  del `eventBus`.

### 7.1 Eventos clave del `EventBus`

Emitidos por los módulos:

- `budget:created`, `budget:deleted`, `budget:itemAdded`,
  `budget:itemRemoved`, `budget:transactionAdded`.
- `task:created`, `task:updated`, `task:deleted`, `task:toggled`.
- `habit:created`, `habit:updated`, `habit:deleted`, `habit:toggled`,
  `habit:allCompleted`.
- `note:created`, `note:updated`, `note:deleted`, `note:search`.
- `data:exported`, `data:imported`, `theme:changed`,
  `streak:milestone`, `share:action`.

Consumidos por `DOSApp`:

- `toast:show` → render toast.
- `modal:open` / `modal:close` → mostrar/ocultar `#modal-backdrop`.
- `screen:change` → refrescar resaltado de nav.

### 7.2 Internacionalización

- Locales: `assets/locales/es.json` (primario) y
  `assets/locales/en.json`.
- HTML: `data-i18n="clave.con.puntos"` (auto-traducido en
  `I18n.init()`).
- Placeholders y ARIA: `data-i18n-placeholder`,
  `data-i18n-aria-label`.
- JS: `I18n.getMessage("clave")` o `I18n.t("clave", { param })` para
  interpolación.
- **Regla:** cualquier clave nueva debe agregarse a **ambos**
  locales.
- El servicio `i18n.js` invalida el cache de locales del SW antes de
  cambiar de idioma, evitando que en móvil se sigan mostrando
  etiquetas en lugar de traducciones.

## 8. PWA, Performance y Observabilidad

### 8.1 Service Worker

`sw.js` mantiene el cache `pwa-cache-v4` y precachea 24 archivos
modulares. Estrategia:

- **Network-first** para `document`, `script`, `style` y `json`
  (incluye locales).
- **Cache-first** para assets estables (imágenes, favicons).
- `install` → `skipWaiting()` para activar rápido.
- `activate` → limpia caches antiguas y `clients.claim()`.
- `i18n.js` agrega `invalidateLocaleCache()` para borrar el JSON de la
  cache activa antes de recargar traducciones.

### 8.2 Performance

- Tailwind compilado y minificado (no CDN).
- Scripts con `type="module"` y `defer`.
- Preconnect/preload a Google Fonts.
- Imágenes en WebP/AVIF con `width/height` para evitar CLS.
- `loading="lazy"` en imágenes secundarias (no LCP).
- Tap targets garantizados a 44×44 px en `styles.css`.
- Contenido por pantalla: los módulos renderizan solo lo necesario,
  reduciendo JS no utilizado por ruta.

### 8.3 Observabilidad

- Google Tag Manager (`GTM-N9PXJX8V`) instalado con script diferido
  (`window.addEventListener("load", ...)`) para no penalizar FCP.
- `AnalyticsTracker` (en `assets/js/analytics.js`) envía eventos a
  `dataLayer` y mantiene estadísticas locales en `localStorage` bajo
  `dos_tool_usage_stats` (patrón de uso por herramienta, racha,
  shares).
- `VisitTracker` cuenta visitas y gestiona hitos de racha para
  disparar confeti.

Trade-off documentado en `docs/performance.md`: GTM reduce ~4 puntos
el performance score de Lighthouse a cambio de agilidad operativa en
tags.

## 9. Pantallas en Detalle

### 9.1 Home

Dashboard operativo. Estructura:

1. Encabezado con saludo (`app.screens.home.welcome`) y fecha actual
   (`#current-date`).
2. Hit counter con id `#hit-counter` y enlace a
   `dataLayer`/`VisitTracker`.
3. Grid 2×2 (móvil) / 4×1 (desktop) con KPIs: `home-habits-streak`,
   `home-tasks-done`, `home-budget-remaining`, `home-notes-count`.
4. Bloque "Today's MITs" (`#home-mits-list`).
5. Bloque "Today's Habits" (`#home-habits-list`).
6. Bloque "Recent Activity" (`#home-recent-activity`).

El render es responsabilidad de `HomeModule`; el template solo aporta
la estructura y los hooks de id.

### 9.2 Budgets

- Botón primario "+ New Budget" → `app.showCreateBudgetModal()`.
- Lista `#budgets-list` → renderizada por `BudgetsModule` (incluye
  cards, barras de progreso, modales de detalle).
- Soporta presupuesto tipo "Ahorro" o "Gasto" (ver
  `app.screens.budgets.types`).

### 9.3 Tasks

- Botón "+ New Task" → `app.showCreateTaskModal()`.
- Filtros `data-filter="all|today|high|completed"` →
  `app.filterTasks()`.
- Lista `#tasks-list` → `TasksModule` con drag & drop, subtareas y
  undo.

### 9.4 Notes

- Botón "+ New Note" → `app.showCreateNoteModal()`.
- Buscador `#notes-search` con
  `oninput="app.searchNotes(this.value)"`.
- Lista `#notes-list` → `NotesModule` (Markdown con preview).

### 9.5 Habits

- Botón "+ Add Habit" → `app.showHabitTemplatesModal()`.
- Hero con racha actual (`#habits-current-streak`) y tasa de
  completado (`#habits-completion-rate`).
- Lista `#habits-list` → `HabitsModule` con marcas diarias y confeti
  al completar todos.

### 9.6 Settings

- **Apariencia:** switch de dark mode con `#theme-toggle`
  (`onchange="app.toggleTheme()"`).
- **Idioma:** `#language-selector` poblado desde
  `I18n.currentLanguage`.
- **Datos:** export (`app.exportData()`), import
  (`app.showImportModal()`), reset a demo (`app.resetToDemo()`),
  clear all (`app.clearAllData()`).
- **About:** versión sincronizada desde `package.json` por
  `npm run version:sync`.

## 10. Lineamientos para Nuevas Pantallas

Toda nueva pantalla debe cumplir:

- Diseño móvil primero.
- Una acción primaria clara.
- Estado vacío.
- Estado de error si carga datos o importa archivos.
- Feedback con toast o mensaje inline.
- Soporte para dark mode (clases `dark:*` coherentes con tokens
  `xp-*`).
- Textos en i18n (`data-i18n` en HTML, `I18n.getMessage` en JS,
  claves en ambos locales).
- Persistencia local si modifica datos (vía `StorageService`).
- Tap targets mínimos.
- Pruebas unitarias para lógica y helpers.

**Checklist UX/UI:**

- Se ve bien a 360px, 768px y desktop.
- No hay contenido oculto detrás de la navegación inferior.
- Los botones no se enciman ni cortan texto.
- El modal no excede la altura visible (`max-h-[90vh]`).
- Los estados activos son claros.
- La acción destructiva tiene confirmación o deshacer.
- Si se añade un nuevo color, se documenta en `tailwind.config.cjs` y
  aquí.

## 11. Versionado y Sincronización

- `package.json` es la **fuente única de verdad** para la versión.
- `npm run version:sync` propaga la versión a
  `assets/locales/{es,en}.json`
  (`app.screens.settings.about.version`) y al fallback de texto en
  `index.html`.
- Conventional Commits en español, header ≤ 69 caracteres, sin
  gerundios ni punto final (ver `.agents/rules/commit-style.md`).

## 12. Deuda de Diseño y Mejoras Pendientes

- **Unificación de marca:** conviven los nombres "Frontend
  Fundamentals Lab", "Productivity XP" y "Daily Operating System".
  Decidir cuál es el definitivo y aplicarlo consistentemente en
  HTML, locales y docs.
- **Accesibilidad de modales:** agregar foco controlado, trampa de
  foco y cierre con `Escape`.
- **Soporte para `prefers-reduced-motion`:** deshabilitar o reducir
  `fadeIn`, confeti y transiciones largas para usuarios sensibles al
  movimiento.
- **Migrar handlers `onclick` a delegación `data-action`:** retirar
  la fachada `window.app` y reducir el acoplamiento HTML ↔ DOSApp.
- **Homologar textos hardcodeados** que aún queden fuera de i18n.
- **Documentar la estrategia de actualización del service worker**
  cuando cambien rutas o se agreguen módulos nuevos (incrementar
  `pwa-cache-vN`).
- **Refinar contraste** de combinaciones secundarias en modo claro.
- **Evaluar la sustitución de emojis** por un set de iconos (Lucide,
  Heroicons) si el producto crece en madurez visual.
- **Cobertura de tests visuales** (Playwright) para regresiones de
  UI en breakpoints clave.

## 13. Definición de Calidad

Un cambio de diseño se considera listo cuando:

- Funciona primero en móvil (probado a 360px).
- No rompe navegación ni persistencia.
- Mantiene soporte offline en flujos core.
- Respeta tema claro/oscuro.
- Tiene feedback visible para acciones importantes.
- No introduce regresiones de accesibilidad evidentes.
- Mantiene o mejora performance móvil.
- Regenera `tailwind.min.css` si se usan clases nuevas.
- Está documentado si altera navegación, PWA, persistencia o
  patrones UI.
- Pasa los tests (`npm test`) y no rompe la fachada pública de
  `window.app` (los 14 métodos usados por `index.html`).
