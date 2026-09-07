/**
 * Servicio de Analíticas y Seguimiento de Patrones de Uso para Daily OS
 * Reporta eventos estructurados a Google Analytics 4 (vía dataLayer de GTM)
 * y mantiene estadísticas locales del patrón de uso de cada herramienta.
 */

const STORAGE_KEY_USAGE = "dos_tool_usage_stats"

export class AnalyticsTracker {
  constructor(storageKey = STORAGE_KEY_USAGE) {
    this.storageKey = storageKey
    this.recentEvents = []
    this._initDataLayer()
  }

  _initDataLayer() {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || []
    }
  }

  /**
   * Envía un evento personalizado al dataLayer de GA4 / GTM
   * @param {string} eventName - Nombre del evento en GA4
   * @param {Object} [params={}] - Parámetros del evento
   * @returns {Object} Evento registrado
   */
  trackEvent(eventName, params = {}) {
    this._initDataLayer()
    const payload = {
      event: eventName,
      ...params,
      timestamp: new Date().toISOString()
    }

    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(payload)
    }

    this.recentEvents.push(payload)
    if (this.recentEvents.length > 50) {
      this.recentEvents.shift()
    }

    return payload
  }

  /**
   * Registra una visualización de pantalla
   * @param {string} screenName - Nombre de la pantalla (home, tasks, habits, etc.)
   */
  trackScreenView(screenName) {
    const stats = this._getStats()
    stats.screens[screenName] = (stats.screens[screenName] || 0) + 1
    stats.totalInteractions = (stats.totalInteractions || 0) + 1
    this._saveStats(stats)

    return this.trackEvent("screen_view", {
      screen_name: screenName
    })
  }

  /**
   * Registra el uso específico de una herramienta para medir el patrón de adopción
   * @param {string} tool - Nombre de la herramienta (tasks, habits, notes, budgets)
   * @param {string} action - Acción realizada (create, update, delete, toggle, view)
   * @param {Object} [details={}] - Metadatos adicionales
   */
  trackToolUsage(tool, action, details = {}) {
    const stats = this._getStats()

    if (!stats.tools[tool]) {
      stats.tools[tool] = { total: 0 }
    }
    stats.tools[tool][action] = (stats.tools[tool][action] || 0) + 1
    stats.tools[tool].total = (stats.tools[tool].total || 0) + 1
    stats.lastUsed[tool] = Date.now()
    stats.totalInteractions = (stats.totalInteractions || 0) + 1

    this._saveStats(stats)

    return this.trackEvent("tool_usage", {
      tool_name: tool,
      tool_action: action,
      ...details
    })
  }

  /**
   * Registra la consecución de un hito de racha de uso diario
   * @param {number} streakDays - Número de días continuos alcanzados
   */
  trackStreakMilestone(streakDays) {
    const stats = this._getStats()
    stats.streakMilestones = stats.streakMilestones || []
    if (!stats.streakMilestones.includes(streakDays)) {
      stats.streakMilestones.push(streakDays)
    }
    this._saveStats(stats)

    return this.trackEvent("streak_milestone", {
      streak_days: streakDays,
      milestone_level: Math.floor(streakDays / 10)
    })
  }

  /**
   * Registra cuando el usuario comparte la aplicación en redes sociales
   * @param {string} platform - Plataforma (twitter, whatsapp, linkedin, telegram, native, copy)
   * @param {string} [url] - URL compartida
   */
  trackSocialShare(platform, url = "") {
    const stats = this._getStats()
    stats.shares[platform] = (stats.shares[platform] || 0) + 1
    this._saveStats(stats)

    return this.trackEvent("share_app", {
      platform,
      shared_url: url
    })
  }

  /**
   * Obtiene el informe analítico consolidado del patrón de uso de las herramientas
   * @returns {Object} Reporte de uso
   */
  getToolUsagePatterns() {
    const stats = this._getStats()
    const tools = stats.tools || {}

    const ranking = Object.keys(tools)
      .map(tool => ({
        tool,
        total: tools[tool].total || 0,
        actions: { ...tools[tool] }
      }))
      .sort((a, b) => b.total - a.total)

    const totalToolActions = ranking.reduce((acc, curr) => acc + curr.total, 0)

    const distribution = {}
    ranking.forEach(item => {
      distribution[item.tool] =
        totalToolActions > 0
          ? Math.round((item.total / totalToolActions) * 100)
          : 0
    })

    return {
      ranking,
      topTool: ranking[0]?.tool || null,
      distribution,
      totalToolActions,
      totalInteractions: stats.totalInteractions || 0,
      screens: stats.screens,
      shares: stats.shares,
      lastUsed: stats.lastUsed,
      streakMilestones: stats.streakMilestones || []
    }
  }

  /**
   * Conecta automáticamente el tracker con el EventBus central de la aplicación
   * @param {Object} eventBus
   */
  connectEventBus(eventBus) {
    if (!eventBus || typeof eventBus.on !== "function") return

    // Pantallas
    eventBus.on("screen:change", ({ screen }) => {
      this.trackScreenView(screen)
    })

    // Tareas
    eventBus.on("task:created", task => {
      this.trackToolUsage("tasks", "create", { taskId: task?.id })
    })
    eventBus.on("task:updated", task => {
      this.trackToolUsage("tasks", "update", { taskId: task?.id })
    })
    eventBus.on("task:deleted", task => {
      this.trackToolUsage("tasks", "delete", { taskId: task?.id })
    })
    eventBus.on("task:toggled", task => {
      this.trackToolUsage("tasks", "toggle", {
        taskId: task?.id,
        done: task?.done
      })
    })

    // Hábitos
    eventBus.on("habit:created", habit => {
      this.trackToolUsage("habits", "create", { habitId: habit?.id })
    })
    eventBus.on("habit:updated", habit => {
      this.trackToolUsage("habits", "update", { habitId: habit?.id })
    })
    eventBus.on("habit:deleted", habit => {
      this.trackToolUsage("habits", "delete", { habitId: habit?.id })
    })
    eventBus.on("habit:toggled", habit => {
      this.trackToolUsage("habits", "toggle", { habitId: habit?.id })
    })

    // Notas
    eventBus.on("note:created", note => {
      this.trackToolUsage("notes", "create", { noteId: note?.id })
    })
    eventBus.on("note:updated", note => {
      this.trackToolUsage("notes", "update", { noteId: note?.id })
    })
    eventBus.on("note:deleted", note => {
      this.trackToolUsage("notes", "delete", { noteId: note?.id })
    })

    // Presupuestos
    eventBus.on("budget:created", budget => {
      this.trackToolUsage("budgets", "create", { budgetId: budget?.id })
    })
    eventBus.on("budget:deleted", budget => {
      this.trackToolUsage("budgets", "delete", { budgetId: budget?.id })
    })

    // Datos y temas
    eventBus.on("data:exported", () => {
      this.trackEvent("data_export")
    })
    eventBus.on("data:imported", () => {
      this.trackEvent("data_import")
    })
    eventBus.on("theme:changed", ({ theme }) => {
      this.trackEvent("theme_toggle", { theme })
    })

    // Rachas y compartir
    eventBus.on("streak:milestone", ({ streakDays }) => {
      this.trackStreakMilestone(streakDays)
    })
    eventBus.on("share:action", ({ platform, url }) => {
      this.trackSocialShare(platform, url)
    })
  }

  /**
   * Enlaza el tracking de enlaces existente para compatibilidad
   */
  initLinkTracking() {
    if (typeof document === "undefined") return
    document.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        this.trackEvent("click_link", {
          link_url: link.href,
          link_content: (link.textContent || "").trim()
        })
      })
    })
  }

  _getStats() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(this.storageKey)
        if (raw) return JSON.parse(raw)
      }
    } catch {
      // Ignorar errores
    }
    return {
      tools: {
        tasks: { total: 0 },
        habits: { total: 0 },
        notes: { total: 0 },
        budgets: { total: 0 }
      },
      screens: {},
      shares: {},
      lastUsed: {},
      totalInteractions: 0,
      streakMilestones: []
    }
  }

  _saveStats(stats) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(stats))
      }
    } catch {
      // Ignorar fallos de cuota
    }
  }
}

export const analytics = new AnalyticsTracker()

if (typeof window !== "undefined") {
  window.analytics = analytics
  window.addEventListener("load", () => {
    analytics.initLinkTracking()
  })
}
