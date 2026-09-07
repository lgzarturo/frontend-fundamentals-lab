/**
 * Pruebas de renderizado para templates de todos los módulos
 * Garantiza que fragmentos anidados no se escapen como texto HTML
 */
import { describe, expect, it } from "vitest"
import { Budget } from "../assets/js/modules/budgets/models.js"
import {
  budgetCardTemplate,
  budgetDetailsModalTemplate
} from "../assets/js/modules/budgets/templates.js"
import { Habit } from "../assets/js/modules/habits/models.js"
import {
  habitCardTemplate,
  habitListTemplate,
  habitTemplatesModalTemplate
} from "../assets/js/modules/habits/templates.js"
import {
  habitItemTemplate,
  mitItemTemplate
} from "../assets/js/modules/home/templates.js"
import { Note } from "../assets/js/modules/notes/models.js"
import {
  emptySearchNotesTemplate,
  noteCardTemplate,
  noteListTemplate,
  notePreviewTemplate
} from "../assets/js/modules/notes/templates.js"
import { Task } from "../assets/js/modules/tasks/models.js"
import {
  emptyTasksTemplate,
  taskCardTemplate,
  taskListTemplate
} from "../assets/js/modules/tasks/templates.js"

const i18nStub = {
  getMessage: (key, fallback) => fallback || key,
  t: (key, params) => key
}

describe("Templates renderizado HTML", () => {
  describe("Habits Templates", () => {
    it("debería renderizar la tarjeta de hábito sin código HTML escapado", () => {
      const habit = new Habit({
        title: "Beber agua",
        description: "500ml al despertar",
        streak: 5,
        color: "#34d399",
        dailyRecords: {}
      })

      const htmlOutput = habitCardTemplate(habit, i18nStub)

      expect(htmlOutput).not.toContain("&lt;div")
      expect(htmlOutput).not.toContain("&lt;p")
      expect(htmlOutput).not.toContain("&lt;span")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const title = container.querySelector("h3")
      expect(title?.textContent).toBe("Beber agua")

      const desc = container.querySelector("p")
      expect(desc?.textContent?.trim()).toBe("500ml al despertar")

      const dots = container.querySelectorAll(".w-6.h-6")
      expect(dots.length).toBe(7)
    })

    it("debería renderizar la lista de hábitos con elementos reales", () => {
      const habits = [
        new Habit({ title: "Hábito 1", streak: 1 }),
        new Habit({ title: "Hábito 2", streak: 2 })
      ]

      const htmlOutput = habitListTemplate(habits, i18nStub)
      expect(htmlOutput).not.toContain("&lt;div")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const cards = container.querySelectorAll('[data-action="delete-habit"]')
      expect(cards.length).toBe(2)
    })

    it("debería renderizar los botones de plantillas en el modal", () => {
      const htmlOutput = habitTemplatesModalTemplate(i18nStub)
      expect(htmlOutput).not.toContain("&lt;button")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const templateBtns = container.querySelectorAll(
        '[data-action="use-template"]'
      )
      expect(templateBtns.length).toBeGreaterThan(0)
    })
  })

  describe("Tasks Templates", () => {
    it("debería renderizar la tarjeta de tarea sin código HTML escapado", () => {
      const task = new Task({
        title: "Diseñar arquitectura",
        description: "Separar módulos y templates",
        dueDate: "2026-09-07",
        priority: "high",
        tags: ["core", "design"],
        subtasks: [{ id: "sub1", text: "Paso 1", done: true }],
        done: true
      })

      const htmlOutput = taskCardTemplate(task, i18nStub)

      expect(htmlOutput).not.toContain("&lt;p")
      expect(htmlOutput).not.toContain("&lt;div")
      expect(htmlOutput).not.toContain("&lt;span")
      expect(htmlOutput).not.toContain("&lt;svg")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const pDesc = container.querySelector("p")
      expect(pDesc?.textContent?.trim()).toBe("Separar módulos y templates")

      const tags = container.querySelectorAll("span.rounded-full")
      expect(tags.length).toBe(2)

      const svg = container.querySelector("svg")
      expect(svg).not.toBeNull()
    })

    it("debería renderizar la lista de tareas en un contenedor real", () => {
      const tasks = [
        new Task({ title: "Tarea 1" }),
        new Task({ title: "Tarea 2" })
      ]

      const htmlOutput = taskListTemplate(tasks, "all", i18nStub)
      expect(htmlOutput).not.toContain("&lt;div")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const taskCards = container.querySelectorAll(
        ".space-y-3 > [data-task-id]"
      )
      expect(taskCards.length).toBe(2)
    })

    it("debería renderizar el botón de crear tarea en estado vacío", () => {
      const htmlOutput = emptyTasksTemplate("all", i18nStub)
      expect(htmlOutput).not.toContain("&lt;button")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const btn = container.querySelector('[data-action="create-task"]')
      expect(btn).not.toBeNull()
    })
  })

  describe("Notes Templates", () => {
    it("debería renderizar la tarjeta de nota con preview y etiquetas reales", () => {
      const note = new Note({
        title: "Ideas de proyecto",
        bodyMarkdown: "Contenido de la nota con varias líneas de texto",
        tags: ["ideas", "web"]
      })

      const htmlOutput = noteCardTemplate(note, i18nStub)
      expect(htmlOutput).not.toContain("&lt;p")
      expect(htmlOutput).not.toContain("&lt;span")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const preview = container.querySelector("p")
      expect(preview).not.toBeNull()

      const tags = container.querySelectorAll("span.rounded-full")
      expect(tags.length).toBe(2)
    })

    it("debería renderizar la lista de notas", () => {
      const notes = [
        new Note({ title: "Nota 1", bodyMarkdown: "Texto 1" }),
        new Note({ title: "Nota 2", bodyMarkdown: "Texto 2" })
      ]

      const htmlOutput = noteListTemplate(notes, i18nStub)
      expect(htmlOutput).not.toContain("&lt;div")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const noteCards = container.querySelectorAll('[data-action="view-note"]')
      expect(noteCards.length).toBe(2)
    })

    it("debería renderizar el preview markdown con HTML seguro", () => {
      const note = new Note({
        title: "Nota Markdown",
        bodyMarkdown: "# Encabezado\n**Texto en negrita**"
      })

      const htmlOutput = notePreviewTemplate(note)
      expect(htmlOutput).not.toContain("&lt;h1")
      expect(htmlOutput).not.toContain("&lt;strong")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      expect(container.querySelector("h1")).not.toBeNull()
      expect(container.querySelector("strong")).not.toBeNull()
    })

    it("debería renderizar emptySearchNotesTemplate cuando no hay notas para la búsqueda", () => {
      const htmlOutput = emptySearchNotesTemplate("inexistente", i18nStub)
      expect(htmlOutput).not.toContain("&lt;div")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      expect(container.textContent).toContain("Sin resultados")
    })

    it("noteListTemplate debería mostrar plantilla de búsqueda vacía si se pasa query", () => {
      const htmlOutput = noteListTemplate([], i18nStub, "prueba")
      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      expect(container.textContent).toContain("Sin resultados")
    })
  })

  describe("Home Templates", () => {
    it("debería renderizar mitItemTemplate con tags sin escapar el div", () => {
      const task = new Task({
        title: "MIT importante",
        priority: "high",
        tags: ["urgente", "trabajo"]
      })

      const htmlOutput = mitItemTemplate(task)
      expect(htmlOutput).not.toContain("&lt;div")
      expect(htmlOutput).not.toContain("&lt;span")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const tags = container.querySelectorAll(".flex-wrap span.rounded")
      expect(tags.length).toBe(2)
    })

    it("debería renderizar habitItemTemplate con checkmark como elemento", () => {
      const today = "2026-09-07"
      const habit = new Habit({
        title: "Meditación",
        streak: 3,
        dailyRecords: { [today]: true }
      })

      const htmlOutput = habitItemTemplate(habit, today)
      expect(htmlOutput).not.toContain("&lt;span")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const check = container.querySelector("button span")
      expect(check?.textContent).toBe("✓")
    })
  })

  describe("Budgets Templates", () => {
    it("debería renderizar budgetDetailsModalTemplate con botón delete funcional", () => {
      const budget = new Budget({
        name: "Fondo Emergencia",
        currency: "MXN",
        type: "savings",
        goalAmount: 20000
      })

      const htmlOutput = budgetDetailsModalTemplate(budget, i18nStub)
      expect(htmlOutput).not.toContain("&lt;div")

      const container = document.createElement("div")
      container.innerHTML = htmlOutput

      const deleteBtn = container.querySelector('[data-action="delete-budget"]')
      expect(deleteBtn).not.toBeNull()
      expect(deleteBtn?.getAttribute("data-budget-id")).toBe(budget.id)
    })
  })
})
