# DESIGN.md

## Propósito del Documento

Este documento describe el concepto de diseño, la implementación UX/UI actual y
los lineamientos para evolucionar Frontend Fundamentals Lab como una aplicación
web mobile-first y PWA.

La aplicación actual funciona como una SPA de productividad personal construida
con HTML, Tailwind CSS vía CDN y JavaScript puro. Su objetivo principal es
aprender fundamentos frontend mediante una app funcional: navegación entre
pantallas, persistencia local, i18n, temas, CRUD de datos, feedback visual y
soporte offline.

## Concepto de Producto

La experiencia está diseñada como una caja de herramientas personal para
organizar tareas, presupuestos, notas y hábitos desde el navegador. El concepto
visual actual se apoya en una estética "XP" inspirada en videojuegos: colores
vivos, barras de progreso, rachas, recompensas visuales y microinteracciones.

El producto está en transición conceptual hacia un Daily Operating System
personal: una app más enfocada en observabilidad diaria, estabilidad de rutina y
registro rápido. Mientras esa transición termina, el diseño debe conservar lo
que ya funciona:

- Entrada rápida desde móvil.
- Información clave visible en el dashboard.
- Acciones de baja fricción.
- Persistencia local sin requerir cuenta.
- Experiencia instalable y usable sin conexión.
- Feedback inmediato después de cada acción.

## Principios de Diseño

### 1. Mobile First

La aplicación debe diseñarse primero para pantallas pequeñas. La versión móvil
no es una versión reducida de desktop; es la experiencia base.

Criterios actuales:

- Navegación principal fija en la parte inferior en móvil.
- Top bar móvil sticky con acceso rápido a configuración.
- Contenido en una columna por defecto.
- Grids que escalan progresivamente a `md` y `lg`.
- Padding base compacto (`p-4`) y mayor respiración en desktop (`md:p-6`).
- Tap targets mínimos de 44x44px para botones, enlaces, inputs y selects.
- Modales con ancho completo disponible y altura máxima de `90vh`.

Lineamiento:

- Toda nueva pantalla debe funcionar correctamente desde 360px de ancho.
- Las acciones principales deben alcanzarse con el pulgar.
- No depender de hover para completar flujos críticos.
- Evitar tablas rígidas; preferir cards, listas y resúmenes apilables.
- Mantener filtros y botones en layouts que puedan envolver o desplazarse sin
  romper el contenido.

### 2. Offline First

La app está pensada para seguir siendo útil sin conexión. Los datos del usuario
se guardan en `localStorage` y el service worker cachea recursos esenciales.

Implementación actual:

- `sw.js` registra un cache `pwa-cache-v3`.
- Se cachean HTML, CSS, JavaScript y archivos de idioma.
- HTML, scripts, estilos y locales usan estrategia network-first con fallback a
  cache.
- Assets estables usan estrategia cache-first.
- La activación limpia caches antiguos y reclama clientes con `clients.claim()`.

Lineamiento:

- Las funciones core no deben depender de APIs remotas para operar.
- Cualquier integración futura con backend debe degradar correctamente a modo
  offline.
- Los estados de error de red deben ser claros y recuperables.
- Exportación/importación JSON debe seguir existiendo como respaldo manual.

### 3. Feedback Inmediato

Cada acción importante debe comunicar resultado sin bloquear al usuario.

Implementación actual:

- Toasts para confirmaciones y errores.
- Toast con deshacer para acciones reversibles.
- Transiciones suaves en cambios de pantalla.
- Confeti y recompensas XP para acciones completadas.
- Estados activos en navegación.
- Barras de progreso para presupuesto y avance.

Lineamiento:

- Toda acción destructiva debe pedir confirmación o permitir deshacer.
- Los mensajes deben ser breves y accionables.
- El feedback visual debe reforzar el estado real del sistema, no decorar sin
  propósito.
- Las microanimaciones deben durar poco y no bloquear la interacción.

### 4. Claridad Sobre Densidad

La aplicación muestra datos operativos personales. La UI debe priorizar lectura
rápida, jerarquía clara y acciones evidentes.

Lineamiento:

- El dashboard debe resumir lo más importante del día.
- Cada módulo debe tener una acción primaria evidente.
- Los estados vacíos deben indicar el siguiente paso.
- Los textos largos deben ir en notas o detalles, no en tarjetas de resumen.
- Los formularios deben agrupar campos relacionados y evitar capturar datos que
  no se usan.

## Arquitectura UX Actual

### Navegación

La navegación cambia según breakpoint:

- Móvil: navegación inferior fija con accesos a Home, Budget, Tasks, Notes y
  Habits.
- Desktop: sidebar fijo a la izquierda con las mismas secciones y acceso a
  Settings.
- Main content: usa `md:ml-64` para liberar espacio al sidebar en desktop y
  `pb-20` para no quedar oculto detrás de la navegación inferior móvil.

La navegación se controla con `app.navigateTo(screen)`, que:

- Actualiza `currentScreen`.
- Persiste la pantalla actual en `localStorage`.
- Oculta todas las pantallas con `.screen`.
- Activa la pantalla seleccionada con `.screen.active`.
- Actualiza estilos visuales del botón activo.

### Pantallas

#### Home

Funciona como dashboard operativo. Resume:

- Racha máxima de hábitos.
- Tareas del día completadas.
- Presupuesto restante.
- Total de notas.
- MITs del día.
- Hábitos de hoy.
- Actividad reciente.

Objetivo UX: dar contexto rápido y permitir decidir la siguiente acción sin
entrar a cada módulo.

#### Budgets

Permite gestionar presupuestos, items y transacciones. Usa:

- Cards de resumen.
- Totales destacados.
- Barras de progreso.
- Colores semánticos para restante, gastado y alerta.
- Modal para crear presupuesto y registrar transacciones.

Objetivo UX: mostrar salud financiera de forma rápida y visual.

#### Tasks

Permite crear, editar, filtrar y completar tareas. Usa:

- Filtros por todas, hoy, alta prioridad y completadas.
- Indicadores visuales de prioridad.
- Subtareas.
- Etiquetas.
- Fechas límite.
- Acciones de editar/eliminar.

Objetivo UX: reducir fricción para capturar tareas y enfocar el trabajo diario.

#### Notes

Permite crear notas con markdown, búsqueda y etiquetas. Usa:

- Grid responsive de notas.
- Buscador full-width.
- Modal de edición.
- Vista previa markdown.
- Tipografía monoespaciada para edición.

Objetivo UX: capturar conocimiento rápido sin salir de la app.

#### Habits

Permite crear hábitos desde plantillas o personalizados, completar registros y
ver progreso. Usa:

- Resumen de racha actual.
- Tasa de cumplimiento.
- Vista semanal de 7 días.
- Feedback XP al completar hábitos.

Objetivo UX: registrar avances diarios con un toque y visualizar consistencia.

#### Settings

Centraliza preferencias y gestión de datos:

- Tema claro/oscuro.
- Selector de idioma.
- Exportar datos.
- Importar datos.
- Restaurar datos demo.
- Borrar datos.

Objetivo UX: concentrar configuración y operaciones sensibles fuera del flujo
diario.

## Sistema Visual

### Paleta

La paleta personalizada se define en `assets/js/tailwindcss.js`:

- `xp.primary`: verde principal para éxito, énfasis y acciones primarias.
- `xp.secondary`: azul para información y acciones secundarias.
- `xp.danger`: rojo/rosa para errores, peligro y acciones destructivas.
- `xp.warning`: amarillo/naranja para advertencias.
- `xp.dark`, `xp.darker`, `xp.card`: base oscura y superficies.

Uso esperado:

- Verde: acción primaria, completado, progreso positivo.
- Azul: información, navegación secundaria, elementos neutros relevantes.
- Rojo: errores, eliminación, sobregasto, prioridad alta.
- Amarillo: advertencias, límites cercanos, atención.
- Superficies oscuras: fondo base, cards y modales en dark mode.

### Tipografía

La app usa:

- `Open Sans` como fuente principal para lectura.
- `Nova Square` para encabezados y marca visual XP.
- Fallbacks del sistema para rendimiento y compatibilidad.

Lineamiento:

- Mantener headings claros y breves.
- Usar peso fuerte solo para jerarquía real.
- Evitar bloques extensos dentro de cards compactas.

### Componentes UI

Patrones actuales:

- Cards con fondo blanco/dark card, borde de 2px y radio amplio.
- Botones primarios verdes con texto oscuro.
- Botones secundarios con fondos translúcidos.
- Inputs con borde visible y focus en color primario.
- Modales centrados con backdrop oscuro.
- Toasts flotantes.
- Chips para etiquetas.
- Barras de progreso con color semántico.
- Esquinas tipo pixel en navegación desktop.

Lineamiento:

- Reutilizar estos patrones antes de introducir nuevos estilos.
- Mantener consistencia entre modo claro y oscuro.
- Todo input debe tener label o `aria-label` claro.
- Todo botón iconográfico debe conservar texto visible o etiqueta accesible.

## Microinteracciones

Las microinteracciones actuales cumplen tres funciones: confirmar, orientar y
dar sensación de progreso.

Implementación actual:

- `.screen.active` usa `fadeIn` con desplazamiento vertical sutil.
- Botones y tarjetas usan `transition-colors`, `transition-all` o
  `transition-transform`.
- Check de hábitos usa `hover:scale-110`.
- Toasts desaparecen con transición de opacidad.
- Confeti usa canvas y `requestAnimationFrame` al completar eventos destacados.
- Recompensas `+XP` refuerzan acciones completadas.

Lineamiento:

- Duración recomendada: 150ms a 300ms para interacciones frecuentes.
- Animaciones celebratorias deben reservarse para logros relevantes.
- El movimiento no debe desplazar contenido de forma inesperada.
- Debe respetarse la accesibilidad: si se agrega soporte a
  `prefers-reduced-motion`, las animaciones deben reducirse o desactivarse.

## PWA Mobile First

La aplicación ya incorpora bases de PWA:

- Manifest en `assets/images/favicon/site.webmanifest`.
- `display: standalone` para abrir como app instalada.
- Iconos de 192x192 y 512x512.
- `theme-color` en HTML.
- Service worker registrado desde `assets/js/app.js`.
- Cache de recursos principales en `sw.js`.
- Persistencia local para uso sin conexión.

Para considerarla una PWA mobile-first madura, debe cumplir estos criterios:

- Instalación clara desde navegador compatible.
- Carga inicial rápida en red móvil.
- Funcionalidad core disponible offline.
- UI usable en una mano.
- Estados de carga, error y vacío bien definidos.
- Datos protegidos contra pérdida accidental mediante exportación.
- Actualizaciones del service worker controladas para evitar versiones
  inconsistentes en cache.

## Accesibilidad

Buenas prácticas ya presentes:

- Viewport responsive.
- Tap targets mínimos de 44x44px.
- Contraste fuerte en modo oscuro.
- Labels en formularios.
- `aria-label` en selector de idioma.
- Metadatos SEO y lenguaje del documento.
- Textos traducibles con `data-i18n`.

Lineamiento:

- Validar contraste en ambos temas antes de cerrar cambios visuales.
- Mantener navegación completa por teclado.
- Agregar estados `focus-visible` consistentes.
- No comunicar estado solo con color; combinar texto, icono o etiqueta.
- Los modales deben mejorar su accesibilidad con foco inicial, cierre con Escape
  y retorno de foco al disparador.

## Internacionalización

La app soporta español e inglés mediante archivos JSON en `assets/locales`.

Implementación actual:

- `I18n.init()` detecta idioma guardado o navegador.
- `I18n.loadMessages(lang)` carga mensajes.
- `I18n.setLanguage(lang)` actualiza idioma y persiste preferencia.
- `data-i18n`, `data-i18n-placeholder` y `data-i18n-aria-label` aplican textos.

Lineamiento:

- Todo texto visible nuevo debe agregarse a `es.json` y `en.json`.
- Evitar hardcodear textos en templates dinámicos.
- Mantener placeholders, labels y mensajes de error traducibles.

## Persistencia y Privacidad

La aplicación es local-first:

- No requiere cuenta.
- Guarda datos en `localStorage`.
- Permite exportar/importar JSON.
- Permite restaurar datos demo.
- Permite limpiar datos.

Lineamiento:

- No introducir telemetría de datos personales sin documentarlo.
- Validar importaciones antes de sobrescribir datos existentes.
- Mantener compatibilidad con migraciones de almacenamiento.
- Las acciones destructivas deben estar confirmadas y documentadas.

## Performance

Decisiones actuales:

- Sin framework frontend.
- Tailwind vía CDN para simplicidad del laboratorio.
- Scripts con `defer`.
- Preconnect y preload para Google Fonts.
- Imágenes en AVIF/WebP.
- Service worker para cache.

Riesgos actuales:

- Tailwind CDN y Google Fonts agregan dependencias externas.
- `assets/js/app.js` sigue siendo grande y mezcla responsabilidades.
- GTM puede impactar carga en red móvil.
- Algunas mejoras modulares ya existen, pero la app principal todavía carga el
  archivo monolítico.

Lineamiento:

- Priorizar el rendimiento móvil sobre el desktop.
- Reducir JavaScript no utilizado por pantalla.
- Continuar migración gradual a módulos ES6.
- Medir Lighthouse después de cambios grandes de UI.
- Mantener CLS bajo definiendo dimensiones estables para imágenes y
  contenedores.

## Arquitectura de Implementación

La implementación actual convive en dos etapas:

- `assets/js/app.js`: app monolítica funcional con la mayoría de pantallas y
  flujos.
- `assets/js/core`, `modules`, `services`, `utils`, `data`: base modular ES6 en
  progreso, con presupuestos, almacenamiento, event bus y utilidades.

Lineamiento:

- Nuevas funcionalidades deben preferir módulos separados.
- La lógica de dominio no debe quedar acoplada al DOM si puede probarse de forma
  aislada.
- Los templates deben escapar contenido de usuario.
- La persistencia debe pasar por servicios centralizados.
- Los módulos deben comunicarse mediante eventos cuando aplique.

## Lineamientos para Nuevas Pantallas

Toda nueva pantalla debe cumplir:

- Diseño móvil primero.
- Una acción primaria clara.
- Estado vacío.
- Estado de error si carga datos o importa archivos.
- Feedback con toast o mensaje inline.
- Soporte para dark mode.
- Textos en i18n.
- Persistencia local si modifica datos.
- Tap targets mínimos.
- Pruebas unitarias para lógica y helpers.

Checklist UX/UI:

- Se ve bien a 360px, 768px y desktop.
- No hay contenido oculto detrás de la navegación inferior.
- Los botones no se enciman ni cortan texto.
- El modal no excede la altura visible.
- Los estados activos son claros.
- La acción destructiva tiene confirmación o deshacer.

## Deuda de Diseño Identificada

- Unificar nombre de producto: actualmente conviven Frontend Fundamentals Lab,
  Productivity XP y Daily Operating System.
- Completar transición de app gamificada a herramienta de observabilidad diaria
  si ese sigue siendo el objetivo del producto.
- Mejorar accesibilidad de modales con foco controlado y Escape.
- Agregar soporte a `prefers-reduced-motion`.
- Homologar textos hardcodeados restantes con i18n.
- Continuar migración del archivo monolítico a módulos testeables.
- Revisar contraste de combinaciones secundarias en modo claro.
- Documentar estrategia de actualización del service worker.

## Definición de Calidad

Un cambio de diseño se considera listo cuando:

- Funciona primero en móvil.
- No rompe navegación ni persistencia.
- Mantiene soporte offline en flujos core.
- Respeta tema claro/oscuro.
- Tiene feedback visible para acciones importantes.
- No introduce regresiones de accesibilidad evidentes.
- Mantiene o mejora performance móvil.
- Está documentado si altera navegación, PWA, persistencia o patrones UI.
