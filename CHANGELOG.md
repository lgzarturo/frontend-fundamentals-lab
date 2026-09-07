# CHANGELOG

## Historial de cambios

### v1.0.0

- Merge pull request #31 from lgzarturo/module-13-modules-refactor
- docs: documentar el proceso de desarrollo
- fix(ui): mejorar modales de notas, prioridad de tareas y compartir
- Merge pull request #30 from lgzarturo/module-13-modules-refactor
- fix: documentar el diseño de la app
- feat(analytics,seo): mejorar analiticas, rachas, sonido y compartir
- feat(tasks,notes): mejorar vista de notas, fechas y filtro de tareas
- feat(notes,tasks): mejorar vista de notas y componente de etiquetas
- fix: corregir escapado de fragmentos anidados y eventos de modal
- feat(core): completar cutover a arquitectura modular ES6
- docs(backlog): agregar ítem y plan OpenSpec para dashboard de telemetría
- docs(backlog): agregar backlog y planes para la migración de módulos
- feat: extraer servicio i18n y bootstrap principal de la app
- feat: agregar undo, drag and drop y confeti a la arquitectura modular
- refactor: centralizar modal y corregir claves i18n en módulos
- Merge pull request #25 from lgzarturo/module-13-modules-refactor
- refactor: implementar migración de datos y validación en presupuestos
- chore: add coverage/ to .gitignore and remove from tracking
- chore: actualizar a v0.0.16 y optimizar infraestructura
- Merge pull request #23 from lgzarturo/module-13-modules-refactor
- fix: corregir la version
- chore: agregar Makefile y comandos de automatización de versión
- chore: implementar sincronización de versión y plan de hábitos
- docs(plans): actualizar auditoría de rendimiento Lighthouse
- Merge pull request #20 from lgzarturo/module-13-modules-refactor

### v0.0.17

- refactor: implementar migración de datos y validación en presupuestos
- chore: add coverage/ to .gitignore and remove from tracking
- chore: actualizar a v0.0.16 y optimizar infraestructura
- fix: corregir la version

### v0.0.16

- chore: agregar Makefile y comandos de automatización de versión
- chore: implementar sincronización de versión y plan de hábitos
- docs(plans): actualizar auditoría de rendimiento Lighthouse

### v0.0.15

- fix: cambiar estrategia de cache en service worker para archivos JSON de
  locale a network-first, resolviendo problema de cambio de idioma en mobile
  donde se mostraban etiquetas en vez de traducciones
- feat: agregar método invalidateLocaleCache para invalidar cache de locale antes
  de cargar nuevas traducciones
- refactor: mejorar manejo de cache en PWA para archivos de idioma

### v0.0.14

- feat: implementar soporte completo de idiomas y configuración de agentes
  (.agents, CLAUDE.md)
- feat: agregar plantillas dinámicas para presupuestos y visualización de racha
  de hábitos
- feat: soporte para traducciones de placeholders, aria-labels y mensajes
  dinámicos
- feat: implementar selección de idioma y formateo automático de fechas según el
  locale
- feat: funcionalidad de arrastre y soltar (Drag & Drop) para la organización de
  tareas
- feat: herramientas de exportación e importación de datos en formato JSON
- feat: refactorizar lógica principal en la clase DOSApp con cálculo de totales
- feat: mejorar la arquitectura del proyecto mediante la reorganización de
  carpetas
- feat: soporte para cambio de tema (claro/oscuro) y gestión de caché de PWA
- docs: documentación detallada sobre i18n y el sistema de plantillas

### v0.0.13

- feat: actualización de versión y ajustes menores en index.html

### v0.0.12

- feat: agregar soporte para múltiples idiomas (i18n)
- feat: mejorar la gestión de tareas

### v0.0.11

- feat: actualizar llamadas a funciones para usar el objeto app
- refactor: mover funcionalidad de tareas para usar métodos de la aplicación
- feat: agregar funcionalidad para crear y gestionar notas en la aplicación

### v0.0.10

- feat: agregar sección de mejoras por implementar en la documentación
- docs: mejorar la documentación usando JSDoc
- feat: agregar documentación del código para mejorar la lectura
- feat: agregar modal para añadir transacciones y funcionalidad para guardar
  transacciones en el presupuesto
- feat: agregar funcionalidad de gestión de presupuestos, incluyendo creación,
  visualización y eliminación de elementos de presupuesto
- feat: agregar almacenamiento de budget en localStorage
- feat: agregar definición de tipos para presupuesto y transacciones en app.js

### v0.0.9

- feat: actualizar la versión del caché de PWA

### v0.0.8

- feat: agregar funcionalidad de PWA y eventos GA4
- feat: actualizar la gestión de hábitos para usar el espacio de nombres 'app'
  en lugar de 'store'
- feat: agregar nuevos hábitos
- feat: agregar funcionalidad para la pantalla de hábitos
- docs: agregar sección de características de Productivity XP al README
- feat: agregar guía de estudio fullstack JavaScript/TypeScript al repositorio

### v0.0.7

- feat: avances con la UI, funcionalidad de modal y toast

### v0.0.6

- feat: lanzar confeti cada 10 visitas en el contador
- feat: mejorar la animación de confeti y actualizar el contador de visitas
- feat: mejorar la animación de confeti
- feat: agregar contador de visitas y animación de confeti
- feat: agregar contador de visitas [skip ci]
- feat: actualizar el changelog con los cambios de la versión 0.0.5

### v0.0.5

- refactor: reorganizar la gestión del almacenamiento local y simplificar la
  inicialización de la aplicación
- refactor: inicializar datos en localStorage
- feat: agregar estado inicial de la aplicación y datos de ejemplo para tareas
- chore: agregar comentarios TODO para continuar
- feat: mostrar un mensaje de alerta
- docs: cambios aplicados en commits
- feat: documentando las mejores prácticas de StandardJS y ECMAScript moderno

### v0.0.4

- docs: se actualiza la documentación
- feat: agregar lógica para mostrar tareas prioritarias en la pantalla de inicio
- feat: agregar lógica para cargar las tareas en la pantalla de inicio
- feat: implementar navegación entre pantallas
- feat: eliminar sección de héroe del documento HTML
- feat: eliminar el pie de página del documento HTML
- feat: optimizar la carga inicial y el rendimiento aplicando mejoras de
  Lighthouse
- feat: mejorar la gestión del modo oscuro y eliminar la preferencia de tema del
  almacenamiento local
- feat: actualizar color primario para tener más contraste
- feat: optimizar imágenes para lighthouse
- feat: agregar nuevas imágenes y optimizar el rendimiento con ajustes en el
  HTML

### v0.0.3

- fix: enlace a la documentación sobre TailwindCSS [skip ci]
- doc: utilizando TailwindCSS con CDN [skip ci]
- feat: agregar esquinas redondeadas a botones y enlaces para mejorar la
  estética
- feat: mejorar la sección de héroe y el pie de página en index.html
- feat: agregar estilos CSS y configuración de TailwindCSS en archivos separados
- feat: actualizar contenido principal y mejorar la presentación de imágenes en
  index.html
- feat: agregar navegación móvil y barra lateral para mejorar la experiencia del
  usuario
- fix: eliminar estilos de enlace innecesarios y mejorar el footer en index.html
- feat: agregar nuevos colores personalizados y mejorar la estructura del
  contenido principal en index.html
- feat: agregar configuración de TailwindCSS y mejorar fuentes en el documento
  HTML
- feat: agregar soporte para TailwindCSS en el proyecto

### v0.0.2

- fix: eliminar línea en la introducción del README
- fix: actualizar enlaces de la aplicación [skip ci]
- docs: bitácora de instalación y evaluación de GTM
- fix: actualizar enlaces de la aplicación a la nueva URL del gestor de tareas
- feat: agregar configuración de GTM y seguimiento de clics
- fix: corregir rutas de iconos en el archivo site.webmanifest
- feat: agregar soporte para la versión en inglés y mejorar metadatos SEO
- fix: actualizar versión de Tailwind CSS a v3 en la documentación
- docs: se agregan las etiquetas productivas
- feat: agregar estructura HTML y metadatos SEO
- docs: agregar tabla de contenidos y roadmap de aprendizaje al README.md
- docs: actualizar README.md con detalles del proyecto y objetivos de
  aprendizaje

### v0.0.1

- Initial commit
