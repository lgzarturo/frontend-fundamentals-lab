# Frontend Fundamentals Lab

[![Netlify Deploy](https://img.shields.io/badge/Netlify-Deploy-%2300ad9f?logo=netlify)](https://task-manager.lgzarturo.com/)
![Website](https://img.shields.io/website?url=https%3A%2F%2Ftask-manager.lgzarturo.com%2F)
![GitHub Release](https://img.shields.io/github/v/release/lgzarturo/frontend-fundamentals-lab)

En este repositorio documentaré mi proceso de aprendizaje y práctica para
dominar los fundamentos del desarrollo frontend.

Cada módulo y proyecto está diseñado para entender cómo funciona la web desde su
base: estructura (HTML), presentación (CSS) y comportamiento (JavaScript).

El enfoque no es acumular frameworks, sino dominar los principios que hacen
posible cualquier tecnología moderna del frontend.

> La aplicación es una idea que surge de mi necesidad personal de organizar mis
> tareas, presupuesto y notas en un solo lugar, aplicando lo que voy
> aprendiendo.

---

## 🚀 Objetivo

Construir una base sólida de conocimiento aplicando los fundamentos directamente
en proyectos funcionales. A través de cada entrega se busca:

- Aprender _cómo_ y _por qué_ funcionan las cosas en el navegador.
- Escribir código claro, mantenible y semántico.
- Practicar buenas prácticas de UX/UI con un enfoque mobile-first.
- Reforzar conceptos de manipulación del DOM, eventos, estado, asincronía y
  persistencia local.
- Se irán recomendando lecturas y recursos adicionales para profundizar en cada
  tema.

> Solo pido paciencia y comprensión, ya que este es un proyecto personal en
> constante evolución.

---

## 🧩 Proyecto principal: Productivity Toolbox SPA

Aplicación web de una sola página construida con **HTML**, **Tailwind CSS v3** y
**JavaScript puro**, orientada a la productividad personal. Tailwind se compila
a CSS estático de producción para evitar el compilador JIT en el navegador.
Incluye un gestor de
presupuesto, tareas, notas en markdown y seguimiento de hábitos, con
almacenamiento en `localStorage`.

**Características clave:**

- Modo oscuro por defecto.
- Totalmente responsive y usable sin conexión.
- Persistencia local y exportación/importación de datos en JSON.
- Microinteracciones sutiles inspiradas en videojuegos.
- Accesibilidad y experiencia fluida en móvil.

El objetivo no es solo construir la app, sino **aprender profundamente los
fundamentos del frontend a través de su desarrollo**.

---

## 📚 Índice de Documentación

Documentación técnica y educativa para desarrolladores y programadores juniors.

### 1. Fundamentos del Frontend

- [Entendiendo la estructura HTML](/docs/index-documentacion.md) — Estructura,
  metadatos, SEO, accesibilidad
- [Configuración de Google Tag Manager](/docs/tag-manager.md) — Telemetría
  básica

### 2. CSS y Diseño

- [Integración TailwindCSS](/docs/tailwind-css.md) — Framework utility-first con
  CSS estático generado por CLI
- [Estilo StandardJS](/docs/standardjs-best-practices.md) — Convenciones de
  código

### 3. JavaScript

- [Fundamentos JS](/docs/fundamentos-javascript.md) — DOM, localStorage,
  contador de visitas
- [Lógica de la app](/docs/javascript-actions-app.md) — Gestión de hábitos
- [Código app.js](/docs/codigo-app_js.md) — Explicación detallada
- [Guía fullstack JS/TS](/docs/guia-fullstack-javascript.md) — Ruta de estudio
  (6 meses)

### 4. Características de la App

- [Productivity XP](/docs/caracteristicas-productivity-xp.md) — Todas las
  funcionalidades

### 5. i18n y Temas

- [Sistema i18n y Tema](/docs/i18n-theme.md) — Internacionalización y tema
  oscuro/claro
- [Plantillas dinámicas](/docs/templates-dinamicos-i18n.md) — Templates
  dinámicos
- [Completar traducciones](/docs/i18n-terminando-traducciones.md) — Traducciones
  pendientes

### 6. Arquitectura y Mejoras

- [Arquitectura modular](/docs/MODULAR_ARCHITECTURE.md) — Propuesta de
  arquitectura
- [Mejoras por implementar](/docs/mejoras-por-implementar.md) — Roadmap de
  features
- [Ideas](/docs/ideas.md) — Sugerencias futuras

### 7. Optimización

- [Optimización Lighthouse](/docs/optimizacion-lighthouse.md) — Performance web
- [Mejores prácticas SEO](/docs/seo-best-practices.md) — Posicionamiento
- [Rendimiento](/docs/performance.md) — Optimización

### 8. Planes de Desarrollo

- [Migración a ES6 Modules](/plans/01-plan-javascript-to-modules-es6.md) —
  Estado: en progreso
- [Estimación de desarrollo](/docs/estimacion-plan-desarrollo.md) — Planning

---

## 📂 Estructura general

> El objetivo es mantener una estructura simple y modular para facilitar el
> aprendizaje y la navegación del código. Aplicar buenas prácticas desde el
> inicio.

```plaintext
frontend-fundamentals-lab/
│
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   ├── tailwind.input.css
│   │   └── tailwind.min.css
│   ├── images/
│   │   ├── favicon/
│   │   │   ├── about.txt
│   │   │   ├── android-chrome-192x192.png
│   │   │   ├── android-chrome-512x512.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon.ico
│   │   │   └── site.webmanifest
│   │   ├── web-works-with-html-css-javascript-mobile.avif
│   │   ├── web-works-with-html-css-javascript-mobile.webp
│   │   ├── web-works-with-html-css-javascript-tablet.avif
│   │   ├── web-works-with-html-css-javascript-tablet.webp
│   │   ├── web-works-with-html-css-javascript.avif
│   │   └── web-works-with-html-css-javascript.webp
│   ├── js/
│   │   ├── analytics.js
│   │   ├── app.js
│   │   ├── tailwindcss.js
│   │   └── theme.js
│   └── locales/
│       ├── en.json
│       └── es.json
│
├── components/
│   └── .gitkeep
│
├── docs/
│   ├── caracteristicas-productivity-xp.md
│   ├── codigo-app_js.md
│   ├── fundamentos-javascript.md
│   ├── guia-fullstack-javascript.md
│   ├── i18n-theme.md
│   ├── ideas.md
│   ├── index-documentacion.md
│   ├── javascript-actions-app.md
│   ├── mejoras-por-implementar.md
│   ├── optimizacion-lighthouse.md
│   ├── performance.md
│   ├── standardjs-best-practices.md
│   ├── tag-manager.md
│   └── tailwind-css.md
│
├── en/
│   └── index.html
│
├── roadmap/
│   ├── fundaments-html-css-javascript.md
│   └── .gitkeep
│
├── utils/
│   └── .gitkeep
│
├── index.html
├── sw.js
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

### Propuesta de mejora de estructura

> Gran parte de la estructura actual es provisional y puede mejorarse a medida
> que el proyecto crece. Siempre pensando en DDD (Domain-Driven Design) y
> separación de responsabilidades. Con el tiempo, se pueden crear más carpetas y
> subcarpetas para organizar mejor el código. Pero, de momento, la estructura es
> suficiente para el estado actual del proyecto.

Actualmente, la estructura es clara y modular, pero puede evolucionar para
facilitar la escalabilidad y el mantenimiento a medida que el proyecto crece.
Aquí algunas recomendaciones que se podrían implementar en el futuro:

1. **Separar lógicamente los módulos de la app:**
   - Crear una carpeta `src/` para el código fuente principal (JS, componentes,
     utilidades).
   - Mover `assets/js/` y `utils/` a `src/` y dividir en subcarpetas por dominio
     (`src/tasks/`, `src/notes/`, etc.).

2. **Componentes reutilizables:**
   - Implementar una carpeta `src/components/` para componentes UI reutilizables
     (botones, modales, inputs, etc.).

3. **Pruebas y documentación:**
   - Agregar una carpeta `tests/` para pruebas unitarias y de integración.
   - Mantener la carpeta `docs/` solo para documentación técnica y de usuario.

4. **Internacionalización y temas:**
   - Centralizar la lógica de i18n y temas en `src/core/` o `src/config/` para
     facilitar su mantenimiento y escalabilidad.

5. **Automatización y herramientas:**
   - Incluir scripts de automatización (build, lint, format) en una carpeta
     `scripts/`.

6. **Convenciones de nombres:**
   - Usar nombres consistentes y descriptivos para archivos y carpetas.

**Ejemplo de estructura propuesta:**

```plaintext
frontend-fundamentals-lab/
│
├── src/
│   ├── components/
│   ├── core/           # i18n, temas, configuración global
│   ├── tasks/
│   ├── notes/
│   ├── budgets/
│   ├── habits/
│   ├── utils/
│   └── index.js
│
├── assets/
│   ├── css/
│   ├── images/
│   └── locales/
│
├── docs/
├── tests/
├── scripts/
├── public/            # sw.js, favicon, etc.
├── roadmap/
├── index.html
├── CHANGELOG.md
├── LICENSE
└── README.md
```

Esta estructura facilita la escalabilidad, la colaboración y la integración de
nuevas funcionalidades, manteniendo el proyecto organizado y fácil de navegar.

> Esto es solo un esquema inicial. La estructura puede evolucionar conforme se
> agreguen más funcionalidades y módulos al proyecto. Sin embargo, no lo seguí
> aún ya que el proyecto está en una etapa temprana y no le veo sentido
> fragmentar el código en muchos archivos aún.

---

## 🧠 Aprendizaje y fundamentos

Cada bloque de trabajo se centra en un concepto clave del frontend:

1. **HTML semántico y accesible.**
2. **CSS moderno, mobile first y Tailwind CSS v3.**
3. **DOM y eventos.**
4. **Gestión de estado y almacenamiento local.**
5. **Diseño de interfaces y microinteracciones.**
6. **Arquitectura modular con JavaScript puro.**

La meta es entender la esencia de cada tecnología antes de usar frameworks como
React, Vue o Svelte.

---

## 🧪 Ejecución local

No requiere entorno de desarrollo ni servidor:

1. Clona el repositorio:

   ```bash
   git clone https://github.com/lgzarturo/frontend-fundamentals-lab.git
   ```

2. Abre el archivo index.html en tu navegador.

3. ¡Listo! Todo funciona directamente en el navegador, incluso offline.

### Makefile

Para ejecutar los comandos del proyecto de forma consistente en Windows 11 con
PowerShell y en sistemas POSIX, usa el `Makefile` de la raíz.

```bash
make help
make install
make open
make dev
make build-css
make test
make coverage
```

Comandos disponibles:

| Comando | Equivalente |
|---|---|
| `make install` | `npm install` |
| `make open` | Abre `index.html` directamente |
| `make dev` | `npm run dev` |
| `make build-css` | `npm run build:css` |
| `make test` | `npm run test:run` |
| `make test-ui` | `npm run test:ui` |
| `make coverage` | `npm run test:coverage` |
| `make version-sync` | `npm run version:sync` |
| `make version-patch` | `npm run version:patch` |
| `make version-minor` | `npm run version:minor` |
| `make version-major` | `npm run version:major` |
| `make clean-coverage` | Elimina `coverage/` |

El archivo detecta el sistema operativo con `$(OS)` en Windows y `uname` en
POSIX para usar el shell y comandos de apertura/limpieza adecuados.

### Tailwind CSS

La app no carga Tailwind desde CDN. El CSS de utilidades se genera en
`assets/css/tailwind.min.css` desde `tailwind.config.cjs`.

Ejecuta este comando después de agregar o modificar clases Tailwind en
`index.html` o `assets/js/**/*.js`:

```bash
npm run build:css
```

---

## 🏷️ Gestión de versiones

La versión del proyecto vive en un único lugar: `package.json`. El script
`scripts/version-sync.js` propaga ese valor automáticamente a todos los archivos
que lo necesitan.

**Archivos sincronizados automáticamente:**

| Archivo | Campo |
|---|---|
| `assets/locales/es.json` | `app.screens.settings.about.version` |
| `assets/locales/en.json` | `app.screens.settings.about.version` |
| `index.html` | texto fallback del span `about.version` |
| `CHANGELOG.md` | nueva sección con commits desde el tag anterior |

**Comandos:**

```bash
# Subir versión patch (0.0.15 → 0.0.16)
npm run version:patch

# Subir versión minor (0.0.15 → 0.1.0)
npm run version:minor

# Subir versión major (0.0.15 → 1.0.0)
npm run version:major

# Solo sincronizar sin cambiar versión (idempotente)
npm run version:sync
```

Cada comando sincroniza automáticamente los locales, el fallback en `index.html`
y agrega una nueva entrada en `CHANGELOG.md` con los commits desde el tag
anterior. Al terminar, npm crea un commit y un tag con la nueva versión.

> **Regla:** nunca editar manualmente la versión en `index.html`, los archivos
> de locale ni el `CHANGELOG.md`. Siempre usar `npm version`.

---

## 🔄 Persistencia y exportación

Todos los datos se guardan en localStorage bajo el namespace app_duplex_v1.
Desde la pantalla de configuración se puede:

- Exportar datos como archivo JSON.
- Importar un respaldo existente.
- Reiniciar la app con datos de ejemplo.

---

## 📄 Licencia

[Arturo López](mailto:lgzarturo@gmail.com)

Desarrollador de software especializado en desarrollo fullstack.

Apasionado por los fundamentos, la arquitectura limpia y el aprendizaje continuo
en tecnología.

Los frameworks cambian, los fundamentos permanecen.

Este proyecto está bajo la licencia Creative Commons Attribution 4.0
International (CC BY 4.0).

---

## Futuro

Algunos de mis objetivos para seguir avanzando con este proyecto y mi
aprendizaje:

- Continuar mejorando la aplicación con nuevas características y optimizaciones.
- Explorar la integración de tecnologías emergentes y mejores prácticas.
- Fomentar una comunidad de aprendizaje y colaboración en torno a este proyecto.
- Aprender Typescript y aplicar tipado estático al código existente.
- Investigar sobre pruebas unitarias y de integración para aplicaciones
  frontend.
- Documentar el proceso de aprendizaje y compartir recursos útiles con la
  comunidad.
- Explorar la internacionalización (i18n) para soportar múltiples idiomas en la
  aplicación.
- Optimizar el rendimiento y la accesibilidad de la aplicación.
- Investigar sobre Progressive Web Apps (PWA) y aplicar conceptos para mejorar
  la experiencia offline.
- Explorar la integración con APIs externas para ampliar la funcionalidad de la
  aplicación.
- Investigar sobre metodologías ágiles y aplicarlas en el desarrollo continuo
  del proyecto.
- Explorar la posibilidad de convertir la aplicación en una extensión de
  navegador para facilitar su acceso y uso.
- Integrar React o Vue para comparar enfoques y beneficios frente a JavaScript
  puro.

---

## Mejoras por implementar

> El sistema va a cambiar de nombre a "Daily Operating System (DOS) personal" en
> lugar de "Productivity XP", ya que el objetivo principal era aprender los
> fundamentos del desarrollo frontend a través de la creación de una aplicación
> funcional de productividad personal, sin embargo, al profundizar en el
> proyecto, he decidido enfocar la aplicación hacia un sistema de observabilidad
> personal para monitorear y mejorar mi energía y bienestar diario.

Aquí algunas ideas clave para mejorar la aplicación y alinearla con este nuevo
enfoque:

- Pensar en un dashboard de control para un programador (sobre mí), no un diario
  emocional.
- Realizar un cambio de mentalidad del producto, deja de ser una app de
  "hábitos" o "tareas" como "task manager genérico".
- El objetivo de detectar qué el flujo de trabajo y qué la mantiene estable, a
  la vez que sea simple y rápido de usar.
- Busco tener todo lo necesario a la mano, los módulos ya implementados (tareas,
  notas, presupuesto, hábitos) pueden seguir existiendo pero con un enfoque
  diferente.

---

## Flujo diario en la app (UX concreto)

- Al abrir la app por la mañana
- Pantalla: “Hoy”
- Muestra:
  - Timeline vertical del día
  - Bloques ya creados
  - Checks rápidos

Feature que de momento NO se deben implementar

- Gamificación
- Streaks de hábitos detallados
- Recompensas
- Frases motivacionales
- Objetivos vagos
- ML prematuro

---

## Características clave a implementar

Orden lógico:

1. Template diario fijo
2. Registro rápido de comida + post-comida
3. Daily review + estado anímico
4. Vista semanal correlativa
5. Export simple (PDF o CSV)

La aplicación debe poder ayudar a responder:

> “¿Qué hice en el día, y cómo me sentí?”

Se va a diseñar todo alrededor de esa pregunta.

Decisiones importantes (no negociables)

- ❌ No ML - Demasiado complejo y puede ser invasivo, además de que no es el
  objetivo principal.
- ❌ No campos libres largos - Debe ser medible y rápido, libre de ambigüedades.
- ❌ No “custom habits” - Solo los bloques predefinidos que yo necesito.
- ❌ No gamificación - No es un juego, es una herramienta seria para mejorar mi
  vida.
- ❌ No notificaciones - Quiero abrir la app cuando yo quiera, no que me
  interrumpa.
- ❌ No objetivos vagos - Todo debe ser concreto y medible.
- ❌ No streaks - No busco crear adicción, sino hábitos saludables.
- ✅ Bloques fijos - Cada día tiene los mismos bloques para facilitar el
  registro y tener consistencia.
- ✅ Checks rápidos - Permitir marcar rápidamente acciones o estados sin
  necesidad de escribir mucho.
- ✅ Fotos como evidencia - Permitir adjuntar fotos para tener un registro
  visual.
- ✅ Export simple - Poder exportar los datos de manera sencilla para análisis
  externo.
- ✅ Enfoque en UX - La experiencia de usuario debe ser fluida, rápida y sin
  fricciones.
- ✅ Mobile first - La aplicación debe ser completamente usable desde
  dispositivos móviles.
- ✅ Offline first - La aplicación debe funcionar sin conexión a internet, con
  sincronización cuando sea posible.
