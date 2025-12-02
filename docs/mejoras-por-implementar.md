# Ideas

Conforme avanzo en el desarrollo de este proyecto, veo que agregar mas funcionalidades es más de lo mismo, el patrón se repite, y no aporta mucho valor a la idea original del proyecto. Sin embargo, agregar cada vez mas funcionalidades veo que se vuelve complejo y difícil de mantener, he aprendido a manipular el DOM, manejar eventos, y trabajar con datos en JavaScript, pero siento que agregar más funcionalidades no aporta mucho valor.

De momento llevo 3 CRUD completos (Crear, Leer, Actualizar, Eliminar) para presupuestos e ítems de presupuesto, el manejo de hábitos, y gestión de tareas con subtareas, y he implementado características adicionales como modales, mensajes emergentes (toasts), y un sistema de deshacer acciones.

Me falta el manejo de notas y pienso seguir agregando más funcionalidades, como el manejo de contraseñas (porque no quiero pagar por un gestor de contraseñas), pero siento que el proyecto se está volviendo demasiado grande y complejo.

Además todo el código está en un solo archivo JavaScript, lo que hace que sea difícil de mantener y escalar. Creo que es momento de considerar dividir el código en módulos o componentes para mejorar la organización y facilitar el mantenimiento a largo plazo.

También estoy considerando implementar pruebas unitarias para asegurarme de que cada parte del código funcione correctamente y evitar errores en el futuro. Pero con JavaScript puro, esto puede ser un desafío que no estoy seguro de cómo abordar.

Por ahora, creo que es mejor enfocarme en consolidar las funcionalidades existentes, mejorar la experiencia del usuario, y asegurarme de que el código sea limpio y bien documentado antes de agregar más características. Quizás en el futuro pueda considerar migrar a un framework o biblioteca como React o Vue.js para manejar la complejidad del proyecto de manera más eficiente.

## Mejoras por implementar

- Agrupar funcionalidades relacionadas en módulos. Para encapsular el código y exponer solo lo necesario, o idealmente, migrar a ES6 Modules para una estructura más moderna y escalable.
- Envolver el código principal (funciones de renderizado, app, store) en una función anónima.
- Separar responsabilidades en objetos o módulos más específicos.
  - TaskManager: Para operaciones CRUD y lógica específica de tareas.
  - HabitManager: Para operaciones CRUD y lógica específica de hábitos.
  - BudgetManager: Para operaciones CRUD y lógica específica de presupuestos.
  - UIManager: Para renderizado de pantallas, manejo de modales, toasts, y navegación visual.
  - StateManager: Para manejo del estado global (tasks, habits, budgets, currentScreen) y persistencia (puede reemplazar parcialmente store).
  - App: Mantenerlo ligero, solo para inicialización e interacción entre los demás módulos.

> Nota: No veo la necesidad de dividir en archivos separados aún, pero sí en módulos u objetos dentro del mismo archivo para mejorar la organización.
>
> Actualmente el código cuenta con más de 2300 líneas, lo que dificulta su mantenimiento.
>
> Por ejemplo, agregue funcionalidad de tareas fuera de app, lo que hizo que el código fuera más desorganizado. Por eso llegue a la conclusión de que es mejor agrupar funcionalidades relacionadas en módulos u objetos.

**Manejo de Eventos:**

Muchos eventos (`click`, `submit`) están definidos directamente en el HTML como strings (`onclick="..."`). La idea es Usar addEventListener en el código JavaScript. Con esto se puede mejorar la separación de responsabilidades y la mantenibilidad.

**Configuración Centralizada:**

Veo que tengo valores mágicos como visitCount % 10, rutas fijas, o nombres de claves de localStorage están dispersos. Por lo cual sería mejor definir constantes para estos valores al inicio del módulo o en un objeto de configuración.

**Validación de Datos:**

De momento la entrada de formularios no se valida exhaustivamente antes de ser procesada (por ejemplo, hice pruebas y parseFloat podría devolver NaN en algunos casos). Para esto es necesario mejorar las funciones de utilidades para agregar funciones de validación para los datos que provienen de formularios o de localStorage antes de usarlos.

**Uso de const y let:**

Necesito revisar el scope ya que veo variables como today y todayStr deberían ser constantes, ya que no cambian su valor después de la asignación.

**Plantillas en el HTML (HTML Templates):**

De momento las funciones de renderizado construyen cadenas HTML manualmente. Sería mejor usar plantillas HTML (template tags) para mejorar la legibilidad y mantenibilidad del código.

Revisando la documentación de MDN sobre plantillas HTML: [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)

Esto permitiría definir fragmentos de HTML reutilizables directamente en el HTML, y luego clonarlos y llenarlos con datos dinámicos desde JavaScript, solo que tienen que ir en el HTML y no en el JS.

Ventajas aparentes:

- **Separación de Intereses:** El HTML reside en el archivo HTML, el JS en el JS.
- **Mantenibilidad:** Es más fácil editar el HTML visualmente y con resaltado de sintaxis.
- **Reutilización:** Las plantillas pueden ser reutilizadas y clonadas fácilmente.
- **Seguridad:** Al clonar el nodo, no se ejecuta JS ni se inyectan strings directamente.

Desventajas aparentes:

- **Complejidad Inicial:** Requiere entender cómo funcionan las plantillas y el DOM.
- **Rendimiento:** Puede ser ligeramente menos eficiente que construir cadenas HTML directamente, pero la diferencia es mínima en la mayoría de los casos.
- **Compatibilidad:** Aunque la mayoría de los navegadores modernos soportan plantillas, [puede haber problemas en navegadores muy antiguos](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template#browser_compatibility).
- **Curva de Aprendizaje:** Requiere aprender una nueva forma de manejar el HTML dinámico.
- **Eventos:** Hay que manejar los eventos después de clonar los nodos, lo que puede requerir más código.
- **Complejidad en Datos Dinámicos:** Para datos muy dinámicos, puede ser más complicado que simplemente construir cadenas HTML.
