import { escapeHtml, html, raw } from "../../utils/html.js"
import { getRelativeTime } from "../../utils/date.js"

export { html, raw }

const PRIORITY_ICONS = { high: "🔴", medium: "🟡", low: "🟢" }

export function mitItemTemplate(task) {
  const icon = PRIORITY_ICONS[task.priority] || "🟡"
  const tagsHtml = (task.tags || [])
    .map(
      tag =>
        html`<span
          class="px-1.5 py-0.5 text-xs rounded bg-xp-primary/20 text-xp-primary"
          >${tag}</span
        >`
    )
    .join("")

  return html`
    <div
      class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-xp-darker rounded-lg"
    >
      <input
        type="checkbox"
        ${task.done ? "checked" : ""}
        data-action="toggle-task"
        data-task-id="${task.id}"
        class="mt-0.5 accent-xp-primary"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-sm">${icon}</span>
          <span
            class="font-medium text-sm ${task.done ? "line-through text-gray-400" : ""}"
            >${task.title}</span
          >
        </div>
        ${
          tagsHtml
            ? raw(`<div class="flex flex-wrap gap-1 mt-1">${tagsHtml}</div>`)
            : ""
        }
      </div>
    </div>
  `
}

export function habitItemTemplate(habit, todayStr) {
  const completed = habit.dailyRecords?.[todayStr] === true
  return html`
    <div
      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg"
    >
      <div class="flex items-center gap-2">
        <button
          data-action="toggle-habit"
          data-habit-id="${habit.id}"
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${completed ? "bg-xp-primary border-xp-primary" : "border-gray-400 dark:border-gray-600"}"
          aria-label="${completed ? "Desmarcar" : "Marcar"} hábito"
        >
          ${
            completed
              ? raw('<span class="text-xp-darker text-xs font-bold">✓</span>')
              : ""
          }
        </button>
        <span
          class="text-sm font-medium ${completed ? "line-through text-gray-400" : ""}"
          >${habit.title}</span
        >
      </div>
      <span class="text-xs text-gray-500">🔥 ${habit.streak || 0}</span>
    </div>
  `
}

export function activityItemTemplate(item, i18n) {
  const icon = item.type === "note" ? "📝" : "✅"
  const relTime = getRelativeTime(item.updatedAt || item.createdAt, i18n)
  return html`
    <div
      class="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-xp-primary/10 last:border-0"
    >
      <span class="text-lg">${icon}</span>
      <span class="flex-1 text-sm truncate">${item.title}</span>
      <span class="text-xs text-gray-500 shrink-0">${relTime}</span>
    </div>
  `
}

export function emptyMITsTemplate() {
  return `
    <div class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
      ✅ Sin tareas urgentes hoy
    </div>
  `
}

export function emptyHabitsTemplate() {
  return `
    <div class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
      ⚡ No hay hábitos registrados aún
    </div>
  `
}

export function emptyActivityTemplate() {
  return `
    <div class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
      Sin actividad reciente
    </div>
  `
}
