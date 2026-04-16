# Implementar i18n en todos los textos de la aplicación

Como parte de la solución es importante agregar claves de traducción faltantes
en JSON

En es.json y en.json - agregar:

```json
{
  "label": {
    "justNow": "Justo ahora / Just now",
    "ago": "atrás / ago",
    "noTasks": "No hay tareas. ¡Crea tu primera! ✓ / No tasks found. Create your first task! ✓",
    "noHabits": "No hay hábitos. ¡Añade hábitos para empezar! 🎯 / No habits yet. Add habits to start tracking! 🎯",
    "noNotes": "No hay notas. ¡Empieza a escribir! 📝 / No notes yet. Start writing! 📝",
    "low": "Baja / Low",
    "medium": "Media / Medium",
    "high": "Alta / High",
    "delete": "Eliminar / Delete",
    "edit": "Editar / Edit"
  },
  "app.screens.budgets.used": "usado / used",
  "app.screens.budgets.noBudgets": "No hay presupuestos aún / No budgets yet"
}
```

## Modificar app.js - Crear/Editar modales

Para estos modales, agregar traducciones en la sección
app.screens.tasks.modal.create, app.screens.budgets.modal.create, etc. en los
JSON, es necesario completar los siguientes modales:

1. Modal Crear Tarea
2. Modal Crear Presupuesto
3. Modal Crear Nota
4. Modal Añadir Hábito
5. Modal Editar Tarea
6. Modal Detalles Presupuesto
7. Modal Añadir Transacción
8. Modal Añadir Item Presupuesto

## Modificar funciones de renderizado

En app.js:

- tasks(): Cambiar mensaje hardcodeado por I18n.getMessage("label.noTasks")
- habits(): Cambiar por I18n.getMessage("label.noHabits")
- notes(): Cambiar por I18n.getMessage("label.noNotes")

## Traducir mensajes toast

En app.showToast() y otros lugares:

- "Task created! 📝" → I18n.getMessage("ui.common.toast.taskCreated")
- "Habit added! 🎯" → I18n.getMessage("ui.common.toast.habitCreated")
- etc. (ya existen en JSON, solo asegurar que se usen)

## Modificar opciones de selectores

En los <select> de prioridad y moneda, los valores hardcodeados como "Low",
"Medium", "High" deben usar traducciones. Esto es complicado porque los valores
son usados como claves en el código. Pero se puede hacer ajustando el código
para que use las claves de traducción en lugar de los valores hardcodeados. Por
ejemplo, en lugar de usar "Low" como valor, usar "low" y en el código usar
`I18n.getMessage("label.low")` para obtener la traducción.
