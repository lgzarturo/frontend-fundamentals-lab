# Gestión de hábitos

Se documentan los cambios realizados en el código fuente relacionados con la gestión de hábitos:

## Ajustes

### Actualizar la gestión de hábitos para usar el espacio de nombres 'app' en lugar de 'store'

- Se refactorizó el acceso y manipulación de los hábitos para que usen el espacio de nombres `app.habits` en vez de `store.habits`.
- Todas las funciones que renderizan, modifican o eliminan hábitos ahora operan sobre `app.habits`, lo que centraliza la lógica de la aplicación y mejora la coherencia.
- El almacenamiento sigue usando `store.save` y `store.load`, pero los datos activos están en `app.habits`.
- Se actualizó la inicialización para cargar los datos desde localStorage a `app.habits`.

### Agregar nuevos hábitos

- Se añadieron nuevos hábitos de ejemplo en la estructura de datos de la aplicación.
- Los hábitos incluyen propiedades como `id`, `title`, `description`, `schedule`, `dailyRecords`, `streak` y `color`.

### Agregar funcionalidad para la pantalla de hábitos

- Se implementó la función principal `habits()` que renderiza la lista de hábitos, muestra el progreso diario, la racha máxima y permite marcar hábitos como completados.
- Se añadieron funciones para crear hábitos desde plantillas y desde formularios personalizados.
- Se implementó la lógica para eliminar y restaurar hábitos, así como para alternar su estado diario y actualizar la racha.

---

## Estructura y decisiones para la sección de hábitos en app.js

La gestión de hábitos en `app.js` se basa en los siguientes principios y componentes:

### 1. Almacenamiento y estado

- Los hábitos activos se almacenan en `app.habits`, un array de objetos con la información de cada hábito.
- El almacenamiento persistente se realiza mediante `store.save(app.habits, "habits")` y la carga inicial con `store.load("habits", "array")`.
- Al iniciar la app, si no existen datos, se crean hábitos de ejemplo (`dummyHabits`).

### 2. Renderizado de hábitos

- La función `habits()` calcula el total de hábitos, los completados hoy, la tasa de cumplimiento y la racha máxima.
- Renderiza cada hábito mostrando título, descripción, botón para marcar como completado, botón para eliminar, racha y progreso de los últimos 7 días.
- El progreso se visualiza con una barra de días y marcas de completado.

### 3. Creación de hábitos

Se crearon métodos para añadir nuevos hábitos:

- `createHabitFromTemplate(templateIndex)`: Permite crear hábitos a partir de plantillas predefinidas, asignando color y descripción.
- `createCustomHabit(e)`: Permite crear hábitos personalizados desde un formulario, con validación y feedback visual.
- `toggleHabit(habitId)`: Alterna el estado de completado del hábito para el día actual, actualiza la racha y lanza una animación de confeti si se completan todos los hábitos.

## 5. Decisiones de diseño

- Separación clara entre lógica de almacenamiento (`store`) y lógica de aplicación (`app`).
- Uso de plantillas y formularios para flexibilidad en la creación de hábitos.
- Feedback visual inmediato (toasts, animaciones) para mejorar la experiencia de usuario.
  > Estos cambios y estructura permiten una gestión robusta, flexible y escalable de los hábitos en la aplicación, facilitando futuras extensiones y mantenibilidad del código.
