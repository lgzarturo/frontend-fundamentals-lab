import { beforeEach, describe, expect, it, vi } from "vitest"
import { AnalyticsTracker } from "../assets/js/analytics.js"

describe("AnalyticsTracker Service", () => {
  let tracker
  const TEST_STORAGE_KEY = "test_tool_usage_stats"

  beforeEach(() => {
    localStorage.clear()
    window.dataLayer = []
    tracker = new AnalyticsTracker(TEST_STORAGE_KEY)
  })

  it("trackEvent debería enviar el evento al dataLayer de GA4", () => {
    tracker.trackEvent("custom_test_event", { meta: "valor" })

    expect(window.dataLayer).toHaveLength(1)
    expect(window.dataLayer[0].event).toBe("custom_test_event")
    expect(window.dataLayer[0].meta).toBe("valor")
    expect(window.dataLayer[0].timestamp).toBeDefined()
  })

  it("trackScreenView debería registrar la visualización de pantalla", () => {
    tracker.trackScreenView("tasks")

    expect(window.dataLayer).toHaveLength(1)
    expect(window.dataLayer[0].event).toBe("screen_view")
    expect(window.dataLayer[0].screen_name).toBe("tasks")

    const patterns = tracker.getToolUsagePatterns()
    expect(patterns.screens.tasks).toBe(1)
  })

  it("trackToolUsage debería registrar el uso de herramientas específicas", () => {
    tracker.trackToolUsage("tasks", "create", { taskId: "123" })
    tracker.trackToolUsage("tasks", "toggle", { taskId: "123" })
    tracker.trackToolUsage("habits", "create", { habitId: "h1" })

    expect(window.dataLayer).toHaveLength(3)
    expect(window.dataLayer[0].event).toBe("tool_usage")
    expect(window.dataLayer[0].tool_name).toBe("tasks")
    expect(window.dataLayer[0].tool_action).toBe("create")

    const patterns = tracker.getToolUsagePatterns()
    expect(patterns.totalToolActions).toBe(3)
    expect(patterns.ranking[0].tool).toBe("tasks")
    expect(patterns.ranking[0].total).toBe(2)
    expect(patterns.ranking[1].tool).toBe("habits")
    expect(patterns.ranking[1].total).toBe(1)
    expect(patterns.topTool).toBe("tasks")
  })

  it("trackStreakMilestone debería registrar el hito de racha", () => {
    tracker.trackStreakMilestone(10)

    expect(window.dataLayer).toHaveLength(1)
    expect(window.dataLayer[0].event).toBe("streak_milestone")
    expect(window.dataLayer[0].streak_days).toBe(10)
    expect(window.dataLayer[0].milestone_level).toBe(1)

    const patterns = tracker.getToolUsagePatterns()
    expect(patterns.streakMilestones).toContain(10)
  })

  it("trackSocialShare debería registrar compartir en redes sociales", () => {
    tracker.trackSocialShare("twitter", "https://task-manager.lgzarturo.com/")

    expect(window.dataLayer).toHaveLength(1)
    expect(window.dataLayer[0].event).toBe("share_app")
    expect(window.dataLayer[0].platform).toBe("twitter")

    const patterns = tracker.getToolUsagePatterns()
    expect(patterns.shares.twitter).toBe(1)
  })

  it("getToolUsagePatterns debería calcular la distribución porcentual correctamente", () => {
    tracker.trackToolUsage("tasks", "create")
    tracker.trackToolUsage("tasks", "create")
    tracker.trackToolUsage("tasks", "create")
    tracker.trackToolUsage("habits", "create") // 3 tasks (75%), 1 habit (25%)

    const patterns = tracker.getToolUsagePatterns()
    expect(patterns.distribution.tasks).toBe(75)
    expect(patterns.distribution.habits).toBe(25)
  })

  describe("connectEventBus", () => {
    let mockEventBus
    let listeners

    beforeEach(() => {
      listeners = {}
      mockEventBus = {
        on: vi.fn((event, cb) => {
          listeners[event] = listeners[event] || []
          listeners[event].push(cb)
        }),
        emit: vi.fn((event, data) => {
          ;(listeners[event] || []).forEach(cb => cb(data))
        })
      }
      tracker.connectEventBus(mockEventBus)
    })

    it("debería reaccionar a screen:change", () => {
      mockEventBus.emit("screen:change", { screen: "notes" })
      expect(window.dataLayer[0].event).toBe("screen_view")
      expect(window.dataLayer[0].screen_name).toBe("notes")
    })

    it("debería capturar eventos CRUD de tareas", () => {
      mockEventBus.emit("task:created", { id: "t1", title: "Tarea 1" })
      mockEventBus.emit("task:toggled", { id: "t1", done: true })

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer[0].tool_name).toBe("tasks")
      expect(window.dataLayer[0].tool_action).toBe("create")
      expect(window.dataLayer[1].tool_action).toBe("toggle")
    })

    it("debería capturar eventos de hábitos, notas y presupuestos", () => {
      mockEventBus.emit("habit:created", { id: "h1" })
      mockEventBus.emit("note:created", { id: "n1" })
      mockEventBus.emit("budget:created", { id: "b1" })

      expect(window.dataLayer).toHaveLength(3)
      expect(window.dataLayer[0].tool_name).toBe("habits")
      expect(window.dataLayer[1].tool_name).toBe("notes")
      expect(window.dataLayer[2].tool_name).toBe("budgets")
    })

    it("debería capturar hitos de racha y compartir", () => {
      mockEventBus.emit("streak:milestone", { streakDays: 20 })
      mockEventBus.emit("share:action", {
        platform: "whatsapp",
        url: "https://test.com"
      })

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer[0].event).toBe("streak_milestone")
      expect(window.dataLayer[0].streak_days).toBe(20)
      expect(window.dataLayer[1].event).toBe("share_app")
      expect(window.dataLayer[1].platform).toBe("whatsapp")
    })
  })
})
