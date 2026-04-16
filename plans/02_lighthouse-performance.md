# Plan de Mejora de Rendimiento Lighthouse — Mobile

> Fecha de auditoría: 15 de abril de 2026 URL auditada: http://127.0.0.1:5500/
> Herramienta: Lighthouse 13.0.3 + Chrome DevTools Performance Trace

---

## 1. Puntuaciones Actuales vs. Objetivo

| Categoría      | Actual | Objetivo |
| -------------- | :----: | :------: |
| Performance    |   69   |   90+    |
| Accessibility  |   76   |   95+    |
| Best Practices |  100   |   100    |
| SEO            |  100   |   100    |

---

## 2. Diagnóstico de Performance (Score: 69)

### 2.1 Métricas Core Web Vitals (laboratorio, sin throttling)

| Métrica | Valor medido | Observación                              |
| ------- | :----------: | ---------------------------------------- |
| LCP     |    331 ms    | 99.2% es "element render delay" (328 ms) |
| CLS     |     0.00     | Excelente — mantener                     |
| TTFB    |     3 ms     | Excelente servidor local                 |

> **Advertencia:** Sin throttling de red/CPU, los valores son optimistas. En
> mobile real (Moto G4 / Fast 3G), el LCP y TBT serán drásticamente peores. El
> score de 69 ya refleja esa simulación.

### 2.2 Causas Raíz Identificadas

#### CRÍTICO — Tailwind CSS CDN con JIT en el navegador

- **Transferencia:** 407.3 kB
- **Tiempo en hilo principal:** 170 ms
- **Impacto:** El script `cdn.tailwindcss.com/3.4.17` es JavaScript que compila
  clases CSS en tiempo real en el navegador. Esto bloquea el render y es la
  causa principal del TBT alto y del LCP elevado en mobile.
- **Es render-blocking:** Sí

#### ALTO — Google Tag Manager (GTM)

- **Transferencia:** 826.1 kB
- **Tiempo en hilo principal:** 61 ms
- **Impacto:** GTM carga múltiples recursos de forma sincrónica o muy temprana,
  contribuyendo significativamente al Total Blocking Time.

#### ALTO — Google Fonts (render-blocking)

- **Transferencia:** 86.1 kB
- **Request render-blocking:** Sí
- **Detalle:** La petición CSS a `fonts.googleapis.com` bloquea el render aunque
  tenga `&display=swap`. El CSS de fuentes debe precargarse o cargarse de forma
  no bloqueante.
- **Dos familias:** `Nova Square` + `Open Sans` (peso completo: 300..800)

#### MEDIO — Sin compresión en el servidor HTML

- **Fallo:** El documento HTML no se sirve con compresión (gzip/brotli).
- **Ahorro estimado:** 31.3 kB
- **Impacto en producción:** En hosting con servidor web configurado
  correctamente, esto se resuelve con headers; en desarrollo afecta las
  mediciones.

#### MEDIO — Tamaño del DOM

- **Total de elementos:** 358
- **Profundidad máxima:** 11 nodos
- **Hijos máximos en un nodo:** 20 (`<body>`)
- **Layout update:** 58 ms afectando 108 nodos
- **Causa:** La SPA carga todos los screens en el DOM simultáneamente aunque
  estén ocultos.

#### MEDIO — Cadena de dependencias de red

- Tailwind CDN → redirige internamente (http → https)
- Google Fonts CSS → descarga font files de `fonts.gstatic.com`
- Estas cadenas añaden latencia en condiciones de red reales.

### 2.3 Resumen de Terceros

| Tercero            | Transferencia | Hilo principal |
| ------------------ | :-----------: | :------------: |
| Google Tag Manager |   826.1 kB    |     61 ms      |
| tailwindcss.com    |   407.3 kB    |     170 ms     |
| Google Fonts       |    86.1 kB    |       —        |
| Google Analytics   |     40 B      |       —        |

---

## 3. Diagnóstico de Accesibilidad (Score: 76)

### 3.1 Auditorías Fallidas (score: 0)

#### CRÍTICO — `button-name`: Botones sin nombre accesible (7 elementos)

Todos los botones son icon-only y no tienen `aria-label`, `title` ni texto
interno visible para lectores de pantalla.

| Elemento                             | Selector                                                  | Descripción            |
| ------------------------------------ | --------------------------------------------------------- | ---------------------- |
| `button[data-done-button]` × 3       | `div#home-mits-list > div.flex > button.mt-1`             | Botones de tareas MITs |
| `button[data-habit-done-button]` × 4 | `div#home-habits-list > div.flex > div.flex > button.w-8` | Botones de hábitos     |

**Fix requerido:** Agregar `aria-label` descriptivo a cada botón.

#### CRÍTICO — `color-contrast`: Contraste de color insuficiente (múltiples elementos)

| Elemento                  | Selector                                      | Color fg  | Color bg  | Ratio actual | Ratio requerido |
| ------------------------- | --------------------------------------------- | --------- | --------- | :----------: | :-------------: |
| Nombre de la app (header) | `main > div.md:hidden > h1 > span[data-i18n]` | `#0acc71` | `#ffffff` |     2.12     |       3:1       |
| Tareas hechas "0/4"       | `div#home-tasks-done`                         | `#0099ff` | `#ffffff` |     2.99     |       3:1       |
| Presupuesto "$890"        | `div#home-budget-remaining`                   | `#ffaa00` | `#ffffff` |     1.90     |       3:1       |
| Tags de tareas (pequeños) | `span.text-xs[data-tag-name]`                 | `#0acc71` | `#c9f1df` |     1.73     |      4.5:1      |

---

## 4. Plan de Desarrollo — Tareas Priorizadas

### Fase 1 — Performance Crítico (impacto máximo en score)

#### Tarea P1.1: Reemplazar Tailwind CDN por build de producción

**Prioridad:** CRÍTICA | **Impacto estimado en score:** +15 a +20 puntos

El CDN de Tailwind v3 ejecuta el compilador JIT completo en el navegador. Esto
es aceptable en desarrollo pero devastador para performance en
producción/auditoría.

**Estrategia:** Generar un CSS de producción con solo las clases utilizadas.

```bash
# Instalar Tailwind CLI (solo como devDependency o uso único)
npx tailwindcss -i assets/css/styles.css -o assets/css/tailwind.min.css --minify --content "index.html,assets/js/app.js"
```

**Cambio en `index.html`:**

```html
<!-- ANTES -->
<script src="assets/js/tailwindcss.js"></script>

<!-- DESPUÉS -->
<link rel="stylesheet" href="assets/css/tailwind.min.css" />
```

**Consideraciones:**

- El proyecto no usa build pipeline; este paso se hace una vez y el archivo se
  commitea.
- Mantener `tailwindcss.js` en el repo como referencia o para desarrollo local.
- Agregar script en `package.json` o instrucción en `CLAUDE.md` para regenerar
  el CSS al agregar clases nuevas.
- El CSS generado debería ser < 30 kB minificado + gzip para este proyecto.

---

#### Tarea P1.2: Diferir Google Tag Manager

**Prioridad:** ALTA | **Impacto estimado en score:** +5 a +8 puntos

GTM pesa 826.1 kB y bloquea ~61 ms del hilo principal. Debe cargarse después del
contenido principal.

**Cambio en `index.html`:** Mover el script de GTM al final del `<body>` (antes
de `</body>`) y agregar `defer` si es posible, o usar la técnica de carga
diferida:

```html
<!-- En lugar de cargarlo en <head>, moverlo al final del <body> -->
<!-- O usar setTimeout para diferirlo hasta que el LCP haya ocurrido -->
<script>
  window.addEventListener("load", function () {
    // Cargar GTM después de que la página esté lista
    ;(function (w, d, s, l, i) {
      /* GTM snippet original */
    })(window, document, "script", "dataLayer", "GTM-XXXX")
  })
</script>
```

---

#### Tarea P1.3: Optimizar carga de Google Fonts (no-bloqueante)

**Prioridad:** ALTA | **Impacto estimado en score:** +3 a +5 puntos

Cambiar la estrategia de carga de fuentes para que no bloquee el render:

```html
<!-- ANTES (render-blocking) -->
<link
  href="https://fonts.googleapis.com/css2?family=Nova+Square&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
  rel="stylesheet"
/>

<!-- DESPUÉS (no-bloqueante) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="preload"
  href="https://fonts.googleapis.com/css2?family=Nova+Square&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript
  ><link
    href="https://fonts.googleapis.com/css2?family=Nova+Square&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
    rel="stylesheet"
/></noscript>
```

**Alternativa:** Limitar los pesos de Open Sans a solo los usados (ej. 400
y 700) para reducir 86.1 kB.

---

#### Tarea P1.4: Habilitar compresión del servidor (Gzip/Brotli)

**Prioridad:** MEDIA | **Impacto estimado:** +2 a +3 puntos (en producción)

En desarrollo con `npx serve` o Live Server no hay configuración de compresión.
Para producción (Netlify, Vercel, GitHub Pages) la compresión es automática.
Para medir correctamente en local:

```bash
# Usar un servidor con compresión habilitada para auditorías
npx serve . --no-clipboard
# O usar http-server con gzip
npx http-server . --gzip
```

Para el `sw.js` (Service Worker), agregar headers de caché y servir con
compresión.

---

#### Tarea P1.5: Reducir impacto del DOM en el render inicial

**Prioridad:** MEDIA | **Impacto estimado:** +2 a +4 puntos

La SPA tiene 358 elementos DOM con todos los screens cargados simultáneamente.
Estrategias:

1. **Renderizado diferido de screens:** Solo renderizar el HTML del screen
   activo; los demás screens se renderizan cuando el usuario navega por primera
   vez a ellos.
2. **Placeholder vacío para screens inactivos:** Los `<section>` de screens
   ocultos solo contienen un `<div id="..."></div>` vacío; el contenido se
   inyecta al navegar.

```javascript
// En DOSApp — lazy render de screens
showScreen(name) {
  if (!this.renderedScreens.has(name)) {
    this[name]() // renderiza el screen por primera vez
    this.renderedScreens.add(name)
  }
  // ... lógica de visibilidad
}
```

---

### Fase 2 — Accesibilidad (score: 76 → 95+)

#### Tarea A2.1: Agregar aria-label a botones icon-only

**Prioridad:** CRÍTICA | **Impacto en score:** +10 a +12 puntos

Los 7 botones de completar tareas y hábitos necesitan `aria-label` descriptivo.

**En `assets/js/app.js`** — función `home()` (o donde se generan los botones):

```javascript
// Botones de tareas MITs (data-done-button)
;`<button
  class="mt-1 w-6 h-6 rounded border-2 border-xp-primary flex items-center justify-center"
  data-done-button=""
  aria-label="${I18n.t("accessibility.markTaskDone", { task: task.title })}"
>`
// Botones de hábitos (data-habit-done-button)
`<button
  class="w-8 h-8 rounded-full border-2 flex items-center justify-center"
  data-habit-done-button=""
  aria-label="${I18n.t("accessibility.markHabitDone", { habit: habit.name })}"
>`
```

**Agregar en `assets/locales/es.json` y `en.json`:**

```json
{
  "accessibility": {
    "markTaskDone": "Marcar tarea '{task}' como completada",
    "markHabitDone": "Marcar hábito '{habit}' como completado"
  }
}
```

---

#### Tarea A2.2: Corregir contraste de colores

**Prioridad:** CRÍTICA | **Impacto en score:** +6 a +8 puntos

##### 2.2.a Nombre de la app — `#0acc71` → color con 3:1 mínimo en blanco

El verde `#0acc71` sobre blanco da 2.12:1. Se necesita oscurecer para WCAG AA
(3:1 en texto grande/bold).

**Opción A:** Usar `#0a9e57` (ratio ~3.1:1 en blanco) — verde más oscuro
aceptable **Opción B:** Agregar `text-shadow` o borde para mejorar la percepción
sin cambiar el color de marca

**Cambio en `tailwind.config` (en `index.html`):**

```javascript
colors: {
  'xp-primary': '#0acc71',          // mantener para fondos/bordes
  'xp-primary-text': '#0a9e57',     // nuevo: para texto sobre fondo claro
}
```

Actualizar selector `main > div.md:hidden > h1 > span[data-i18n="app.name"]`
para usar `text-xp-primary-text`.

##### 2.2.b Tareas "0/4" — `#0099ff` → 3:1 mínimo

`#0099ff` sobre blanco da 2.99:1 — falla por muy poco. **Fix:** Cambiar a
`#007acc` (ratio ~4.0:1) o `#0077cc`.

```javascript
// tailwind.config
'xp-secondary': '#007acc',  // antes: #0099ff
```

##### 2.2.c Presupuesto "$890" — `#ffaa00` → 3:1 mínimo

`#ffaa00` sobre blanco da 1.9:1 — amarillo-naranja muy difícil en fondo blanco.
**Opciones:**

- Cambiar fondo de la tarjeta a `#fff9e6` (crema muy claro) y oscurecer texto
- Usar `#b57800` (ratio ~4.5:1 en blanco) — marrón dorado
- Cambiar esquema: texto oscuro con icono de color

```javascript
'xp-warning': '#b57800',  // antes: #ffaa00
```

> Nota: El amarillo-naranja en fondo blanco es intrínsecamente problemático para
> WCAG. Evaluar si `#b57800` encaja con la paleta visual o si se prefiere un
> cambio de esquema en la tarjeta.

##### 2.2.d Tags de tareas — `#0acc71` sobre `#c9f1df` (ratio 1.73:1)

Este es el peor caso: texto pequeño (12px) verde sobre fondo verde claro.
**Fix:** Cambiar el texto del tag a un color oscuro.

```html
<!-- ANTES -->
<span class="text-xs px-2 py-1 bg-xp-primary/20 text-xp-primary rounded">
  <!-- DESPUÉS -->
  <span class="text-xs px-2 py-1 bg-xp-primary/20 text-green-800 rounded"></span
></span>
```

`text-green-800` = `#166534` que sobre `#c9f1df` da ~5.5:1 — cumple WCAG AA para
texto pequeño.

---

### Fase 3 — Mejoras Secundarias

#### Tarea P3.1: Preload del LCP element

**Prioridad:** BAJA | **Impacto:** +1 a +2 puntos

El elemento LCP es el `<h2 class="text-3xl font-bold">` del screen home — es
texto, no imagen. El render delay (328ms) se debe a los scripts bloqueantes, no
a la carga del elemento en sí. Resuelto con P1.1 y P1.2.

#### Tarea P3.2: Reducir peso de Open Sans

**Prioridad:** BAJA | **Impacto:** reducción de ~40 kB en transferencia de
fuentes

Limitar los `wght` a solo los valores realmente usados:

```
# Antes: 300..800 (todos los pesos)
# Después: 400;600;700 (regular, semibold, bold)
family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400
```

#### Tarea P3.3: Configurar Service Worker para compresión y caché agresivo

**Prioridad:** MEDIA | **Impacto en PWA y performance en segunda visita**

Revisar `sw.js` para asegurar que los assets estáticos (CSS, JS) se cachean con
estrategia cache-first y que el HTML se sirve con network-first pero con
fallback offline.

---

## 5. Orden de Implementación Recomendado

```
Sprint 1 (mayor impacto, menor riesgo)
  ├── A2.1  aria-label en botones icon-only       [~30 min]
  ├── A2.2d Tags: cambiar text-xp-primary → text-green-800  [~10 min]
  ├── P1.3  Google Fonts no-bloqueante             [~20 min]
  └── P1.2  Diferir GTM al final del body          [~15 min]

Sprint 2 (impacto crítico, requiere prueba visual)
  ├── P1.1  Reemplazar Tailwind CDN → build CSS    [~60-90 min]
  ├── A2.2b Ajustar xp-secondary #0099ff → #007acc [~15 min]
  └── A2.2a Ajustar xp-primary-text para textos    [~20 min]

Sprint 3 (requiere decisión de diseño)
  ├── A2.2c xp-warning amarillo → evaluar paleta   [~30 min + revisión]
  └── P1.5  Lazy-render de screens en SPA          [~2-3 horas]

Sprint 4 (mejoras menores)
  ├── P3.2  Limitar pesos de Open Sans             [~10 min]
  └── P3.3  Revisar estrategia Service Worker      [~45 min]
```

---

## 6. Puntuaciones Esperadas Post-Implementación

| Categoría      | Actual | Post-Sprint1 | Post-Sprint2 | Objetivo final |
| -------------- | :----: | :----------: | :----------: | :------------: |
| Performance    |   69   |     ~75      |    ~88-92    |      90+       |
| Accessibility  |   76   |     ~90      |     ~95      |      95+       |
| Best Practices |  100   |     100      |     100      |      100       |
| SEO            |  100   |     100      |     100      |      100       |

> Estimaciones basadas en el peso de cada métrica en el score Lighthouse. Los
> valores reales pueden variar ±5 puntos dependiendo del entorno de auditoría.

---

## 7. Notas Técnicas

### Por qué el CDN de Tailwind destruye el Performance score

`cdn.tailwindcss.com` sirve el runtime completo de Tailwind v3 (PostCSS + JIT
compiler). Al cargarse, escanea el DOM, genera los estilos dinámicamente y los
inyecta. Este proceso:

1. Es un script enorme (407.3 kB)
2. Bloquea el render hasta que termina (render-blocking)
3. Ejecuta 170 ms de JavaScript en el hilo principal en máquina de desarrollo —
   en mobile throttleado, puede ser 500-1000 ms

Un CSS de producción generado por `tailwindcss` CLI con PurgeCSS incluido para
este proyecto debería ser < 25 kB gzip, eliminando virtualmente todo este
impacto.

### Por qué el score de Best Practices cambió de 77 a 100

Es probable que la puntuación anterior de 77 fuera en una versión del código con
recursos deprecados o errores en consola. La auditoría actual no encuentra
errores en consola, APIs deprecadas ni problemas de cookies de terceros. Los
ítems informativos (CSP, HSTS, COOP) son `informative` y no afectan el score
numérico.

### Herramientas para validar mejoras

```bash
# Auditoría local con throttling correcto (emula Moto G4 + Fast 3G)
npx lighthouse http://127.0.0.1:5500/ --preset=perf --emulated-form-factor=mobile --output=html

# Verificar contraste de colores
# https://webaim.org/resources/contrastchecker/

# Verificar tamaño del CSS generado
npx tailwindcss -i assets/css/styles.css -o /dev/null --minify --content "index.html,assets/js/app.js" 2>&1
```

---

_Documento generado el 15 de abril de 2026 a partir de auditoría Lighthouse
13.0.3 + Chrome DevTools Performance Trace sobre http://127.0.0.1:5500/_
