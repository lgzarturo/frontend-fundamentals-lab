# Código de la aplicación

El código fuente de la aplicación principal se encuentra en el archivo `app.js`. A continuación, describo la estructura general, los patrones de diseño utilizados, también explicare alguna des decisiones sobre el diseño, aprendizajes y que opciones de mejora podrían implementarse en el futuro.

## Patrones de diseño utilizados

- **Singleton**: El objeto `app` y `store` actúan como namespaces globales que centralizan la lógica y el estado de la aplicación. Son accesibles globalmente y existen una sola instancia de cada uno. Esto facilita la organización del código en un proyecto pequeño/mediano sin necesidad de un sistema de módulos complejo. Pense en en ellos como singletons que encapsulan funcionalidades relacionadas, para evitar contaminación del espacio global.
- **Módulo**: El código encapsula funcionalidades relacionadas (como manejo de hábitos, tareas, UI, almacenamiento) dentro de funciones y objetos (`app`, `store`, `tailwind.config`), aunque no se usa un patrón de módulo formal como IIFE o módulos ES6 para aislar completamente el scope interno. Esto ayuda a organizar el código en secciones lógicas, puse de esa forma por la naturaleza didáctica del proyecto y por el uso de tailwind via CDN.
- **Observador**: El manejo de eventos DOM (clicks en botones, submit de formularios) implica que elementos de la UI escuchan eventos y reaccionan, actualizando el estado y la vista. Aunque no es un patrón observador puro, hay una relación de dependencia entre la UI y el estado. Es la forma en como se maneja la interacción del usuario con la aplicación.
- **Renderizado Basado en Estado**: Las funciones `home`, `habits`, etc., leen el estado almacenado en `app.habits`, `app.tasks` y generan HTML dinámicamente para reflejar ese estado en la interfaz. Para tener la UI sincronizada con el estado, cada vez que se modifica el estado (por ejemplo, al marcar un hábito como completado), se vuelve a llamar a la función de renderizado correspondiente.
- **CRUD (Create, Read, Update, Delete)**: Las funciones `createHabitFromTemplate`, `createCustomHabit`, `toggleHabit`, `deleteHabit` implementan operaciones básicas sobre los hábitos, almacenando los cambios en `localStorage`. Originalmente pensé en esto como un patrón de diseño, pero es más bien una práctica común en aplicaciones que manejan datos. Pense en encapsular estas operaciones en el objeto `app` para centralizar la lógica de manipulación de datos, pero al final quedaron como funciones independientes. Pienso que podrían beneficiarse de una mayor encapsulación.
- **Funciones de Utilidad**: Se definen funciones independientes (`generateId`, `formatDate`, `escapeHtml`, `launchConfetti`, `generatePastRecords`, `getLast7Days`) que realizan tareas específicas y reutilizables. Estas funciones ayudan a mantener el código DRY (Don't Repeat Yourself) y facilitan la legibilidad. La idea es tener utilidades separadas para tareas comunes que pueden ser usadas en múltiples partes del código. Reutilización y claridad.

## Ideas de mejora y refactorización

- **Separación de Intereses (Separation of Concerns)**:
  - **Lógica de Negocio vs. UI**: El código mezcla operaciones de lógica de negocio (cálculo de rachas, creación de hábitos) con manipulación directa del DOM (renderizado HTML). Pienso que se debería separar la lógica pura de la manipulación de la interfaz. Por ejemplo, una función `calculateStreak(habit, date)` debería existir aparte de `toggleHabit`, que podría llamarla y luego actualizar la UI.
  - **Datos vs. Presentación**: Las funciones de renderizado (`home`, `habits`) de momento hacen demasiado: filtran, ordenan, calculan y generan HTML. Idealmente, la lógica de obtención y transformación de datos debería estar en funciones separadas que devuelvan estructuras de datos, y otra función solo se encargue de renderizar esas estructuras.
- **Gestión del Estado**:
  - **`localStorage` Directo**: El objeto `store` interactúa directamente con `localStorage`. Sería más robusto abstraer esta capa de persistencia. Si se quisiera cambiar a Firebase o IndexedDB en el futuro, habría que modificar `store`. Se podría crear un módulo `PersistenceManager` con métodos `save`, `load` que encapsulen el mecanismo de almacenamiento.
  - **Mutación Directa**: El estado (`app.habits`, `app.tasks`) se modifica directamente (por ejemplo, `habit.streak++`, `app.habits.push(habit)`). Pienso que debería tener un patrón de actualización de estado inmutable o usar una librería de gestión de estado para prevenir efectos secundarios no deseados.
- **Manejo de Errores**:
  - **Falta de `try...catch`**: Aunque hay un `try...catch` en `store.save` para un tipo específico de dato, el código en general carece de manejo robusto de errores. Por ejemplo, `JSON.parse` en `store.load` podría fallar si los datos en `localStorage` están corruptos. Se debería manejar este escenario para evitar que la aplicación se rompa.
  - **Validación de Datos**: No se valida la entrada del usuario o la estructura de los datos cargados desde `localStorage`. Se asume que los objetos tienen las propiedades esperadas. Esto puede causar errores si la estructura cambia o se corrompe, además que se confía en que el usuario siempre ingrese datos válidos. Se debería agregar validaciones, además de sanitización y el uso de tipos para mayor seguridad.
- **Dependencias y Acoplamiento**:
  - **Dependencia de `app`**: Muchas funciones (`toggleHabit`, `deleteHabit`, `home`, `habits`) dependen directamente del objeto global `app` y sus propiedades (`app.habits`, `app.tasks`). Esto las hace difíciles de probar aisladamente y las acopla fuertemente al estado global. Se debería pasar el estado necesario como parámetros a las funciones. Es fácil agregar nuevas funcionalidades, pero dificulta la mantenibilidad, esto lo note cuando quise pensar en pruebas unitarias y agregar mas funcionalidades a los hábitos.
  - **Acoplamiento con DOM**: Las funciones de renderizado dependen directamente de elementos del DOM (por ejemplo, `document.getElementById("habits-list")`). Esto las hace difíciles de probar unitariamente. Se podría inyectar el contenedor del DOM como parámetro.
- **Calidad del Código**:
  - **Nombres de Variables y Funciones**: En general, los nombres son descriptivos, pero hay algunos como `mits` que podrían ser más claros (por ejemplo, `importantTasksForToday`), eso lo tengo que reconocer y mejorar cuando revise el código.
  - **Comentarios**: Agregue comentarios JSDoc siguiendo un estándar, lo cual es positivo, hace más mantenible el código. Se podrían mejorar los comentarios internos de las funciones más complejas para explicar la lógica no trivial.
  - **Lógica de Racha de Hábitos**: La lógica para calcular y actualizar la racha (`toggleHabit`) es compleja y podría simplificarse o dividirse en funciones más pequeñas. Actualmente, solo considera el día anterior, lo cual puede no reflejar correctamente una racha si se marcan hábitos para fechas intermedias.
  - **Duplicación de Código**: Hay cierta duplicación en la generación de HTML dentro de `home` y `habits`. Se podrían extraer funciones para renderizar componentes individuales (como un item de hábito o tarea).
- **Pruebas**:
  - **Dificultad para Probar**: Debido al acoplamiento con el DOM y el estado global, escribir pruebas unitarias es complejo. La refactorización para mejorar la separación de intereses y la inyección de dependencias es crucial para facilitar las pruebas.
- **Seguridad**:
  - **`textContent` vs `innerHTML`**: Aunque estoy usando una función `escapeHtml`, partes del HTML se generan con cadenas de texto y se inyectan con `innerHTML`. El uso de `textContent` es seguro para mostrar texto plano, pero `innerHTML` puede ser un vector de ataque XSS si no se sanitiza correctamente _antes_ de inyectarlo. El uso actual de `escapeHtml` es un paso en la dirección correcta, pero se debe asegurar que _todo_ el contenido dinámico que pase a `innerHTML` esté correctamente escapado o que se use un sistema de plantillas seguro.

## Pruebas del código

Dado el código actual, las pruebas unitarias serían difíciles de implementar sin refactorizar:

### **A. Funciones de Utilidad**

1. `generateId`: Verificar que devuelve una cadena única en cada llamada.
2. `formatDate(date)`: Probar con `Date` objeto, string ISO, y `Date.now()`. Verificar formato `YYYY-MM-DD`.
3. `escapeHtml(text)`: Probar con cadenas que contengan `<`, `>`, `&`, `"`, `'`. Verificar que se conviertan en entidades HTML.
4. `generatePastRecords(days, successRate)`: Probar con diferentes valores de `days` y `successRate`. Verificar que el objeto devuelto tenga la cantidad correcta de claves y que los valores sean booleanos.
5. `getLast7Days()`: Verificar que devuelve un array de 7 cadenas de fecha en formato `YYYY-MM-DD`, representando los últimos 7 días consecutivos.

### **B. Lógica de Negocio (Después de Separarla)**

1. `calculateStreak(habit, date)`: Dado un hábito con `dailyRecords` y una fecha, verificar que la racha se calcule correctamente, considerando días anteriores y posibles huecos.
2. `updateHabitStatus(habit, date, status)`: Dado un hábito, una fecha y un estado (true/false), verificar que `dailyRecords` y `streak` se actualicen correctamente según las reglas del hábito.
3. `getImportantTasksForToday(tasks)`: Dado un array de tareas, verificar que filtre y ordene correctamente las tareas de alta prioridad o vencimiento para hoy.

### **C. Operaciones CRUD (Después de Abstraer Persistencia)**

1. `createHabit(habitData, persistenceManager)`: Verificar que se llame al método `save` del `persistenceManager` con los datos del hábito nuevo agregado a la lista existente.
2. `deleteHabit(habitId, persistenceManager)`: Verificar que se llame al `persistenceManager` para cargar la lista, eliminar el hábito con el `habitId` y luego guardar la lista actualizada.
3. `toggleHabit(habitId, date, persistenceManager)`: Verificar que se cargue el hábito, se actualice su estado para la `date`, se recalcule la racha y se guarde la actualización.

### **D. Interfaz de Usuario (Después de Inyectar Dependencias)**

1. `renderHabitItem(habit, container)`: Dado un objeto `habit` y un elemento `container`, verificar que el HTML interno del `container` coincida con la estructura esperada del hábito (título, descripción, estado de hoy, racha).
2. `renderHabitsList(habits, container)`: Dado un array de `habits` y un `container`, verificar que se llame a `renderHabitItem` para cada hábito y que el `container` contenga la lista completa renderizada.

Para las pruebas reales se requeriría una herramienta de testing como Jest (necesita adaptación para entorno navegador) o QUnit, junto con un entorno DOM simulado (como jsdom) para probar la interacción con el DOM si no se refactoriza para inyectar dependencias. Esto es especialmente complejo en javascript puro sin un framework de testing integrado. Pero si es necesario para asegurar la calidad del código a medida que crece la aplicación.
