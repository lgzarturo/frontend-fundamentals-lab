# Ejercicios de Fundamentos de JavaScript

## Hacer un contador de visitas

En el archivo `index.html`, se agrega un elemento para mostrar el contador de visitas dentro del contenedor principal. Por ejemplo, justo después del párrafo de bienvenida:

```html
<p>Hit counter: <span id="hit-counter">0</span></p>
```

El objetivo es actualizar este contador cada vez que se carga la página.

Pero mas allá de solo mostrar el contador, queremos que este valor persista entre recargas de la página. Para lograr esto, utilizaremos el `localStorage` del navegador. La idea es entender cómo funciona el almacenamiento local y cómo podemos usarlo para guardar datos simples como un contador de visitas, así como la forma de interactuar con el DOM para actualizar el contenido mostrado al usuario.

> Parte de esta práctica es comprender cómo funciona la telemetría básica y cómo podemos implementar un sistema sencillo para rastrear interacciones de los usuarios en nuestra aplicación web.

---

## Conceptos aprendidos: Contador de visitas y animación de confetti

### 1. Contador de visitas con persistencia

- **Manipulación del DOM:** Aprendimos a seleccionar y actualizar elementos HTML desde JavaScript, mostrando el número de visitas en tiempo real.
- **Persistencia con localStorage:** Se usa el almacenamiento local del navegador para guardar el contador de visitas, logrando que el valor persista entre recargas y sesiones. Esto permite entender cómo guardar y recuperar datos simples en el frontend.
- **Telemetría básica:** Se implementó un sistema sencillo para rastrear interacciones de los usuarios, lo que es útil para analizar el uso de la aplicación y mejorar la experiencia.
- **Buenas prácticas:** Separación de responsabilidades en el código, uso de funciones para inicializar, guardar y cargar datos, y manejo de posibles errores al interactuar con localStorage.

### 2. Animación de confetti interactiva y realista

- **Canvas y animaciones:** Se hizo uso del elemento `<canvas>` y su contexto 2D para dibujar partículas animadas, explorando técnicas de animación cuadro a cuadro con `requestAnimationFrame`.
- **Física básica:** El objetivo era simular una explosión de confetti desde el centro de la pantalla, aplicando ángulos, velocidades, gravedad y rotación a cada partícula para lograr un movimiento parabólico y natural.
- **Balanceo y pico:** Se aplicó la animación para que las partículas solo comiencen a balancearse (movimiento sinusoidal) después de alcanzar su punto más alto, detectando el cambio de dirección en la velocidad vertical.
- **Variedad visual:** Se agregan diferentes formas (rectángulos, elipses, diamantes, triángulos) y colores para hacer la animación más atractiva y divertida.
- **Fade-in y fade-out:** Se aplica el uso de transiciones de opacidad para que el confetti aparezca y desaparezca suavemente, mejorando la experiencia visual.
- **Integración con el contador:** La animación de confetti se lanza cada 10 visitas, celebrando la interacción del usuario y reforzando el feedback positivo.

### 3. Ajustes y mejoras recientes

- Incremento del número de partículas y variedad de formas.
- Mejora en la dispersión inicial para evitar acumulación en el centro.
- Detección del pico de cada partícula para activar el balanceo solo en la caída.
- Refactorización para cumplir con el estándar de estilo StandardJS.
- Optimización de la persistencia y actualización del contador de visitas.

---
