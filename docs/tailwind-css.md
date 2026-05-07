# Integración y organización del diseño con TailwindCSS

## Introducción

Para modernizar y agilizar el desarrollo del proyecto, he decidido implementar
TailwindCSS. La integración usa Tailwind CLI para generar un CSS estático de
producción, evitando ejecutar el compilador JIT en el navegador.

> **Ojo:** no soy novato en Tailwind, pero tampoco un experto. La configuración
> y organización aquí presentada es una solución práctica y funcional para este
> proyecto específico, buscando un balance entre rapidez de desarrollo y
> mantenibilidad.

## Cambios realizados

- **CSS estático de Tailwind:** Se genera `assets/css/tailwind.min.css` con
  `npm run build:css` y se carga desde `index.html`.
- **Tema base personalizado:** Se configuró el tema en `tailwind.config.cjs`
  extendiendo la
  paleta de colores con variantes como `xp-primary`, `xp-secondary`, `xp-card`,
  entre otros, para mantener coherencia visual y facilitar la personalización.
- **Componentes adaptados:** El hero, footer, sidebar y navegación móvil fueron
  rediseñados usando clases utilitarias de Tailwind, mejorando la responsividad,
  accesibilidad y estética general.
- **Estilos adicionales:** Se mantuvieron algunos estilos en `styles.css` para
  detalles como pixel corners y tap targets, complementando la base de Tailwind.

## Ventajas de esta organización

- **Desarrollo rápido:** Tailwind permite prototipar y ajustar el diseño
  directamente en el HTML, sin necesidad de escribir CSS adicional.
- **Consistencia visual:** El tema base asegura que los colores y estilos sean
  uniformes en todos los componentes.
- **Flexibilidad:** Es fácil modificar o extender el diseño conforme evoluciona
  el proyecto.
- **Mejor rendimiento:** El navegador descarga CSS ya compilado en lugar del
  runtime de Tailwind.

## Regenerar CSS

Ejecuta este comando después de agregar o modificar clases Tailwind en
`index.html` o `assets/js/**/*.js`:

```bash
npm run build:css
```

## Disclaimers

> **Disclaimer sobre el modo oscuro**
>
> Actualmente, el modo oscuro no se activa por defecto. Intenté configurar
> `darkMode: 'class'` en la inicialización de Tailwind (ver `app.js`), pero tras
> revisar la documentación y probar varias opciones, no logré que el tema
> obscuro se aplique automáticamente al cargar la página. Por ahora, el modo
> oscuro queda pendiente de solución y se abordará en futuras iteraciones.
> **Disclaimer sobre el diseño**
>
> De momento, el diseño implementado es funcional pero básico. No se ha
> profundizado en detalles visuales avanzados ni en una experiencia de usuario
> pulida. El enfoque principal ha sido integrar Tailwind y establecer una base
> sólida para futuros desarrollos y mejoras en el diseño. Estoy usando emoticons
> y colores simples para mantener la claridad y funcionalidad, dejando espacio
> para iteraciones futuras donde se pueda refinar la estética y experiencia del
> usuario.

## Referencias

- [Branch de implementación de TailwindCSS](module-02-install-tailwindcss)
