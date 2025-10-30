# Ejercicios de Fundamentos de JavaScript

## Hacer un contador de visitas

En el archivo `index.html`, se agrega un elemento para mostrar el contador de visitas dentro del contenedor principal. Por ejemplo, justo después del párrafo de bienvenida:

```html
<p>Hit counter: <span id="hit-counter">0</span></p>
```

El objetivo es actualizar este contador cada vez que se carga la página.

Pero mas allá de solo mostrar el contador, queremos que este valor persista entre recargas de la página. Para lograr esto, utilizaremos el `localStorage` del navegador. La idea es entender cómo funciona el almacenamiento local y cómo podemos usarlo para guardar datos simples como un contador de visitas, así como la forma de interactuar con el DOM para actualizar el contenido mostrado al usuario.

> Parte de esta práctica es comprender cómo funciona la telemetría básica y cómo podemos implementar un sistema sencillo para rastrear interacciones de los usuarios en nuestra aplicación web.
