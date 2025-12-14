# Implementación de Soporte i18n y Cambio de Tema

## 1. Soporte de Internacionalización (i18n)

**¿Cómo se implementó?**

La internacionalización (i18n) permite que la aplicación soporte múltiples idiomas, facilitando su uso por una audiencia global. En Productividad XP, se implementó de la siguiente manera:

**Archivos de traducción JSON**

Se crearon archivos como es.json y en.json en locales, donde cada uno contiene las cadenas de texto traducidas para la interfaz.

**Objeto I18n**

En app.js, se define el objeto I18n que gestiona el idioma actual, carga los mensajes y aplica las traducciones.

- `I18n.init()` carga el idioma por defecto y escucha cambios en el selector de idioma.
- `I18n.loadMessages(lang)` obtiene el archivo de idioma correspondiente.
- `I18n.setLanguage(lang)` cambia el idioma y actualiza la interfaz.
- `I18n.t(key, params)` permite interpolar variables en las cadenas traducidas.
- `I18n.applyTranslations()` recorre los elementos con el atributo data-i18n y actualiza su contenido.

**Selector de idioma**

En la pantalla de configuración (index.html), se incluye un `<select id="language-selector">` para cambiar el idioma. Al cambiar, se llama a I18n.setLanguage().

**Marcado HTML**

Los textos traducibles usan el atributo `data-i18n="clave.del.texto"`, lo que permite que el sistema los detecte y reemplace automáticamente.

**¿Por qué es una buena práctica?**

- Permite escalar la aplicación a nuevos mercados sin modificar el código fuente.
- Facilita la colaboración con traductores y la gestión de múltiples idiomas.
- Mejora la accesibilidad y experiencia de usuario.

**¿Cómo se puede mejorar?**

- Agregar soporte para pluralización y formatos de fecha/hora según la región.
- Permitir la carga dinámica de idiomas desde un servidor.
- Implementar fallback automático si falta una traducción.

## 2. Cambio de Tema (Modo Claro/Oscuro)

**¿Cómo se implementó?**

Persistencia en localStorage: El tema seleccionado se guarda en localStorage bajo la clave theme.

**Métodos en app**

- `app.loadTheme()` lee el tema guardado y aplica la clase dark al `<html>`.
- `app.toggleTheme()` alterna entre los temas y actualiza el almacenamiento.
- El estado del botón de cambio de tema (`#theme-toggle`) se sincroniza con el tema actual.

**Estilos CSS**

Se usan clases de TailwindCSS y la clase dark para aplicar estilos oscuros o claros.
Interfaz de usuario:
En la sección de configuración, un switch permite alternar entre los modos.

**¿Por qué es una buena práctica?**

- Mejora la accesibilidad y el confort visual para diferentes usuarios y ambientes.
- Permite personalización y retención de preferencias del usuario.
- Sigue tendencias modernas de diseño web.

**¿Cómo se puede mejorar?**

- Detectar automáticamente el tema del sistema operativo y aplicarlo por defecto.
- Permitir más temas personalizados (ej. alto contraste, sepia).
- Sincronizar el tema entre dispositivos usando una cuenta de usuario.
