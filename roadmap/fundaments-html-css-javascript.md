# Roadmap: App SPA CRUD en JavaScript puro + Tailwind CSS 3

**Objetivo principal:**

Construir una aplicación de una sola página, mobile first y en modo oscuro por defecto, que sirva como caja de herramientas de productividad personal para un programador. Todo debe persistir en localStorage. El foco es aprender a fondo los fundamentos de JavaScript mientras se desarrolla la app.

> En mi caso ya tengo conocimientos avanzados de HTML y CSS, por lo que el énfasis está en JavaScript y la manipulación del DOM sin frameworks.
>
> Sin embargo, se aplicarán buenas prácticas de HTML semántico y CSS moderno (Tailwind v3). No trabajaré con TypeScript ni frameworks JS y Tailwind v4 lo dejaré para otro proyecto o una segunda fase. Usaré Tailwind v3 en su versión CDN para simplificar y evitar configuraciones complejas.

## Sprint de aprendizaje y entrega (sugerido)

Duración sugerida: 14 días. Cada bloque combina objetivo técnico y práctica de fundamentos.

> Voy a mi ritmo, son 14 días pero puedo extender si quiero profundizar más, ademas estrictamente no es un sprint de trabajo, es un proyecto personal, por lo que el desarrollo de los días se basan en mi tiempo disponible fuera de mis actividades diarias. Pongo la estructura para tener un plan claro.

### Días 0 a 2 — Preparación y fundamentos web

* Objetivo técnico

  * Estructura del proyecto y archivos base: `index.html`, `styles.css` (Tailwind v4 CDN o build), `app.js`, `data.js` (seed y utilidades), `utils/` y `components/` según convenga.
  * Configurar dark mode por defecto con posibilidad de toggle.

* Fundamentos a practicar

  * HTML semántico y ARIA básico.
  * CSS moderno y mobile first.
  * Organización de código JS en módulos y funciones puras.

* Entregable

  * Página base con header minimal, footer y espacio para el dashboard.
  * Toggle de tema y persistencia en settings.

### Días 3 a 4 — Estado, DOM y manipulación básica

* Objetivo técnico

  * Implementar patrón simple de estado en memoria y renderizado DOM manual.
  * Estructura de localStorage con namespace `app_habits_v1`.

* Fundamentos a practicar

  * `document.querySelector`, creación y eliminación de nodos, manejo de eventos.
  * Serialización JSON y almacenamiento atómico en localStorage.

* Entregable

  * Utilidad `store.save()` y `store.load()` que siempre escriben por secciones.
  * Hooks simples de re-render al mutar el estado.

### Días 5 a 7 — CRUD básico: Tareas y checklist

* Casos de uso a desarrollar

  * Crear tarea con título, descripción, fecha de entrega, prioridad, tags, subtareas y orden.
  * Marcar completada y deshacer.
  * Drag to reorder móvil simple (touch reorder) o botones mover arriba/abajo si hay tiempo corto.

* Fundamentos a practicar

  * Arrays de objetos, inmutabilidad superficial, render condicional.
  * Eventos táctiles y accesibilidad del teclado.

* Criterios de aceptación mínimo

  * Añadir, editar, listar, eliminar y persistir tareas.
  * Undo toast visible por unos segundos al borrar.

* Entregable

  * Pantalla Tasks con lista y modal de creación/edición.

### Días 8 a 9 — CRUD avanzado: Budget manager

* Casos de uso a desarrollar

  * Crear presupuestos y items por categoría con cantidad, fecha y notas.
  * Agregar transacciones vinculadas a items.
  * Vista de resumen: total, gastado, restante y pequeño historial.
  * Filtros rápidos por rango temporal y categoría.

* Fundamentos a practicar

  * Cálculos derivados desde arrays, mapas y reducciones.
  * Visualización simple con barras de progreso y badges.

* Criterios de aceptación mínimo

  * Crear presupuesto, agregar transacción, ver cálculo correcto y persistente.

* Entregable

  * Budget screen con progress bars estilo XP y filtros funcionales.

### Días 10 a 11 — Notas Markdown

* Casos de uso a desarrollar

  * Crear, editar, borrar notas en markdown.
  * Preview en vivo y toggle edit/preview.
  * Buscador simple y tags.

* Fundamentos a practicar

  * Implementar parser mínimo para headings, bold, italic, listas y code blocks o integrar un parser ligero sin dependencias.
  * Sanitizar entrada antes de renderizar.

* Criterios de aceptación mínimo

  * Guardar nota en markdown y mostrar preview fiel dentro de las limitaciones del parser.

* Entregable

  * Notes screen con editor y vista previa.

### Días 12 a 13 — Habit tracker con rutina de programador

* Casos de uso a desarrollar

  * Plantillas de hábitos basadas en la rutina weekday que diste.
  * Por hábito: check-in diario, registro diarioRecords por fecha, cálculo de streak, vista semanal o mini calendario.
  * XP numérico y visual para progreso.

* Fundamentos a practicar

  * Manipulación de fechas en JS sin librerías, formateo YYYY-MM-DD.
  * Algoritmos para calcular streaks y resumen semanal.

* Criterios de aceptación mínimo

  * Check-in diario, streaks calculados correctamente y persistencia.

* Entregable

  * Habits screen con plantillas activables.

### Día 14 — Pulido, export/import y pruebas

* Objetivo técnico

  * Export e import JSON atómico.
  * Reset parcial, reset completo y opción de seed initial data si storage vacío.
  * Pequeños tests manuales tipo checklist y scripts de pruebas unitarias mínimas o funciones testables.

* Fundamentos a practicar

  * Serialización, validación de schema simple, manejo de errores y UX para acciones destructivas.

* Entregable

  * Settings screen con export/import, toggle tema y botón reset.

---

## Casos de uso detallados (resumen rápido)

* Budget manager

  * Crear presupuesto, añadir items, crear transacciones, ver resumen, filtrar, ver historial.
  * Indicador visual tipo barra de progreso o medidor XP por categoría.

* Tasks / Checklist

  * Crear tarea, subtareas, marcar completo, reordenar, ver MIT del día.

* Notes Markdown

  * Crear y editar notas en markdown, preview en vivo, búsqueda y tags.

* Habits

  * Plantillas de rutina, check-in diario, streaks, vista semanal, XP.

* Settings

  * Tema, moneda, primer día de la semana, export/import, reset.

---

## Modelo de datos sugerido (localStorage key `app_habits_v1`)

Ejemplo minimal:

```json
{
  "budgets": [
    {
      "id": "b1",
      "name": "Personal",
      "currency": "MXN",
      "items": [
        {"id":"bi1","title":"Comida","amount":5000,"date":"2025-10-24","notes":""}
      ],
      "transactions":[
        {"id":"t1","itemId":"bi1","amount":120,"date":"2025-10-24","notes":"Uber Eats"}
      ]
    }
  ],
  "tasks": [
    {"id":"task1","title":"Implementar login","description":"", "dueDate":"2025-10-25","priority":"high","tags":["dev"],"subtasks":[], "done":false, "order":1}
  ],
  "notes": [
    {"id":"n1","title":"Ideas para side project","bodyMarkdown":"## Idea\n- punto","tags":["ideas"],"updatedAt":"2025-10-24T19:00:00Z"}
  ],
  "habits": [
    {"id":"h1","title":"Beber agua","schedule":["mon","tue","wed","thu","fri"],"dailyRecords":{"2025-10-24":true},"streak":3}
  ],
  "settings": {"theme":"dark","currency":"MXN","firstDayOfWeek":1,"notificationsEnabled":false}
}
```

Guarda atomizada por entidad para minimizar corrupción. Cada vez que escribes, reemplaza la sección correspondiente y luego escribe un `lastUpdated` en la raíz.

---

## Reglas de persistencia y comportamiento offline

* Todo cambio en UI escribe inmediatamente a localStorage.
* Primera carga detecta `app_habits_v1` vacío y planta datos seed basados en la rutina.
* Export crea un archivo JSON descargable. Import valida shape y reemplaza o merge según elección del usuario.
* App usable offline tras primera carga ya que no hay dependencias externas en runtime.

---

## UX y microinteracciones recomendadas

* Modo oscuro por defecto con toggle a claro.
* Micro-animaciones CSS en botones al confirmar acciones.
* Toasts para confirmaciones y Undo para borrados. Tiempo visible 4 segundos.
* Badges XP pequeños junto a hábitos y budgets.
* Partículas sutiles o pixel accent en header cuando se completa un objetivo importante. Mantener discreto.
* Large touch targets, focus states visibles y etiquetas ARIA para controles críticos.
* Auto-save en editor de notas y drafts temporales.
* Confirmación para acciones destructivas y posibilidad de deshacer.

---

## Accessibilidad mínima

* Navegación por teclado: tab order lógico, botones con `role="button"` si no son `button`.
* ARIA labels en modales y formularios.
* Contrastes altos y tamaños de fuente legibles en móvil.
* Etiquetas visibles y placeholders útiles.

---

## Estructura de archivos propuesta

* `index.html`
* `styles.css` (o uso CDN Tailwind v3 con un archivo para utilidades)
* `app.js` entrada principal que inicializa store y rutas internas
* `store.js` utilidades de localStorage y seed data
* `components/` con archivos por pantalla o por componente: `dashboard.js`, `tasks.js`, `budgets.js`, `notes.js`, `habits.js`, `settings.js`
* `utils/` funciones puras testables: `date.js`, `id.js`, `parserMarkdown.js`
* `assets/` iconos SVG inline o sprite
* `README.md` con instrucciones

---

## README mínimo para el repo

* Título y descripción breve.
* Requisitos: ningún servidor necesario, abrir `index.html` en navegador moderno. Recomendar Chrome/Firefox.
* Cómo usar: abrir, importar/exportar, seed data.
* Lista de archivos.
* Nota: Tailwind v3 usado vía CDN o build, indicar la opción elegida.
* Checklist de pruebas manuales.

---

## Checklist de pruebas mínima (unit style / acceptance)

Para cada entidad: tasks, budgets, notes, habits

* Crear un nuevo item y verificar aparece en lista.
* Editar item y verificar persistencia en reload.
* Borrar item, ver toast y poder deshacer.
* Verificar export genera JSON con la entidad.
* Importar JSON válido y comprobar merge o reemplazo.
* Para budgets: crear transacción y ver cálculos correctos.
* Para habits: check-in diario, streak incrementa y se muestra XP.
* Para notes: editar markdown y ver preview fiel.
* Offline: recargar con modo avión y confirmar la app carga y funciona con datos de localStorage.

---

## Seed data sugerida

**Se incluyen ejemplos que demuestren funcionalidades:** un presupuesto personal, 3 tareas con prioridades y subtareas, 2 notas de ejemplo y una colección de hábitos basados en la rutina que proporcionaste. Esto ayuda a ver el layout desde la primera carga.

---

## Prioridad mínima para la primera versión usable

1. Renderizado y store básico con persistencia.
2. Tasks CRUD con persistencia y undo delete.
3. Notes CRUD con markdown preview.
4. Habits CRUD con check-in y streak.
5. Budgets CRUD con transacciones y vista resumen.
6. Export/import y settings.
