import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  DueDatePicker,
  dueDatePickerTemplate,
  getDueDateStatus,
  getNextWeekString,
  getTomorrowString
} from "../assets/js/components/dueDatePicker.js"
import { formatDate, getTodayString } from "../assets/js/utils/date.js"

describe("DueDatePicker Component", () => {
  describe("getTomorrowString & getNextWeekString", () => {
    it("getTomorrowString debería devolver la fecha de mañana en formato YYYY-MM-DD", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(getTomorrowString()).toBe(formatDate(tomorrow))
    })

    it("getNextWeekString debería devolver la fecha en 7 días en formato YYYY-MM-DD", () => {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      expect(getNextWeekString()).toBe(formatDate(nextWeek))
    })
  })

  describe("getDueDateStatus", () => {
    it("debería devolver estado de sin fecha límite cuando está vacío", () => {
      const status = getDueDateStatus("")
      expect(status.text).toBe("Sin fecha límite")
      expect(status.icon).toBe("⚪")
      expect(status.className).toContain("text-gray-400")
    })

    it("debería devolver Vence hoy para la fecha de hoy", () => {
      const status = getDueDateStatus(getTodayString())
      expect(status.text).toBe("Vence hoy")
      expect(status.icon).toBe("⚡")
      expect(status.className).toContain("text-xp-primary")
    })

    it("debería devolver Vence mañana para la fecha de mañana", () => {
      const status = getDueDateStatus(getTomorrowString())
      expect(status.text).toBe("Vence mañana")
      expect(status.icon).toBe("🌅")
      expect(status.className).toContain("text-blue-500")
    })

    it("debería devolver Vencida ayer si la fecha fue ayer", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const status = getDueDateStatus(formatDate(yesterday))
      expect(status.text).toBe("Vencida ayer")
      expect(status.icon).toBe("⚠️")
      expect(status.className).toContain("text-xp-danger")
    })

    it("debería devolver Vencida hace X días si fue hace más de un día", () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)
      const status = getDueDateStatus(formatDate(pastDate))
      expect(status.text).toBe("Vencida hace 3 días")
      expect(status.icon).toBe("⚠️")
      expect(status.className).toContain("text-xp-danger")
    })

    it("debería devolver Vence en X días para fechas futuras", () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 4)
      const status = getDueDateStatus(formatDate(futureDate))
      expect(status.text).toBe("Vence en 4 días")
      expect(status.icon).toBe("📅")
    })

    it("debería respetar las traducciones provistas por el objeto i18n", () => {
      const i18nMock = {
        getMessage: vi.fn(key => (key.includes("dueToday") ? "Today!" : "")),
        t: vi.fn()
      }
      const status = getDueDateStatus(getTodayString(), i18nMock)
      expect(status.text).toBe("Today!")
    })
  })

  describe("dueDatePickerTemplate", () => {
    it("debería renderizar la estructura HTML con botones de preset y campo input", () => {
      const html = dueDatePickerTemplate({
        id: "task-due-date",
        name: "dueDate",
        value: getTodayString()
      })

      expect(html).toContain('data-date-preset="today"')
      expect(html).toContain('data-date-preset="tomorrow"')
      expect(html).toContain('data-date-preset="next-week"')
      expect(html).toContain('data-date-preset="clear"')
      expect(html).toContain('type="date"')
      expect(html).toContain('name="dueDate"')

      const container = document.createElement("div")
      container.innerHTML = html

      const todayBtn = container.querySelector('[data-date-preset="today"]')
      expect(todayBtn.classList.contains("bg-xp-primary")).toBe(true)
    })
  })

  describe("DueDatePicker Class", () => {
    let container

    beforeEach(() => {
      container = document.createElement("div")
      container.innerHTML = dueDatePickerTemplate({
        id: "test-picker",
        name: "testDate",
        value: ""
      })
      document.body.appendChild(container)
    })

    it("debería lanzar error si no se pasa un elemento contenedor", () => {
      expect(() => new DueDatePicker({ container: null })).toThrow()
    })

    it("debería inicializar con la fecha provista y actualizar la UI", () => {
      const picker = new DueDatePicker({
        container,
        initialDate: getTodayString()
      })

      expect(picker.getDate()).toBe(getTodayString())
      const input = container.querySelector('input[type="date"]')
      expect(input.value).toBe(getTodayString())

      const statusText = container.querySelector(".status-text")
      expect(statusText.textContent).toBe("Vence hoy")
      picker.destroy()
    })

    it("debería cambiar a hoy al pulsar el preset hoy", () => {
      const onChange = vi.fn()
      const picker = new DueDatePicker({
        container,
        onChange
      })

      const todayBtn = container.querySelector('[data-date-preset="today"]')
      todayBtn.click()

      expect(picker.getDate()).toBe(getTodayString())
      expect(onChange).toHaveBeenCalledWith(getTodayString())
      picker.destroy()
    })

    it("debería cambiar a mañana al pulsar el preset mañana", () => {
      const picker = new DueDatePicker({ container })
      const tomorrowBtn = container.querySelector(
        '[data-date-preset="tomorrow"]'
      )
      tomorrowBtn.click()

      expect(picker.getDate()).toBe(getTomorrowString())
      picker.destroy()
    })

    it("debería cambiar a +7 días al pulsar el preset next-week", () => {
      const picker = new DueDatePicker({ container })
      const nextWeekBtn = container.querySelector(
        '[data-date-preset="next-week"]'
      )
      nextWeekBtn.click()

      expect(picker.getDate()).toBe(getNextWeekString())
      picker.destroy()
    })

    it("debería vaciar la fecha al pulsar el preset clear", () => {
      const picker = new DueDatePicker({
        container,
        initialDate: getTodayString()
      })
      const clearBtn = container.querySelector('[data-date-preset="clear"]')
      clearBtn.click()

      expect(picker.getDate()).toBe("")
      picker.destroy()
    })

    it("debería actualizarse al escribir un valor directo en el input de fecha", () => {
      const onChange = vi.fn()
      const picker = new DueDatePicker({ container, onChange })
      const input = container.querySelector('input[type="date"]')

      input.value = getTomorrowString()
      input.dispatchEvent(new Event("change"))

      expect(picker.getDate()).toBe(getTomorrowString())
      expect(onChange).toHaveBeenCalledWith(getTomorrowString())
      picker.destroy()
    })

    it("setDate() debería cambiar la fecha y actualizar presets activos", () => {
      const picker = new DueDatePicker({ container })
      picker.setDate(getTodayString())

      expect(picker.getDate()).toBe(getTodayString())
      const todayBtn = container.querySelector('[data-date-preset="today"]')
      expect(todayBtn.classList.contains("bg-xp-primary")).toBe(true)
      picker.destroy()
    })
  })
})
