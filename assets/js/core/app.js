/**
 * Main Application Core - Es la orquesta de todos los módulos
 */

import { BudgetsModule } from "../modules/budgets/index.js"
import { StorageService } from "../services/storage.js"
import { EventBus } from "./eventBus.js"
import { launchConfetti } from "../utils/confetti.js"

export class DOSApp {
  constructor() {
    this.storage = new StorageService()
    this.eventBus = new EventBus()
    this.i18n = null // Se establecerá cuando se cargue I18n
    this.modules = {}
    this.currentScreen = "home"
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    // Inicializa el almacenamiento y migra datos antiguos
    this.storage.init()

    // Enlaza el modal centralizado
    this._bindModalEvents()

    // Inicializa los módulos
    this._initModules()

    // Enlaza eventos globales
    this._bindGlobalEvents()

    // Navega a la pantalla inicial
    this.navigateTo(this._getInitialScreen())

    // Contador de visitas
    this._visitCounter()

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

    // TODO: Inicializa otros módulos (tareas, hábitos, notas)
    // this.modules.tasks = new TasksModule(...)
    // this.modules.habits = new HabitsModule(...)
    // this.modules.notes = new NotesModule(...)
    // this.modules.home = new HomeModule(...)
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
      case "budgets":
        this.modules.budgets?.render()
        break
      // TODO: Agregar otras pantallas
      // case 'tasks':
      //   this.modules.tasks?.render()
      //   break
      // case 'habits':
      //   this.modules.habits?.render()
      //   break
      // case 'notes':
      //   this.modules.notes?.render()
      //   break
      // case 'home':
      //   this.modules.home?.render()
      //   break
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
   * Incrementa y muestra el contador de visitas; confeti cada 10 visitas
   * @private
   */
  _visitCounter() {
    const count = parseInt(localStorage.getItem("visit_counter"), 10) || 0
    const next = count + 1
    localStorage.setItem("visit_counter", String(next))
    const el = document.getElementById("hit-counter")
    if (el) el.textContent = next
    if (next % 10 === 0) {
      launchConfetti()
    }
  }

  /**
   * Exporta todos los datos
   * @returns {string} Datos en formato JSON
   */
  exportData() {
    return this.storage.exportData()
  }

  /**
   * Importa datos
   * @param {string} json - Datos en formato JSON
   * @returns {boolean} Éxito
   */
  importData(json) {
    const success = this.storage.importData(json)
    if (success) {
      // Re-inicializa los módulos con los nuevos datos
      this._initModules()
      this._renderScreen(this.currentScreen)
    }
    return success
  }

  /**
   * Limpia todos los datos
   */
  clearAllData() {
    this.storage.clear()
    this._initModules()
    this._renderScreen(this.currentScreen)
  }

  /**
   * Reinicia a datos de demostración
   * @param {Object} demoData - Objeto de datos de demostración
   */
  resetToDemo(demoData) {
    this.storage.resetToDemo(demoData)
    this._initModules()
    this._renderScreen(this.currentScreen)
  }
}

// Crea y exporta la instancia singleton
export const app = new DOSApp()
