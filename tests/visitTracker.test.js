import { beforeEach, describe, expect, it, vi } from "vitest"
import { VisitTracker } from "../assets/js/services/visitTracker.js"

describe("VisitTracker Service", () => {
  let tracker
  const TEST_STORAGE_KEY = "test_visit_tracker"

  beforeEach(() => {
    localStorage.clear()
    tracker = new VisitTracker(TEST_STORAGE_KEY)
  })

  it("debería inicializar con estado por defecto si no hay datos previos", () => {
    const state = tracker.getState()
    expect(state.lastVisitDate).toBeNull()
    expect(state.currentStreak).toBe(0)
    expect(state.totalVisits).toBe(0)
    expect(state.totalActiveDays).toBe(0)
  })

  it("debería migrar el contador legacy si existe en localStorage", () => {
    localStorage.setItem("visit_counter", "5")
    const state = tracker.getState()
    expect(state.totalVisits).toBe(5)
    expect(state.currentStreak).toBe(1)
  })

  it("primera visita: debería iniciar racha en 1 y registrar visita", () => {
    const result = tracker.recordVisit("2026-09-01")

    expect(result.currentStreak).toBe(1)
    expect(result.maxStreak).toBe(1)
    expect(result.totalActiveDays).toBe(1)
    expect(result.totalVisits).toBe(1)
    expect(result.lastVisitDate).toBe("2026-09-01")
    expect(result.isNewDay).toBe(true)
    expect(result.milestoneReached).toBe(false)
    expect(result.daysToNextMilestone).toBe(9)
    expect(result.progressPercentage).toBe(10)
  })

  it("visita en la misma ventana de 24h (mismo día): no debe incrementar racha ni visitas", () => {
    tracker.recordVisit("2026-09-01")
    const repeatResult = tracker.recordVisit("2026-09-01")

    expect(repeatResult.currentStreak).toBe(1)
    expect(repeatResult.totalActiveDays).toBe(1)
    expect(repeatResult.totalVisits).toBe(1)
    expect(repeatResult.isNewDay).toBe(false)
  })

  it("visita en día consecutivo (+1 día): debe incrementar racha continua", () => {
    tracker.recordVisit("2026-09-01")
    const day2Result = tracker.recordVisit("2026-09-02")

    expect(day2Result.currentStreak).toBe(2)
    expect(day2Result.maxStreak).toBe(2)
    expect(day2Result.totalActiveDays).toBe(2)
    expect(day2Result.totalVisits).toBe(2)
    expect(day2Result.isContinuousStreak).toBe(true)
    expect(day2Result.daysToNextMilestone).toBe(8)
    expect(day2Result.progressPercentage).toBe(20)
  })

  it("visita tras saltar 2 o más días: racha se rompe y se reinicia en 1", () => {
    tracker.recordVisit("2026-09-01")
    tracker.recordVisit("2026-09-02") // racha 2
    const brokenResult = tracker.recordVisit("2026-09-05") // 3 días después

    expect(brokenResult.currentStreak).toBe(1)
    expect(brokenResult.maxStreak).toBe(2) // preserva récord histórico
    expect(brokenResult.totalActiveDays).toBe(3)
    expect(brokenResult.totalVisits).toBe(3)
    expect(brokenResult.isContinuousStreak).toBe(false)
  })

  it("alcanzar 10 días continuos: activa milestoneReached para confeti y recompensa", () => {
    // Simular 9 días seguidos
    for (let day = 1; day <= 9; day++) {
      const dateStr = `2026-09-${String(day).padStart(2, "0")}`
      tracker.recordVisit(dateStr)
    }

    // Día 10 consecutivo
    const day10Result = tracker.recordVisit("2026-09-10")

    expect(day10Result.currentStreak).toBe(10)
    expect(day10Result.milestoneReached).toBe(true)
    expect(day10Result.milestoneValue).toBe(10)
    expect(day10Result.daysToNextMilestone).toBe(10)
    expect(day10Result.progressPercentage).toBe(100)
  })

  it("no debe celebrar el mismo hito más de una vez", () => {
    for (let day = 1; day <= 10; day++) {
      const dateStr = `2026-09-${String(day).padStart(2, "0")}`
      tracker.recordVisit(dateStr)
    }

    // Re-evaluar mismo día 10
    const repeat10 = tracker.recordVisit("2026-09-10")
    expect(repeat10.milestoneReached).toBe(false)
  })

  it("sincroniza visit_counter en localStorage para compatibilidad", () => {
    tracker.recordVisit("2026-09-01")
    tracker.recordVisit("2026-09-02")

    expect(localStorage.getItem("visit_counter")).toBe("2")
  })
})
