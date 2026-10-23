/**
 * Pruebas para funciones de utilidad
 */
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  formatDate,
  formatDateInTimezone,
  getAppTimezone,
  getCurrentWeekDates,
  getLastNDays,
  getRelativeTime,
  getTodayString,
  listTimeZones,
  parseDateStringLocal,
  setAppTimezone
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

describe("Date Utils - zona horaria (BC-007)", () => {
  afterEach(() => {
    setAppTimezone(null)
    vi.useRealTimers()
  })

  it("debería usar la zona del navegador por defecto", () => {
    expect(getAppTimezone()).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
  })

  it("debería fijar y restaurar la zona configurada", () => {
    setAppTimezone("America/Mexico_City")
    expect(getAppTimezone()).toBe("America/Mexico_City")
    setAppTimezone(null)
    expect(getAppTimezone()).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
  })

  it("debería formatear un instante fijo según la zona", () => {
    const instant = Date.UTC(2026, 4, 8, 1, 30)
    expect(formatDateInTimezone(instant, "America/Mexico_City")).toBe(
      "2026-05-07"
    )
    expect(formatDateInTimezone(instant, "UTC")).toBe("2026-05-08")
    expect(formatDateInTimezone(instant, "Pacific/Kiritimati")).toBe(
      "2026-05-08"
    )
  })

  it("debería resolver hoy en la zona configurada", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 8, 0, 30)))
    setAppTimezone("America/Mexico_City")
    expect(getTodayString()).toBe("2026-05-07")
    setAppTimezone("Pacific/Kiritimati")
    expect(getTodayString()).toBe("2026-05-08")
  })

  it("debería aceptar zona explícita sin cambiar la configurada", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 8, 0, 30)))
    expect(getTodayString("America/Mexico_City")).toBe("2026-05-07")
    expect(getTodayString("Pacific/Kiritimati")).toBe("2026-05-08")
  })

  it("debería devolver los últimos N días terminando hoy", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 8, 12, 0)))
    setAppTimezone("UTC")
    expect(getLastNDays(7)).toEqual([
      "2026-05-02",
      "2026-05-03",
      "2026-05-04",
      "2026-05-05",
      "2026-05-06",
      "2026-05-07",
      "2026-05-08"
    ])
  })

  it("debería calcular la semana lun-dom desde una referencia", () => {
    expect(getCurrentWeekDates("2026-05-08")).toEqual([
      "2026-05-04",
      "2026-05-05",
      "2026-05-06",
      "2026-05-07",
      "2026-05-08",
      "2026-05-09",
      "2026-05-10"
    ])
  })

  it("debería listar zonas IANA incluyendo UTC", () => {
    const zones = listTimeZones()
    expect(zones.length).toBeGreaterThan(10)
    expect(zones).toContain("UTC")
    expect(zones).toContain("America/Mexico_City")
  })

  it("debería aplicar la zona en el fallback de tiempo relativo", () => {
    const ts = Date.UTC(2026, 0, 5, 0, 30)
    setAppTimezone("America/Mexico_City")
    expect(getRelativeTime(ts)).toBe(
      new Date(ts).toLocaleDateString(undefined, {
        timeZone: "America/Mexico_City"
      })
    )
  })
})
