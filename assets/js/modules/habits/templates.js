import { escapeHtml } from "../../utils/html.js"

export function html(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i]
    if (value === undefined || value === null) {
      return result + string
    }
    if (typeof value === "string") {
      return result + string + escapeHtml(value)
    }
    return result + string + String(value)
  }, "")
}

export const HABIT_TEMPLATES = [
  {
    title: "🌅 Despertar sin snooze",
    description: "Despertar a la hora objetivo sin tocar snooze",
    color: "#fbbf24"
  },
  {
    title: "💧 Hidratarse (500ml agua)",
    description: "Beber 500ml de agua con limón al despertar",
    color: "#60a5fa"
  },
  {
    title: "🧘 Meditación estoica (10 min)",
    description: "Meditación matutina y diario",
    color: "#a78bfa"
  },
  {
    title: "🏃 Rutina de movilidad",
    description: "15-20 minutos de estiramientos y calistenia",
    color: "#34d399"
  },
  {
    title: "⭐ Definir 3 MITs",
    description: "Planificar las 3 tareas más importantes en el desayuno",
    color: "#fbbf24"
  },
  {
    title: "🎯 Completar primer bloque de trabajo profundo",
    description: "Sesión de trabajo enfocada de 60 minutos",
    color: "#00ff88"
  },
  {
    title: "📚 Bloque de aprendizaje (30-45 min)",
    description: "Tiempo dedicado a aprender nuevas habilidades",
    color: "#f472b6"
  },
  {
    title: "📝 Revisión de fin de día",
    description: "Revisar logros y planear mañana",
    color: "#94a3b8"
  },
  {
    title: "🌙 Atardecer digital (6 PM)",
    description: "Desconectarse de pantallas a las 6 PM",
    color: "#818cf8"
  },
  {
    title: "😴 Preparación para dormir (9 PM)",
    description: "Iniciar rutina de sueño, dormir a las 11 PM",
    color: "#6366f1"
  }
]

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"]

export function habitCardTemplate(habit, i18n) {
  const weekRecords = habit.getWeekRecords()
  const isToday = habit.isCompletedToday()
  const toggleLabel = isToday
    ? i18n?.getMessage("app.screens.habits.markIncomplete") || "Desmarcar"
    : i18n?.getMessage("app.screens.habits.markComplete") || "Completar"

  const weekDots = weekRecords
    .map(
      (record, idx) => html`
        <div class="flex flex-col items-center gap-1">
          <span class="text-xs text-gray-400">${DAY_LABELS[idx % 7]}</span>
          <div
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              record.completed
                ? "border-transparent"
                : "border-gray-300 dark:border-xp-primary/20 bg-transparent"
            }"
            style="${record.completed ? `background-color: ${habit.color}` : ""}"
          >
            ${record.completed ? html`<span class="text-xs text-xp-darker font-bold">✓</span>` : ""}
          </div>
        </div>
      `
    )
    .join("")

  return html`
    <div
      class="bg-white dark:bg-xp-card rounded-xl p-5 border-2 border-gray-200 dark:border-xp-primary/20"
    >
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-bold truncate">${habit.title}</h3>
          ${habit.description ? html`<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">${habit.description}</p>` : ""}
        </div>
        <button
          data-action="delete-habit"
          data-habit-id="${habit.id}"
          class="ml-3 p-1.5 text-gray-400 hover:text-xp-danger transition-colors flex-shrink-0"
          aria-label="${i18n?.getMessage("ui.common.delete") || "Eliminar"}"
        >
          ✕
        </button>
      </div>

      <div class="flex items-center gap-2 mb-4">
        <span class="text-xp-warning">🔥</span>
        <span class="text-sm font-semibold"
          >${habit.streak}
          ${i18n?.getMessage("app.screens.habits.streak") || "días seguidos"}</span
        >
        <div
          class="w-2 h-2 rounded-full ml-auto flex-shrink-0"
          style="background-color: ${habit.color}"
        ></div>
      </div>

      <div class="flex justify-between mb-4">${weekDots}</div>

      <button
        data-action="toggle-habit"
        data-habit-id="${habit.id}"
        class="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
          isToday
            ? "text-xp-darker"
            : "border-2 border-gray-200 dark:border-xp-primary/20 hover:border-xp-primary dark:hover:border-xp-primary"
        }"
        style="${isToday ? `background-color: ${habit.color}` : ""}"
      >
        ${toggleLabel}
      </button>
    </div>
  `
}

export function habitListTemplate(habits, i18n) {
  if (habits.length === 0) {
    return emptyHabitsTemplate(i18n)
  }

  const cards = habits.map(h => habitCardTemplate(h, i18n)).join("")
  return html`
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${cards}
    </div>
  `
}

export function emptyHabitsTemplate(i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">🌱</div>
      <h3 class="text-xl font-bold mb-2">
        ${i18n?.getMessage("app.screens.habits.empty.title") || "¡No hay hábitos aún!"}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        ${i18n?.getMessage("app.screens.habits.empty.description") || "Empezá con un hábito simple y construí desde ahí."}
      </p>
      <button
        data-action="create-habit"
        class="px-6 py-3 bg-xp-primary text-xp-darker font-bold rounded-lg hover:bg-xp-primary/80 transition-colors"
      >
        ${i18n?.getMessage("app.screens.habits.empty.action") || "Agregar Hábito"}
      </button>
    </div>
  `
}

export function habitTemplatesModalTemplate(i18n) {
  const templateCards = HABIT_TEMPLATES.map(
    t => html`
      <button
        data-action="use-template"
        data-title="${t.title}"
        data-description="${t.description}"
        data-color="${t.color}"
        class="text-left p-3 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 hover:border-xp-primary transition-colors"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            style="background-color: ${t.color}"
          ></div>
          <span class="font-semibold text-sm">${t.title}</span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-5">
          ${t.description}
        </p>
      </button>
    `
  ).join("")

  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.habits.modal.add.title") || "Agregar Hábito"}
      </h3>

      <div class="mb-6">
        <h4
          class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3"
        >
          ${i18n?.getMessage("app.screens.habits.templates.title") || "Plantillas"}
        </h4>
        <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
          ${templateCards}
        </div>
      </div>

      <div>
        <h4
          class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3"
        >
          ${i18n?.getMessage("app.screens.habits.templates.custom") || "Hábito personalizado"}
        </h4>
        <form id="create-habit-form" class="space-y-3">
          <div>
            <label class="block text-sm font-semibold mb-1">
              ${i18n?.getMessage("app.screens.habits.modal.add.titleLabel") || "Título *"}
            </label>
            <input
              type="text"
              name="title"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage("app.screens.habits.modal.add.titlePlaceholder") || "ej., Leer 20 minutos"}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">
              ${i18n?.getMessage("app.screens.habits.modal.add.description") || "Descripción"}
            </label>
            <input
              type="text"
              name="description"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage("app.screens.habits.modal.add.descriptionPlaceholder") || "Opcional"}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">
              ${i18n?.getMessage("app.screens.habits.modal.add.colorLabel") || "Color"}
            </label>
            <input
              type="color"
              name="color"
              value="#00ff88"
              class="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div class="flex gap-3 pt-2">
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
              ${i18n?.getMessage("app.screens.habits.modal.add.create") || "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}
