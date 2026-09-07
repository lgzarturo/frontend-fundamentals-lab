/**
 * Main Application Core - Es la orquesta de todos los módulos
 */

import { BudgetsModule } from "../modules/budgets/index.js"
import { TasksModule } from "../modules/tasks/index.js"
import { HabitsModule } from "../modules/habits/index.js"
import { NotesModule } from "../modules/notes/index.js"
import { HomeModule } from "../modules/home/index.js"
import { StorageService } from "../services/storage.js"
import { EventBus } from "./eventBus.js"
import { launchConfetti } from "../utils/confetti.js"
import { demoData } from "../data/demoData.js"
import { VisitTracker } from "../services/visitTracker.js"
import { analytics } from "../analytics.js"
import {
  shareModalTemplate,
  bindShareModalEvents
} from "../components/shareModal.js"

export class DOSApp {
  constructor() {
    this.storage = new StorageService()
    this.eventBus = new EventBus()
    this.i18n = null // Se inyecta desde main.js antes de init()
    this.modules = {}
    this.currentScreen = "home"
    this.visitTracker = null
    this.visitStats = null
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    // Inicializa el almacenamiento y migra datos antiguos
    this.storage.init()

    // Conecta el servicio de analíticas y eventos de uso
    analytics.connectEventBus(this.eventBus)

    // Enlaza el modal centralizado
    this._bindModalEvents()

    // Inicializa los módulos
    this._initModules()

    // Enlaza eventos globales
    this._bindGlobalEvents()

    // Navega a la pantalla inicial
    this.navigateTo(this._getInitialScreen())

    // Contador inteligente de visitas y rachas
    this._visitCounter()

    // Fecha en el header
    this.updateDateTime()

    console.log("DOSApp initialized")
  }

  /**
   * Inicializa todos los módulos
   * @private
   */
  _initModules() {
    // Módulo de presupuestos
    this.modules.budgets = new BudgetsModule(
      this.storage,
      this.eventBus,
      this.i18n
    )
    this.modules.budgets.init()

    // Módulo de tareas
    this.modules.tasks = new TasksModule(this.storage, this.eventBus, this.i18n)
    this.modules.tasks.init()

    // Módulo de hábitos
    this.modules.habits = new HabitsModule(
      this.storage,
      this.eventBus,
      this.i18n
    )
    this.modules.habits.init()

    // Módulo de notas
    this.modules.notes = new NotesModule(this.storage, this.eventBus, this.i18n)
    this.modules.notes.init()

    // Módulo de inicio (dashboard)
    this.modules.home = new HomeModule(this.storage, this.eventBus, this.i18n)
    this.modules.home.init()
  }

  /**
   * Recarga los datos de todos los módulos desde el almacenamiento
   * y re-renderiza la pantalla actual sin duplicar listeners
   * @private
   */
  _reloadModules() {
    Object.values(this.modules).forEach(module => {
      if (typeof module.reload === "function") module.reload()
    })
    this._renderScreen(this.currentScreen)
  }

  /**
   * Enlaza eventos globales
   * @private
   */
  _bindGlobalEvents() {
    // Notificaciones toast
    this.eventBus.on("toast:show", ({ message, type = "info" }) => {
      this.showToast(message, type)
    })

    // Eventos de modal
    this.eventBus.on("modal:open", ({ contentHtml }) => {
      this.showModal(contentHtml)
    })

    this.eventBus.on("modal:close", () => {
      this.closeModal()
    })

    // Eventos de cambio de pantalla
    this.eventBus.on("screen:change", ({ screen }) => {
      this.navigateTo(screen)
    })

    // Toast con opción de deshacer
    this.eventBus.on("undo:show", ({ message, undoCallback }) => {
      this.showUndoToast(message, undoCallback)
    })

    // Confeti cuando todos los hábitos del día están completos
    this.eventBus.on("habit:allCompleted", () => {
      launchConfetti()
    })

    // Cambio de idioma: actualiza fecha y re-renderiza la pantalla actual
    this.eventBus.on("i18n:languageChanged", () => {
      this.updateDateTime()
      this._renderScreen(this.currentScreen)
    })

    // Evento para abrir modal de compartir
    this.eventBus.on("share:open", () => {
      this.openShareModal()
    })
  }

  /**
   * Actualiza la fecha mostrada en el header según el idioma activo
   */
  updateDateTime() {
    const now = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
    const language = localStorage.getItem("userLanguage") || "es"
    const locale = language === "es" ? "es-ES" : "en-US"
    const dateEl = document.getElementById("current-date")
    if (dateEl) dateEl.textContent = now.toLocaleDateString(locale, options)
  }

  /**
   * Obtiene la pantalla inicial del almacenamiento o la predeterminada
   * @private
   */
  _getInitialScreen() {
    return localStorage.getItem("currentScreen") || "home"
  }

  /**
   * Navega a una pantalla
   * @param {string} screen - Nombre de la pantalla
   */
  navigateTo(screen) {
    this.currentScreen = screen
    localStorage.setItem("currentScreen", screen)

    // Oculta todas las pantallas
    document.querySelectorAll(".screen").forEach(s => {
      s.classList.remove("active")
    })

    // Muestra la pantalla objetivo
    const screenEl = document.getElementById(`${screen}-screen`)
    if (screenEl) {
      screenEl.classList.add("active")
    }

    // Actualiza la navegación
    this._updateNavigation(screen)

    // Renderiza el contenido del módulo
    this._renderScreen(screen)
  }

  /**
   * Actualiza la navegación
   * @private
   */
  _updateNavigation(activeScreen) {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      const isActive = btn.dataset.screen === activeScreen
      if (isActive) {
        btn.classList.add("bg-xp-primary", "text-xp-darker")
        btn.classList.remove("bg-gray-200", "text-gray-700")
      } else {
        btn.classList.remove("bg-xp-primary", "text-xp-darker")
        btn.classList.add("bg-gray-200", "text-gray-700")
      }
    })
  }

  /**
   * Renderiza el contenido de la pantalla actual
   * @private
   */
  _renderScreen(screen) {
    switch (screen) {
      case "home":
        this.modules.home?.render()
        break
      case "budgets":
        this.modules.budgets?.render()
        break
      case "tasks":
        this.modules.tasks?.render()
        break
      case "habits":
        this.modules.habits?.render()
        break
      case "notes":
        this.modules.notes?.render()
        break
      case "settings":
        this.loadTheme()
        break
    }
  }

  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de toast (info, success, error)
   */
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container")
    if (!container) return

    const toast = document.createElement("div")
    const colors = {
      success: "bg-xp-primary text-xp-darker",
      error: "bg-xp-danger",
      info: "bg-xp-secondary"
    }

    toast.className = `toast px-6 py-3 rounded-lg shadow-lg text-white ${colors[type] || colors.info}`
    toast.textContent = message

    container.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = "0"
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  /**
   * Enlaza el cierre del modal por delegación (backdrop y botones close)
   * @private
   */
  _bindModalEvents() {
    const backdrop = document.getElementById("modal-backdrop")
    if (!backdrop) return

    backdrop.addEventListener("click", e => {
      const isBackdropClick = e.target === backdrop
      const isCloseButton = e.target.closest('[data-action="close-modal"]')
      if (isBackdropClick || isCloseButton) {
        this.closeModal()
      }
    })
  }

  /**
   * Muestra un modal con contenido
   * @param {string} contentHtml - Contenido HTML
   */
  showModal(contentHtml) {
    const backdrop = document.getElementById("modal-backdrop")
    const modalContent = document.getElementById("modal-content")
    if (!backdrop || !modalContent) return

    modalContent.innerHTML = contentHtml
    backdrop.classList.remove("hidden")
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    const backdrop = document.getElementById("modal-backdrop")
    if (backdrop) {
      backdrop.classList.add("hidden")
    }
  }

  /**
   * Muestra un toast con opción de deshacer (5 segundos)
   * @param {string} message - Mensaje a mostrar
   * @param {Function} undoCallback - Función a ejecutar al deshacer
   */
  showUndoToast(message, undoCallback) {
    const undoToast = document.getElementById("undo-toast")
    const undoMessage = document.getElementById("undo-message")
    if (!undoToast || !undoMessage) return

    undoMessage.textContent = message
    undoToast.classList.remove("hidden")
    this._undoCallback = undoCallback

    clearTimeout(this._undoTimeout)
    this._undoTimeout = setTimeout(() => {
      undoToast.classList.add("hidden")
      this._undoCallback = null
    }, 5000)
  }

  /**
   * Ejecuta la acción de deshacer pendiente
   */
  performUndo() {
    if (this._undoCallback) {
      this._undoCallback()
      this._undoCallback = null
    }
    clearTimeout(this._undoTimeout)
    document.getElementById("undo-toast")?.classList.add("hidden")
  }

  /**
   * Registra visitas inteligentes en ventana 24h y racha continua; confeti cada 10 días
   * @private
   */
  _visitCounter() {
    this.visitTracker = new VisitTracker()
    const result = this.visitTracker.recordVisit()
    this.visitStats = result

    const el = document.getElementById("hit-counter")
    if (el) el.textContent = result.totalVisits

    const streakEl = document.getElementById("streak-counter")
    if (streakEl) streakEl.textContent = result.currentStreak

    const milestoneBadge = document.getElementById("streak-milestone-badge")
    if (milestoneBadge) {
      const template =
        this.i18n?.t("ui.common.streakMilestoneNext", {
          days: result.daysToNextMilestone
        }) ||
        `Faltan ${result.daysToNextMilestone} días para el próximo confeti`
      milestoneBadge.textContent = template
    }

    const progressBar = document.getElementById("streak-progress-bar")
    if (progressBar) {
      progressBar.style.width = `${result.progressPercentage}%`
    }

    if (result.milestoneReached) {
      launchConfetti()
      this.eventBus.emit("streak:milestone", {
        streakDays: result.milestoneValue
      })
      const msg =
        this.i18n?.t("ui.common.streakMilestoneHit", {
          days: result.milestoneValue
        }) ||
        `¡Felicidades! ¡Alcanzaste una racha de ${result.milestoneValue} días seguidos! 🎉`
      this.eventBus.emit("toast:show", { message: msg, type: "success" })
    }
  }

  /**
   * Abre el modal interactivo para compartir la aplicación en redes sociales
   * @returns {void}
   */
  openShareModal() {
    this.eventBus.emit("modal:open", {
      contentHtml: shareModalTemplate(this.i18n)
    })
    const modalContent = document.getElementById("modal-content")
    if (modalContent) {
      bindShareModalEvents(modalContent, this.eventBus, this.i18n)
    }
  }

  /**
   * Fachada pública para compartir la aplicación
   * @returns {void}
   */
  shareApp() {
    this.openShareModal()
  }

  /**
   * Exporta los datos de la aplicación como archivo JSON descargable
   * y muestra notificación de éxito
   * @returns {void}
   */
  exportData() {
    const dataStr = this.storage.exportData()
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "daily-os-backup.json"
    link.click()
    URL.revokeObjectURL(url)

    this.showToast(this._t("ui.common.toast.dataExported"), "success")
    launchConfetti()
  }

  /**
   * Importa datos de la aplicación desde una cadena JSON
   * @param {string} json - Cadena JSON con los datos
   * @returns {boolean} true si la importación fue exitosa
   */
  importData(json) {
    const success = this.storage.importData(json)
    if (success) {
      // Recarga los datos de los módulos sin duplicar listeners
      this._reloadModules()
    }
    return success
  }

  /**
   * Muestra el modal de importación de datos con un selector de archivo
   * @returns {void}
   */
  showImportModal() {
    const content = `
      <div class="p-6">
        <h3 class="text-xl font-bold mb-4">
          ${this._t("app.screens.settings.data.import.title")}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          ${this._t("app.screens.settings.data.import.description")}
        </p>
        <input
          type="file"
          id="import-file-input"
          accept=".json"
          class="w-full mb-4 p-2 border rounded-lg dark:bg-xp-card dark:border-xp-primary/20"
        />
        <div class="flex gap-2 justify-end">
          <button
            onclick="app.closeModal()"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-xp-card"
          >
            ${this._t("ui.common.cancel")}
          </button>
          <button
            id="import-confirm-btn"
            class="px-4 py-2 rounded-lg bg-xp-primary text-xp-darker font-bold"
          >
            ${this._t("app.screens.settings.data.import.title")}
          </button>
        </div>
      </div>
    `
    this.showModal(content)

    const confirmBtn = document.getElementById("import-confirm-btn")
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        const fileInput = document.getElementById("import-file-input")
        const file = fileInput?.files?.[0]
        if (!file) {
          this.showToast(this._t("ui.common.toast.dataImportError"), "error")
          return
        }
        const reader = new FileReader()
        reader.onload = e => {
          const success = this.importData(e.target.result)
          this.closeModal()
          if (success) {
            this.showToast(this._t("ui.common.toast.dataImported"), "success")
            launchConfetti()
          } else {
            this.showToast(this._t("ui.common.toast.dataImportError"), "error")
          }
        }
        reader.onerror = () => {
          this.showToast(this._t("ui.common.toast.dataImportError"), "error")
        }
        reader.readAsText(file)
      })
    }
  }

  /**
   * Restablece los datos a los datos de demostración previa confirmación
   * @returns {void}
   */
  resetToDemo() {
    if (!confirm(this._t("app.screens.settings.data.reset.confirm"))) return

    const freshDemo = JSON.parse(JSON.stringify(demoData))
    this.storage.resetToDemo(freshDemo)
    this._reloadModules()

    this.showToast(this._t("ui.common.toast.dataReset"), "success")
    launchConfetti()
  }

  /**
   * Borra todos los datos de la aplicación previa confirmación
   * @returns {void}
   */
  clearAllData() {
    if (!confirm(this._t("app.screens.settings.data.clear.confirm"))) return

    this.storage.clear()
    this._reloadModules()

    this.showToast(this._t("ui.common.toast.dataCleared"), "success")
  }

  /**
   * Aplica el tema guardado al documento y sincroniza el toggle de settings
   * @returns {void}
   */
  loadTheme() {
    const theme = localStorage.getItem("theme") || "light"
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) themeToggle.checked = theme === "dark"
  }

  /**
   * Alterna entre el tema claro y oscuro y lo persiste
   * @returns {void}
   */
  toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || "light"
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", newTheme)
  }

  // ============================================
  // FACHADA PÚBLICA para los handlers inline del HTML
  // ============================================

  /**
   * Abre el modal de creación de presupuesto
   * @returns {void}
   */
  showCreateBudgetModal() {
    this.modules.budgets?.showCreateModal()
  }

  /**
   * Abre el modal de creación de tarea
   * @returns {void}
   */
  showCreateTaskModal() {
    this.modules.tasks?.showCreateModal()
  }

  /**
   * Abre el modal de creación de nota
   * @returns {void}
   */
  showCreateNoteModal() {
    this.modules.notes?.showCreateModal()
  }

  /**
   * Abre el modal de plantillas de hábitos
   * @returns {void}
   */
  showHabitTemplatesModal() {
    this.modules.habits?.showTemplatesModal()
  }

  /**
   * Filtra las tareas y actualiza el estado visual de los botones de filtro
   * @param {string} filter - Filtro a aplicar (all, today, high, completed)
   * @returns {void}
   */
  filterTasks(filter) {
    const tasksModule = this.modules.tasks
    if (!tasksModule) return

    tasksModule.activeFilter = filter
    tasksModule.render()

    document.querySelectorAll(".task-filter-btn").forEach(btn => {
      const isActive = btn.dataset.filter === filter
      btn.classList.toggle("bg-xp-primary", isActive)
      btn.classList.toggle("text-xp-darker", isActive)
      btn.classList.toggle("font-semibold", isActive)
      btn.classList.toggle("bg-gray-200", !isActive)
      btn.classList.toggle("dark:bg-xp-card", !isActive)
      btn.classList.toggle("text-gray-700", !isActive)
      btn.classList.toggle("dark:text-gray-300", !isActive)
    })
  }

  /**
   * Busca notas por texto y re-renderiza la lista con los resultados
   * @param {string} query - Texto de búsqueda
   * @returns {void}
   */
  searchNotes(query) {
    this.eventBus.emit("note:search", query)
  }

  /**
   * Obtiene una traducción con fallback a la clave
   * @param {string} key - Clave de traducción
   * @returns {string} Mensaje traducido o la clave si no existe
   * @private
   */
  _t(key) {
    return this.i18n?.getMessage(key) || key
  }
}

// Crea y exporta la instancia singleton
export const app = new DOSApp()
