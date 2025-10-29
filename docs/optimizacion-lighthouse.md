# Optimizando con Lighthouse

Justo ahora después de implementar un poco de CSS, agregar TailwindCSS y un script básico de JavaScript, es un buen momento para evaluar el performance del sitio usando Lighthouse.

Justo ahora, el puntaje de performance es el siguiente:

- Desktop: 99/100
- Mobile: 88/100

## Análisis de resultados

### Desktop

**Métricas clave:**

- First Contentful Paint: 0.8 s
- Largest Contentful Paint: 0.8 s
- Total Blocking Time: 0 ms
- Cumulative Layout Shift: 0
- Speed Index: 0.8 s

1. Render blocking requests Est savings of 40 ms: Requests are blocking the page's initial render, which may delay LCP. Deferring or inlining can move these network requests out of the critical path.FCP, LCP
2. Network dependency tree: Avoid chaining critical requests by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load. LCP
3. Improve image delivery Est savings of 23 KiB: Reducing the download time of images can improve the perceived load time of the page and LCP. Learn more about optimizing image size: FCP, LCP
4. Reduce unused JavaScript Est savings of 140 KiB: Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. FCP, LCP
5. Background and foreground colors do not have a sufficient contrast ratio: Low-contrast text is difficult or impossible for many users to read. Learn how to provide sufficient color contrast.

### Mobile

**Métricas clave:**

- First Contentful Paint: 3.1 s
- Largest Contentful Paint: 3.1 s
- Total Blocking Time: 90 ms
- Cumulative Layout Shift: 0.01
- Speed Index: 3.1 s

1. Render blocking requests Est savings of 390 ms: Requests are blocking the page's initial render, which may delay LCP. Deferring or inlining can move these network requests out of the critical path. FCP, LCP
2. Network dependency tree: Avoid chaining critical requests by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load. LCP
3. Improve image delivery Est savings of 28 KiB: Reducing the download time of images can improve the perceived load time of the page and LCP. Learn more about optimizing image size. FCP, LCP.
4. Reduce unused JavaScript Est savings of 145 KiB: Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. FCP, LCP.
5. Background and foreground colors do not have a sufficient contrast ratio: Low-contrast text is difficult or impossible for many users to read. Learn how to provide sufficient color contrast.
6. Issues were logged in the Issues panel in Chrome Devtools: Issues logged to the Issues panel in Chrome Devtools indicate unresolved problems. They can come from network request failures, insufficient security controls, and other browser concerns. Open up the Issues panel in Chrome DevTools for more details on each issue.

## Próximos pasos

- Optimizar la carga de imágenes para mejorar LCP.
- Revisar y reducir el JavaScript no utilizado.
- Minimizar las solicitudes que bloquean el renderizado.
- Asegurar un buen contraste de colores para mejorar la accesibilidad.
- Monitorear el performance a medida que se agregan más funcionalidades y estilos al proyecto.
- Considerar el uso de técnicas como lazy-loading para imágenes y recursos no críticos.
- Evaluar el impacto de futuras integraciones (como Google Tag Manager) en el performance y buscar formas de mitigarlo.

---

## Bitácora de optimización Lighthouse

### 1. Problemas detectados por Lighthouse

- **Render-blocking resources:** El CSS y JS de terceros (Google Fonts, Tailwind CDN, GTM) pueden bloquear el render. Se recomienda usar preload, async/defer y font-display: swap.
- **Fuentes sin font-display: swap:** Se añadió el parámetro en todos los links de Google Fonts para evitar bloqueos de render.
- **Imágenes sin width/height y sin formatos modernos:** La imagen LCP ahora tiene width/height definidos y srcset con AVIF/WebP. Se recomienda lazy-load en imágenes no LCP.
- **Tap targets:** Se revisaron los botones y enlaces para asegurar que tengan min-height/min-width de 44px.
- **Recursos de terceros:** Se minimizó el uso de scripts y fuentes externas, y se priorizó la carga de recursos críticos con preconnect/preload.
- **Accesibilidad:** Se mejoró el contraste, se revisaron los atributos alt en imágenes y se añadieron roles en navegación y botones.

### 2. Cambios aplicados

- Google Fonts: Se agregó `font-display=swap` en todos los links.
- Imagen LCP: Se añadió AVIF/WebP en srcset, width/height y preload.
- Imágenes secundarias: Se recomienda usar `loading="lazy"` y definir width/height.
- Botones y enlaces: Se reforzó el tamaño mínimo de tap target y se añadieron focus ring y roles.
- Recursos críticos: Se usó preconnect/preload en fuentes y la imagen principal.
- Accesibilidad: Se revisaron atributos alt, roles y contraste en los componentes principales.

### 3. Justificación

Cada cambio está fundamentado en las recomendaciones de Lighthouse y las mejores prácticas de performance y accesibilidad. El objetivo es maximizar el puntaje y la experiencia de usuario en desktop y móvil, dejando una base sólida para futuras optimizaciones.

---

## Optimización inicial para mobile

Vamos a empezar optimizando para mobile, ya que es la plataforma más restrictiva y donde el performance suele ser más crítico.

1. Se añadió `font-display=swap` en Google Fonts para evitar bloqueos de render.
2. La imagen LCP ahora soporta AVIF y WebP en el `srcset`, tiene width/height definidos para evitar CLS y se pre-carga con preload.
3. El botón principal tiene tap target mínimo, accesibilidad mejorada (role, focus ring) y estilos responsivos.

---

## Optimización Lighthouse Desktop

- **Imágenes LCP:**
  - Se agregó `srcset` y `sizes` en la imagen principal para formatos modernos (AVIF/WebP) y responsive.
  - Se definieron atributos `width` y `height` para evitar layout shift.
  - Se documentó el uso de `fetchpriority` y su compatibilidad limitada (solo Chrome y Safari iOS >= 17.2).
  - Se eliminó el preload con `imagesrcset`/`imagesizes` por compatibilidad limitada, usando solo preload básico.

- **Fuentes:**
  - Se mantiene `font-display: swap` en Google Fonts para mejorar el FCP.
  - Se usa `preconnect` y `dns-prefetch` para optimizar la carga de fuentes.

- **Tap targets:**
  - Confirmado en CSS: todos los botones, enlaces, inputs y selects tienen mínimo 44x44px.

- **Meta tags y canonical:**
  - Ya implementados correctamente.

- **Accesibilidad:**
  - Se revisaron y documentaron roles y atributos ARIA en botones y enlaces.
  - Se mejoró el contraste en modo claro/oscuro.
  - Se agregó `alt` descriptivo en la imagen principal.

- **Compatibilidad:**
  - Se agregaron comentarios en el HTML explicando los atributos no soportados por Firefox, Opera y Safari iOS < 17.2.

---

## Notas de compatibilidad

- Los atributos `fetchpriority`, `imagesrcset` y `imagesizes` solo funcionan en navegadores modernos (Chrome, Safari iOS >= 17.2). Se documenta el fallback y se mantiene la funcionalidad principal para todos los usuarios.
- Se recomienda monitorear la adopción de estas características y ajustar la estrategia de optimización conforme evoluciona el soporte en navegadores.
- Se prioriza la experiencia del usuario y la accesibilidad sobre el uso de características avanzadas no soportadas universalmente.
