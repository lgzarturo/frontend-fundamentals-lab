/**
 * Pruebas para funciones de utilidad
 */
import { describe, expect, it } from "vitest"
import {
  formatDate,
  getCurrentWeekDates,
  getLastNDays,
  getRelativeTime,
  getTodayString,
  parseDateStringLocal
} from "../assets/js/utils/date.js"
import { escapeHtml } from "../assets/js/utils/html.js"
import { generateId, isValidId } from "../assets/js/utils/id.js"

describe("Utils", () => {
  describe("ID Utils", () => {
    it("debería generar IDs únicos", () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(10)
    })

    it("debería validar el formato de ID", () => {
      expect(isValidId(generateId())).toBe(true)
      expect(isValidId("short")).toBe(false)
      expect(isValidId(123)).toBe(false)
    })
  })

  describe("Date Utils", () => {
    it("debería formatear la fecha a YYYY-MM-DD", () => {
      const date = new Date(2026, 4, 6)
      expect(formatDate(date)).toBe("2026-05-06")
    })

    it("debería parsear YYYY-MM-DD como fecha local", () => {
      const date = parseDateStringLocal("2026-05-06")

      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(4)
      expect(date.getDate()).toBe(6)
      expect(date.getDay()).toBe(3)
    })

    it("debería devolver la fecha de hoy como cadena formateada", () => {
      const today = getTodayString()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("debería obtener los últimos N días", () => {
      const days = getLastNDays(7)
      expect(days).toHaveLength(7)
      expect(days[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("debería obtener la semana actual de lunes a domingo", () => {
      const days = getCurrentWeekDates(new Date(2026, 4, 6))

      expect(days).toEqual([
        "2026-05-04",
        "2026-05-05",
        "2026-05-06",
        "2026-05-07",
        "2026-05-08",
        "2026-05-09",
        "2026-05-10"
      ])
    })

    it("debería mantener el domingo al final de la semana actual", () => {
      const days = getCurrentWeekDates(new Date(2026, 4, 10))

      expect(days).toEqual([
        "2026-05-04",
        "2026-05-05",
        "2026-05-06",
        "2026-05-07",
        "2026-05-08",
        "2026-05-09",
        "2026-05-10"
      ])
    })

    it("debería calcular el tiempo relativo", () => {
      const now = Date.now()
      const i18n = {
        getMessage: key => (key === "label.justNow" ? "Just now" : "ago")
      }

      expect(getRelativeTime(now, i18n)).toBe("Just now")
      expect(getRelativeTime(now - 60000, i18n)).toBe("1m ago")
      expect(getRelativeTime(now - 3600000, i18n)).toBe("1h ago")
    })
  })

  describe("HTML Utils", () => {
    it("debería escapar caracteres especiales de HTML", () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      )
      expect(escapeHtml("Test & Example")).toBe("Test &amp; Example")
    })

    it("debería manejar cadenas vacías", () => {
      expect(escapeHtml("")).toBe("")
      expect(escapeHtml(null)).toBe("")
    })
  })
})
