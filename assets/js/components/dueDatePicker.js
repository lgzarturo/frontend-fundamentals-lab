/**
 * Componente DueDatePicker reutilizable para selección de fechas de tareas.
 * Incluye botones de acceso rápido (Hoy, Mañana, +7 días, Sin fecha) y
 * badges descriptivos de estado relativo (Vence hoy, Vencida, etc.).
 */
import { escapeHtml } from "../utils/html.js"
import { formatDate, getTodayString } from "../utils/date.js"

export function getTomorrowString() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDate(tomorrow)
}

export function getNextWeekString() {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return formatDate(nextWeek)
}

/**
 * Calcula la información y formato del estado relativo de una fecha
 * @param {string} dateString - Cadena de fecha YYYY-MM-DD
 * @param {Object} [i18n=null] - Servicio de internacionalización
 * @returns {{ text: string, className: string, icon: string }}
 */
export function getDueDateStatus(dateString, i18n = null) {
  if (!dateString || !dateString.trim()) {
    return {
      text:
        i18n?.getMessage("app.screens.tasks.datePicker.noDate") ||
        "Sin fecha límite",
      className: "text-gray-400 dark:text-gray-500",
      icon: "⚪"
    }
  }

  const todayStr = getTodayString()
  if (dateString === todayStr) {
    return {
      text:
        i18n?.getMessage("app.screens.tasks.datePicker.dueToday") ||
        "Vence hoy",
      className:
        "text-xp-primary font-semibold bg-xp-primary/10 px-2 py-0.5 rounded-full border border-xp-primary/20",
      icon: "⚡"
    }
  }

  const tomorrowStr = getTomorrowString()
  if (dateString === tomorrowStr) {
    return {
      text:
        i18n?.getMessage("app.screens.tasks.datePicker.dueTomorrow") ||
        "Vence mañana",
      className:
        "text-blue-500 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20",
      icon: "🌅"
    }
  }

  // Parse como fecha local para calcular diferencia en días
  const [year, month, day] = dateString.split("-").map(Number)
  const targetDate = new Date(year, month - 1, day)
  const now = new Date()
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffMs = targetDate.getTime() - todayDate.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays)
    const overdueMsg =
      daysAgo === 1
        ? i18n?.getMessage("app.screens.tasks.datePicker.overdueYesterday") ||
          "Vencida ayer"
        : i18n?.t("app.screens.tasks.datePicker.overdue", {
            days: daysAgo
          }) || `Vencida hace ${daysAgo} días`

    return {
      text: overdueMsg,
      className:
        "text-xp-danger font-semibold bg-xp-danger/10 px-2 py-0.5 rounded-full border border-xp-danger/20",
      icon: "⚠️"
    }
  }

  const dueInMsg =
    i18n?.t("app.screens.tasks.datePicker.dueInDays", {
      days: diffDays
    }) || `Vence en ${diffDays} días`

  return {
    text: dueInMsg,
    className:
      "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-xp-darker px-2 py-0.5 rounded-full border border-gray-200 dark:border-xp-primary/20",
    icon: "📅"
  }
}

/**
 * Plantilla HTML para renderizar el componente DueDatePicker
 * @param {Object} options
 * @returns {string} HTML string
 */
export function dueDatePickerTemplate({
  id = "due-date-picker",
  name = "dueDate",
  value = "",
  i18n = null
} = {}) {
  const status = getDueDateStatus(value, i18n)
  const todayStr = getTodayString()
  const tomorrowStr = getTomorrowString()
  const nextWeekStr = getNextWeekString()

  const todayLabel =
    i18n?.getMessage("app.screens.tasks.datePicker.today") || "Hoy"
  const tomorrowLabel =
    i18n?.getMessage("app.screens.tasks.datePicker.tomorrow") || "Mañana"
  const nextWeekLabel =
    i18n?.getMessage("app.screens.tasks.datePicker.nextWeek") || "+7 días"
  const clearLabel =
    i18n?.getMessage("app.screens.tasks.datePicker.clear") || "Sin fecha"

  const isToday = value === todayStr
  const isTomorrow = value === tomorrowStr
  const isNextWeek = value === nextWeekStr
  const isCleared = !value

  const chipBaseClass =
    "btn-compact px-2.5 py-1 text-xs rounded-lg font-medium transition-all border cursor-pointer select-none"
  const chipActiveClass =
    "bg-xp-primary text-xp-darker border-xp-primary font-bold shadow-sm"
  const chipInactiveClass =
    "bg-gray-100 dark:bg-xp-darker text-gray-700 dark:text-gray-300 border-gray-200 dark:border-xp-primary/20 hover:border-xp-primary hover:text-xp-primary"

  return `
    <div id="${escapeHtml(id)}" class="due-date-picker-widget space-y-2">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          data-date-preset="today"
          class="${chipBaseClass} ${isToday ? chipActiveClass : chipInactiveClass}"
          title="${todayLabel} (${todayStr})"
        >
          📅 ${todayLabel}
        </button>
        <button
          type="button"
          data-date-preset="tomorrow"
          class="${chipBaseClass} ${isTomorrow ? chipActiveClass : chipInactiveClass}"
          title="${tomorrowLabel} (${tomorrowStr})"
        >
          🌅 ${tomorrowLabel}
        </button>
        <button
          type="button"
          data-date-preset="next-week"
          class="${chipBaseClass} ${isNextWeek ? chipActiveClass : chipInactiveClass}"
          title="${nextWeekLabel} (${nextWeekStr})"
        >
          📆 ${nextWeekLabel}
        </button>
        <button
          type="button"
          data-date-preset="clear"
          class="${chipBaseClass} ${isCleared ? chipActiveClass : chipInactiveClass}"
          title="${clearLabel}"
        >
          ✕ ${clearLabel}
        </button>
      </div>

      <div class="relative">
        <input
          type="date"
          name="${escapeHtml(name)}"
          id="${escapeHtml(id)}-input"
          value="${escapeHtml(value || "")}"
          class="due-date-input w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker text-gray-900 dark:text-gray-100 focus:outline-none focus:border-xp-primary transition-colors text-sm"
        />
      </div>

      <div
        id="${escapeHtml(id)}-status"
        class="due-date-status flex items-center gap-1 text-xs"
      >
        <span class="${status.className} inline-flex items-center gap-1">
          <span>${status.icon}</span>
          <span class="status-text">${escapeHtml(status.text)}</span>
        </span>
      </div>
    </div>
  `
}

/**
 * Controlador de comportamiento para DueDatePicker
 */
export class DueDatePicker {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Contenedor raíz del widget
   * @param {string} [options.initialDate=""] - Fecha inicial YYYY-MM-DD
   * @param {string} [options.name="dueDate"] - Nombre del campo de entrada
   * @param {Object} [options.i18n=null] - Servicio de traducción
   * @param {Function} [options.onChange=null] - Callback al cambiar la fecha
   */
  constructor({
    container,
    initialDate = "",
    name = "dueDate",
    i18n = null,
    onChange = null
  }) {
    if (!container) {
      throw new Error("DueDatePicker requires a valid container element")
    }

    this.container = container
    this.name = name
    this.i18n = i18n
    this.onChange = onChange
    this.currentDate = initialDate || ""

    this._init()
  }

  _init() {
    this.input = this.container.querySelector('input[type="date"]')
    this.statusContainer = this.container.querySelector(".due-date-status")
    this.presetButtons = this.container.querySelectorAll("[data-date-preset]")

    if (this.input && !this.input.value && this.currentDate) {
      this.input.value = this.currentDate
    }

    this._handlePresetClick = this._handlePresetClick.bind(this)
    this._handleInputChange = this._handleInputChange.bind(this)

    this.container.addEventListener("click", this._handlePresetClick)
    if (this.input) {
      this.input.addEventListener("input", this._handleInputChange)
      this.input.addEventListener("change", this._handleInputChange)
    }

    this._updateUI(this.getDate())
  }

  _handlePresetClick(e) {
    const presetBtn = e.target.closest("[data-date-preset]")
    if (!presetBtn) return

    e.preventDefault()
    e.stopPropagation()

    const preset = presetBtn.dataset.datePreset
    let targetDate = ""

    switch (preset) {
      case "today":
        targetDate = getTodayString()
        break
      case "tomorrow":
        targetDate = getTomorrowString()
        break
      case "next-week":
        targetDate = getNextWeekString()
        break
      case "clear":
        targetDate = ""
        break
    }

    this.setDate(targetDate)
  }

  _handleInputChange() {
    const val = this.input ? this.input.value : ""
    this.currentDate = val
    this._updateUI(val)
    if (typeof this.onChange === "function") {
      this.onChange(val)
    }
  }

  _updateUI(val) {
    const status = getDueDateStatus(val, this.i18n)

    if (this.statusContainer) {
      this.statusContainer.innerHTML = `
        <span class="${status.className} inline-flex items-center gap-1">
          <span>${status.icon}</span>
          <span class="status-text">${escapeHtml(status.text)}</span>
        </span>
      `
    }

    const todayStr = getTodayString()
    const tomorrowStr = getTomorrowString()
    const nextWeekStr = getNextWeekString()

    this.presetButtons.forEach(btn => {
      const preset = btn.dataset.datePreset
      const isActive =
        (preset === "today" && val === todayStr) ||
        (preset === "tomorrow" && val === tomorrowStr) ||
        (preset === "next-week" && val === nextWeekStr) ||
        (preset === "clear" && !val)

      btn.classList.toggle("bg-xp-primary", isActive)
      btn.classList.toggle("text-xp-darker", isActive)
      btn.classList.toggle("border-xp-primary", isActive)
      btn.classList.toggle("font-bold", isActive)
      btn.classList.toggle("shadow-sm", isActive)

      btn.classList.toggle("bg-gray-100", !isActive)
      btn.classList.toggle("dark:bg-xp-darker", !isActive)
      btn.classList.toggle("text-gray-700", !isActive)
      btn.classList.toggle("dark:text-gray-300", !isActive)
    })
  }

  getDate() {
    return this.input ? this.input.value : this.currentDate
  }

  setDate(dateStr) {
    this.currentDate = dateStr || ""
    if (this.input) {
      this.input.value = this.currentDate
    }
    this._updateUI(this.currentDate)
    if (typeof this.onChange === "function") {
      this.onChange(this.currentDate)
    }
  }

  destroy() {
    this.container.removeEventListener("click", this._handlePresetClick)
    if (this.input) {
      this.input.removeEventListener("input", this._handleInputChange)
      this.input.removeEventListener("change", this._handleInputChange)
    }
  }
}
