import { escapeHtml, html, raw } from "../../utils/html.js"
import { tagInputTemplate } from "../../components/tagInput.js"

export { html, raw }

const PRIORITY_COLORS = {
  high: "text-xp-danger",
  medium: "text-xp-warning",
  low: "text-gray-400"
}

const PRIORITY_ICONS = {
  high: "🔴",
  medium: "🟡",
  low: "⚪"
}

function tagsHtml(tags) {
  if (!tags || tags.length === 0) return ""
  return tags
    .map(
      tag =>
        `<span class="px-2 py-0.5 text-xs rounded-full bg-xp-primary/10 text-xp-primary">${escapeHtml(tag)}</span>`
    )
    .join("")
}

function subtasksHtml(subtasks) {
  if (!subtasks || subtasks.length === 0) return ""
  const done = subtasks.filter(s => s.done).length
  const pct = Math.round((done / subtasks.length) * 100)
  return `
    <div class="mt-2">
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Subtareas ${done}/${subtasks.length}</span>
        <span>${pct}%</span>
      </div>
      <div class="w-full h-1 bg-gray-200 dark:bg-xp-darker rounded-full overflow-hidden">
        <div class="h-full bg-xp-primary transition-all duration-300" style="width: ${pct}%"></div>
      </div>
    </div>
  `
}

const CHECK_SVG =
  '<svg class="w-3 h-3 text-xp-darker" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>' +
  "</svg>"

export function taskCardTemplate(task, i18n) {
  const priorityColor = PRIORITY_COLORS[task.priority] || "text-gray-400"
  const priorityIcon = PRIORITY_ICONS[task.priority] || "⚪"
  const doneClass = task.done ? "opacity-60" : ""
  const titleClass = task.done
    ? "line-through text-gray-400 dark:text-gray-500"
    : "text-gray-900 dark:text-gray-100"

  return html`
    <div
      class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20 ${doneClass}"
      draggable="true"
      data-task-id="${task.id}"
    >
      <div class="flex items-start gap-3">
        <button
          data-action="toggle-task"
          data-task-id="${task.id}"
          class="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 ${task.done ? "bg-xp-primary border-xp-primary" : "border-gray-300 dark:border-gray-600"} flex items-center justify-center transition-colors"
          aria-label="${i18n?.getMessage("accessibility.markTaskDone", { task: task.title }) || "Toggle task"}"
        >
          ${task.done ? raw(CHECK_SVG) : ""}
        </button>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="${priorityColor}" title="${task.priority}"
              >${priorityIcon}</span
            >
            <span class="font-semibold truncate ${titleClass}"
              >${task.title}</span
            >
          </div>

          ${
            task.description
              ? raw(
                  html`<p
                    class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2"
                  >
                    ${task.description}
                  </p>`
                )
              : ""
          }
          ${
            task.dueDate
              ? raw(
                  html`<div
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2"
                  >
                    📅 ${task.dueDate}
                  </div>`
                )
              : ""
          }

          <div class="flex flex-wrap gap-1 mb-2">
            ${raw(tagsHtml(task.tags))}
          </div>

          ${raw(subtasksHtml(task.subtasks))}
        </div>

        <div class="flex gap-1 flex-shrink-0">
          <button
            data-action="edit-task"
            data-task-id="${task.id}"
            class="p-1.5 text-gray-400 hover:text-xp-primary transition-colors rounded"
            aria-label="${i18n?.getMessage("app.screens.tasks.action.edit") || "Edit"}"
          >
            ✏️
          </button>
          <button
            data-action="delete-task"
            data-task-id="${task.id}"
            class="p-1.5 text-gray-400 hover:text-xp-danger transition-colors rounded"
            aria-label="${i18n?.getMessage("app.screens.tasks.action.delete") || "Delete"}"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  `
}

export function emptyTasksTemplate(filter, i18n) {
  const messages = {
    all:
      i18n?.getMessage("app.screens.tasks.noTasks") ||
      "No hay tareas. ¡Creá tu primera!",
    today:
      i18n?.getMessage("app.screens.tasks.noTasks") || "Sin tareas para hoy.",
    high:
      i18n?.getMessage("app.screens.tasks.noTasks") ||
      "No hay tareas de alta prioridad.",
    completed:
      i18n?.getMessage("app.screens.tasks.noTasks") ||
      "Aún no completaste ninguna tarea."
  }

  const icons = { all: "📋", today: "📅", high: "🔴", completed: "✅" }

  return html`
    <div class="text-center py-12">
      <div class="text-6xl mb-4">${icons[filter] || "📋"}</div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        ${messages[filter] || messages.all}
      </p>
      ${
        filter === "all"
          ? raw(
              html`<button
                data-action="create-task"
                class="px-6 py-3 bg-xp-primary text-xp-darker font-bold rounded-lg hover:bg-xp-primary/80 transition-colors"
              >
                ${
                  i18n?.getMessage("app.screens.tasks.newButton") ||
                  "Crear Tarea"
                }
              </button>`
            )
          : ""
      }
    </div>
  `
}

export function taskListTemplate(tasks, filter, i18n) {
  if (tasks.length === 0) {
    return emptyTasksTemplate(filter, i18n)
  }

  const cards = tasks.map(task => taskCardTemplate(task, i18n)).join("")

  return html` <div class="space-y-3">${raw(cards)}</div> `
}

export function createTaskModalTemplate(i18n) {
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.tasks.modal.create.title") || "Nueva Tarea"}
      </h3>
      <form id="create-task-form">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.create.titleLabel") || "Título"}
              *
            </label>
            <input
              type="text"
              name="title"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage("app.screens.tasks.modal.create.titlePlaceholder") || "ej., Terminar el informe"}"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.create.description") || "Descripción"}
            </label>
            <textarea
              name="description"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary resize-none"
              placeholder="${i18n?.getMessage("app.screens.tasks.modal.create.descriptionPlaceholder") || "Descripción opcional..."}"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2">
                ${i18n?.getMessage("app.screens.tasks.modal.create.dueDate") || "Fecha límite"}
              </label>
              <input
                type="date"
                name="dueDate"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">
                ${i18n?.getMessage("app.screens.tasks.modal.create.priority") || "Prioridad"}
              </label>
              <select
                name="priority"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              >
                <option value="low">
                  ${i18n?.getMessage("app.screens.tasks.priority.low") || "Baja"}
                </option>
                <option value="medium" selected>
                  ${i18n?.getMessage("app.screens.tasks.priority.medium") || "Media"}
                </option>
                <option value="high">
                  ${i18n?.getMessage("app.screens.tasks.priority.high") || "Alta"}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.create.tags") || "Etiquetas"}
            </label>
            <div id="task-tags-input-container">
              ${raw(
                tagInputTemplate({
                  id: "task-tags-widget",
                  name: "tags",
                  initialTags: [],
                  i18n
                })
              )}
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("ui.common.cancel") || "Cancelar"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("app.screens.tasks.modal.create.create") || "Crear"}
          </button>
        </div>
      </form>
    </div>
  `
}

export function editTaskModalTemplate(task, i18n) {
  const subtaskItemsHtml = task.subtasks
    .map(
      s => `
    <div class="flex items-center gap-2 py-1">
      <button
        data-action="toggle-subtask"
        data-subtask-id="${escapeHtml(s.id)}"
        class="w-4 h-4 rounded border-2 flex-shrink-0 ${s.done ? "bg-xp-primary border-xp-primary" : "border-gray-300 dark:border-gray-600"} transition-colors"
      ></button>
      <span class="flex-1 text-sm ${s.done ? "line-through text-gray-400" : ""}">${escapeHtml(s.text)}</span>
      <button
        data-action="remove-subtask"
        data-subtask-id="${escapeHtml(s.id)}"
        class="text-gray-400 hover:text-xp-danger transition-colors text-xs"
      >✕</button>
    </div>
  `
    )
    .join("")

  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.tasks.modal.edit.title") || "Editar Tarea"}
      </h3>
      <form id="edit-task-form">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.create.titleLabel") || "Título"}
              *
            </label>
            <input
              type="text"
              name="title"
              required
              value="${task.title}"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.create.description") || "Descripción"}
            </label>
            <textarea
              name="description"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary resize-none"
            >
${task.description}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2">
                ${i18n?.getMessage("app.screens.tasks.modal.create.dueDate") || "Fecha límite"}
              </label>
              <input
                type="date"
                name="dueDate"
                value="${task.dueDate}"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">
                ${i18n?.getMessage("app.screens.tasks.modal.create.priority") || "Prioridad"}
              </label>
              <select
                name="priority"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              >
                <option
                  value="low"
                  ${task.priority === "low" ? "selected" : ""}
                >
                  ${i18n?.getMessage("app.screens.tasks.priority.low") || "Baja"}
                </option>
                <option
                  value="medium"
                  ${task.priority === "medium" ? "selected" : ""}
                >
                  ${i18n?.getMessage("app.screens.tasks.priority.medium") || "Media"}
                </option>
                <option
                  value="high"
                  ${task.priority === "high" ? "selected" : ""}
                >
                  ${i18n?.getMessage("app.screens.tasks.priority.high") || "Alta"}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.create.tags") || "Etiquetas"}
            </label>
            <div id="task-tags-input-container">
              ${raw(
                tagInputTemplate({
                  id: "task-tags-widget",
                  name: "tags",
                  initialTags: task.tags,
                  i18n
                })
              )}
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.tasks.modal.edit.subtasks") || "Subtareas"}
            </label>
            <div
              id="subtask-list"
              class="space-y-1 mb-2 max-h-40 overflow-y-auto"
            >
              ${raw(subtaskItemsHtml)}
            </div>
            <div class="flex gap-2">
              <input
                type="text"
                id="new-subtask-input"
                class="flex-1 px-3 py-1.5 text-sm rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                placeholder="${i18n?.getMessage("app.screens.tasks.modal.edit.subtaskPlaceholder") || "Nueva subtarea..."}"
              />
              <button
                type="button"
                id="add-subtask-btn"
                class="px-3 py-1.5 text-sm bg-xp-primary/20 text-xp-primary rounded-lg hover:bg-xp-primary/30 transition-colors"
              >
                ${i18n?.getMessage("app.screens.tasks.modal.edit.addSubtask") || "+ Agregar"}
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("ui.common.cancel") || "Cancelar"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("app.screens.tasks.modal.edit.update") || "Guardar"}
          </button>
        </div>
      </form>
    </div>
  `
}
