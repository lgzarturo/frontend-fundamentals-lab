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
import { escapeHtml, html, raw } from "../assets/js/utils/html.js"
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

    it("debería escapar texto interpolado en tagged template html", () => {
      const malicious = '<script>alert("xss")</script>'
      const result = html`<div>${malicious}</div>`
      expect(result).toBe(
        '<div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>'
      )
    })

    it("debería preservar cadenas marcadas con raw() sin escapar", () => {
      const safe = raw("<span>seguro</span>")
      const result = html`<div>${safe}</div>`
      expect(result).toBe("<div><span>seguro</span></div>")
    })

    it("debería interpolar números y valores nulos/indefinidos correctamente", () => {
      expect(html`<span>${42}</span>`).toBe("<span>42</span>")
      expect(html`<span>${null}</span>`).toBe("<span></span>")
      expect(html`<span>${undefined}</span>`).toBe("<span></span>")
    })

    it("debería manejar arrays de elementos seguros o cadenas", () => {
      const items = [raw("<li>1</li>"), raw("<li>2</li>")]
      const result = html`<ul>${items}</ul>`
      expect(result).toBe("<ul><li>1</li><li>2</li></ul>")
    })

    it("debería envolver arrays con raw()", () => {
      const rawList = raw(["<div>A</div>", "<div>B</div>"])
      expect(rawList.__html).toBe("<div>A</div><div>B</div>")
    })
  })
})
