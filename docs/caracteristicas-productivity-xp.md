# Productivity XP

Es un proyecto personal diseñado para mejorar la productividad a través de una
aplicación web de una sola página (SPA) que integra múltiples herramientas
útiles. La aplicación está construida con HTML, Tailwind CSS v3 y JavaScript
puro, y ofrece funcionalidades como un gestor de presupuesto, tareas, notas en
markdown y seguimiento de hábitos.

## Características principales

- **Modo oscuro por defecto:** La interfaz está optimizada para uso en
  condiciones de poca luz, reduciendo la fatiga visual.
- **Totalmente responsive:** La aplicación se adapta a diferentes tamaños de
  pantalla, ofreciendo una experiencia fluida tanto en dispositivos móviles como
  en escritorio.
- **Usable sin conexión:** Gracias al almacenamiento en `localStorage`, los
  usuarios pueden acceder a sus datos y funcionalidades incluso sin conexión a
  internet.
- **Persistencia local y exportación/importación de datos en JSON:** Los
  usuarios pueden guardar sus datos localmente y exportarlos o importarlos en
  formato JSON para facilitar la gestión y respaldo de su información.
- **Microinteracciones sutiles inspiradas en videojuegos:** La aplicación
  incluye pequeñas animaciones y efectos que mejoran la experiencia del usuario,
  haciendo que la interacción sea más atractiva y divertida.
- **Accesibilidad:** Se han implementado buenas prácticas de accesibilidad para
  asegurar que la aplicación sea usable por la mayor cantidad de personas
  posible.
- **Experiencia fluida en móvil:** La interfaz y las interacciones están
  diseñadas para ser intuitivas y fáciles de usar en dispositivos móviles.
- **Aprendizaje profundo de fundamentos del frontend:** El desarrollo de esta
  aplicación sirve como una oportunidad para aprender y comprender a fondo los
  conceptos básicos del desarrollo frontend.

### 🏠 Panel Principal

- **Resumen rápido**: Visualiza tu racha de hábitos, tareas completadas,
  presupuesto restante y cantidad de notas de un vistazo.
- **MITs (Tareas Más Importantes)**: Enfócate en tus 3 tareas prioritarias del
  día.
- **Hábitos de hoy**: Acceso rápido para completar tus hábitos diarios.
- **Actividad reciente**: Consulta tus logros y actualizaciones más recientes.

### 💰 Gestor de Presupuesto

- **Crear múltiples presupuestos**: Organiza tus finanzas con categorías
  personalizadas.
- **Elementos de presupuesto**: Añade categorías con montos asignados y notas.
- **Transacciones**: Registra gastos e ingresos con historial detallado.
- **Progreso visual**: Barras de progreso estilo XP muestran el gasto de un
  vistazo.
- **Resumen en el panel**: Presupuesto total, gastado y restante destacados.
- **Alertas por colores**: Verde (seguro), amarillo (advertencia), rojo (exceso
  de gasto).

### ✓ Tareas y Checklist

- **Operaciones CRUD completas**: Crea, consulta, edita y elimina tareas.
- **Detalles enriquecidos**: Título, descripción, fecha límite, niveles de
  prioridad y etiquetas.
- **Subtareas**: Divide tareas complejas en pasos manejables.
- **Arrastrar para reordenar**: Prioriza tareas fácilmente (funciona en
  escritorio y móvil).
- **Filtros inteligentes**: Ver todas las tareas, las de hoy, alta prioridad o
  completadas.
- **Indicadores de prioridad**: Las tareas urgentes se marcan con un rayo ⚡.
- **Recompensas XP**: Gana +15 XP por cada tarea completada.

### 📝 Notas Markdown

- **Editor Markdown**: Escribe notas con formato markdown.
- **Vista previa en vivo**: Alterna entre edición y vista previa.
- **Parser personalizado**: Analizador markdown minimalista integrado (sin
  librerías externas).
  - Encabezados (h1, h2, h3)
  - Texto en negrita y cursiva
  - Bloques de código con estilos de resaltado
  - Código en línea
  - Listas sin orden
- **Función de búsqueda**: Encuentra notas por título, contenido o etiquetas.
- **Organización por etiquetas**: Clasifica notas con etiquetas separadas por
  comas.
- **Auto-fechas**: Registra cuándo se actualizó cada nota.

### 🎯 Seguimiento de Hábitos

- **Plantillas de rutina para programadores**: Hábitos predefinidos basados en
  rutinas óptimas para desarrolladores.
  - Despertar sin posponer
  - Hidratarse (500ml de agua)
  - Meditación estoica (10 min)
  - Rutina de movilidad
  - Definir 3 MITs
  - Completar primer bloque de trabajo profundo
  - Bloque de aprendizaje (30-45 min)
  - Revisión al final del día
  - Atardecer digital (6 PM)
  - Preparación para dormir antes de las 9 PM
- **Hábitos personalizados**: Crea tus propios hábitos con título y descripción.
- **Registro diario**: Marca hábitos como completados con un solo toque.
- **Seguimiento de rachas**: Mantén y visualiza tus rachas con indicadores.
- **Vista calendario de 7 días**: Observa tu progreso semanal fácilmente.
- **Tasa de cumplimiento**: Porcentaje total de hábitos completados.
- **Recompensas XP**: Gana +10 XP por cada hábito completado.

### ⚙️ Configuración

- **Tema oscuro/claro**: Alterna entre modos (oscuro por defecto).
- **Exportar datos**: Descarga todos tus datos en formato JSON.
- **Importar datos**: Sube datos previamente exportados.
- **Restaurar datos de demostración**: Recupera datos de ejemplo en cualquier
  momento.
- **Borrar todos los datos**: Comienza desde cero (con confirmación).

### 🎨 Características de Diseño

- **Estética de videojuego**: Puntos XP, animaciones de subida de nivel, barras
  de progreso.
- **Toques retro**: Esquinas estilo pixel y paleta de colores inspirada en
  videojuegos.
- **Tema oscuro**: Predeterminado, amigable para la vista y con alto contraste.
- **Mobile-first**: Diseño responsivo que funciona perfectamente en todos los
  dispositivos.
- **Optimizado para tacto**: Áreas de toque grandes (mínimo 44x44px).
- **Microanimaciones**: Transiciones suaves y animaciones sutiles.
- **Deshacer acciones**: Recupera elementos eliminados dentro de 5 segundos.

## 🎮 Elementos de Gamificación

- **Puntos XP**: Gana puntos de experiencia al completar tareas y hábitos.
- **Sistema de rachas**: Construye rachas diarias de hábitos con el emoji de
  fuego 🔥.
- **Barras de progreso**: Indicadores visuales con estilo de barras de vida/mana
  de videojuegos.
- **Animaciones**: Microanimaciones suaves para acciones (subida de nivel,
  ganancia de XP).
- **Codificación por colores**: Verde para éxito, rojo para peligro, amarillo
  para advertencias.
- **Sensación de logro**: Retroalimentación visual satisfactoria al completar
  elementos.

## 🎯 Características de Rutina para Programadores

La app incluye una rutina completa de productividad para desarrolladores:

### Rutina Matutina (6:00 - 9:00)

- Despertar sin posponer
- Hidratación (500ml de agua con limón)
- Exposición a luz natural
- Movilidad y calistenia (15-20 min)
- Meditación estoica (10 min)
- Desayuno de alto rendimiento
- Definir 3 MITs para el día

### Bloques de Trabajo

- **Bloque de trabajo profundo 1** (9:00 - 10:00): 60 min de enfoque en
  programación
- **Comunicación asíncrona** (10:00 - 10:30): Revisar y responder mensajes
- **Bloque de trabajo profundo 2** (12:00 - 13:00): 60 min de trabajo enfocado
- **Tareas administrativas** (15:00 - 15:30): Organización y planificación
- **Bloque de aprendizaje** (16:30 - 17:15): 30-45 min de desarrollo de
  habilidades

### Rutina Vespertina (17:30 - 23:00)

- Revisión de fin de día (17:30)
- Planificación para el día siguiente
- Ejercicio vespertino
- Atardecer digital (18:00)
- Preparación para dormir (21:00)
- Hora objetivo de sueño (23:00)

## 🔧 Detalles Técnicos

### Tecnologías Utilizadas

- **HTML5**: Marcado semántico
- **Tailwind CSS v3.x**: Framework CSS utility-first (vía CDN)
- **JavaScript puro**: Sin frameworks, solo ES6+
- **API LocalStorage**: Persistencia de datos en el cliente

### Compatibilidad con Navegadores

- Chrome/Edge (última versión)
- Firefox (última versión)
- Safari (última versión)
- Navegadores móviles (iOS Safari, Chrome Mobile)

### Rendimiento

- **Ligero**: ~70KB en total (sin minificar)
- **Carga rápida**: Renderiza en milisegundos
- **Animaciones suaves**: Transiciones CSS a 60fps
- **Eficiente**: Sin dependencias externas más allá de Tailwind CDN

## 📱 Experiencia Móvil

- **Navegación inferior**: Acceso fácil a todas las secciones
- **Deslizable**: Grandes áreas táctiles en toda la app
- **Grid responsivo**: El diseño se adapta de móvil a escritorio
- **Sin zoom manual**: Fuentes y elementos con tamaño adecuado
- **Alto rendimiento**: Optimizado para navegadores móviles

## 🔒 Privacidad y Seguridad

- **100% local**: Todos los datos permanecen en tu navegador
- **Sin cuenta necesaria**: Funciona completamente offline
- **Tus datos**: Exporta y conserva tus datos en cualquier momento

## 🐛 Solución de Problemas

### ¿No se guardan los datos?

- Verifica que localStorage esté habilitado en tu navegador
- Asegúrate de no estar en modo privado/incógnito
- Limpia la caché del navegador y recarga la página

### ¿El tema no funciona?

- Usa un navegador moderno
- Verifica que JavaScript esté habilitado
- Prueba limpiar localStorage y restaurar datos de demostración

### ¿Problemas al exportar/importar?

- Asegúrate de que el archivo sea JSON válido
- Verifica que el archivo no esté corrupto
- Exporta datos nuevos y compara la estructura

## 🚧 Mejoras Futuras

Posibles funciones para próximas versiones:

- Vista de calendario para tareas
- Gráficas y análisis de presupuesto
- Enlaces y backlinks en notas
- Historial de rachas de hábitos
- Cambio automático de tema oscuro/claro
- Atajos de teclado
- Sincronización de datos entre dispositivos
- Versiones para app móvil

## 🙏 Créditos

Creado con ❤️ y ☕ por [Arturo López](https://lgzarturo.com) para
desarrolladores que quieren mejorar su productividad.

**Inspiración:**

- Rutinas de productividad para programadores
- Estética retro de videojuegos
- Principios modernos de diseño web

## 📄 Licencia

Este proyecto es open source y está disponible para uso personal. ¡Siéntete
libre de modificarlo y ampliarlo según tus necesidades!

---

**¡Disfruta subiendo de nivel tu productividad! 🎮⚡**
