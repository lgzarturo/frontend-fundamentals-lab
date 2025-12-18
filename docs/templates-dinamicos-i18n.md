# Sistema de Plantillas Dinámicas e Internacionalización (i18n)

Durante el desarrollo, se implementó un sistema robusto para soportar múltiples idiomas y plantillas dinámicas en la interfaz:

1. Estructura de Mensajes y Carga de Idiomas
   - Se crearon archivos de mensajes por idioma (`es.json`, `en.json`), organizados por claves jerárquicas.
   - El módulo `I18n` gestiona la carga dinámica de estos archivos según el idioma seleccionado por el usuario o detectado automáticamente.
   - Se da prioridad al idioma guardado por el usuario (`localStorage`), luego al idioma del navegador, y finalmente a un idioma por defecto (`es`).
2. Aplicación de Traducciones en el DOM
   - Se utiliza el atributo `data-i18n` en los elementos HTML para marcar los textos traducibles.
   - El método `I18n.applyTranslations()` recorre el DOM y reemplaza el contenido de los elementos con la traducción correspondiente.
   - Se añadió soporte para traducir atributos como placeholder y aria-label mediante `data-i18n-placeholder` y `data-i18n-aria-label`.
3. Sistema de Plantillas Dinámicas

   - Se implementó el método `I18n.cloneTemplateWithI18n(templateId)`, que permite clonar un `<template>` y aplicar automáticamente las traducciones a los elementos internos con `data-i18n`.
   - Esto permite reutilizar plantillas HTML en diferentes partes de la aplicación, asegurando que siempre se muestren en el idioma correcto.
   - Ejemplo de uso:

   ```javascript
   const node = I18n.cloneTemplateWithI18n("home-no-content-template")
   container.appendChild(node)
   ```

4. Uso de Plantillas en la Interfaz
   - Se migraron secciones de la interfaz (como mensajes de “sin contenido”, hábitos y actividad reciente) a plantillas `<template>` en el HTML.
   - Al renderizar, se clonan estas plantillas y se insertan en el DOM, aplicando las traducciones dinámicamente.
5. Decisiones de Diseño
   - Se optó por separar la lógica de traducción del renderizado de datos, facilitando el mantenimiento y la escalabilidad.
   - El sistema permite agregar nuevos idiomas fácilmente, solo añadiendo un archivo de mensajes.
   - Se documentaron los métodos principales del módulo `I18n` para facilitar su uso y extensión.

## Forma Eficiente de Aplicar Cambios en el DOM

- Usar plantillas `<template>` para los bloques de UI repetibles o condicionales.
- Clonar la plantilla con `I18n.cloneTemplateWithI18n` para asegurar que los textos se traduzcan automáticamente.
- Evitar manipular el texto manualmente después de clonar; dejar que el sistema de i18n lo gestione.
- Para listas o elementos dinámicos, combinar la clonación de plantillas con la inserción de datos (por ejemplo, usando atributos `data-*` para rellenar valores específicos).

## Carga de Mensajes de Idiomas

- Los mensajes se cargan de forma asíncrona al iniciar la app o al cambiar el idioma.
- Si falla la carga de un idioma, se recurre al idioma por defecto.
- El método `I18n.t(key, params)` permite obtener mensajes traducidos y soporta placeholders.

## Ideas de Mejora por implementar

- Soporte para más atributos traducibles: Extender el sistema para traducir otros atributos como `title`, `alt`, etc.
- Actualización reactiva: Integrar un sistema reactivo para que los cambios de idioma actualicen automáticamente todo el DOM sin recargar la pantalla.
- Soportar interpolación avanzada: Permitir pasar objetos o arrays para generar listas o estructuras complejas en las traducciones.
- Soportar `data-i18n-placeholder` y `data-i18n-aria-label`, para traducir atributos específicos usando plantillas.
- Soporte para pluralización y formatos avanzados: Mejorar el método `I18n.t` para manejar pluralización y formatos de fecha/número según el idioma.
- Caché de mensajes: Implementar caché en memoria para evitar recargas innecesarias de archivos de idioma.
- Este sistema permite una gestión eficiente y escalable de la internacionalización y las plantillas en la aplicación, facilitando la experiencia multilingüe y la reutilización de componentes UI.
