import { beforeEach, describe, expect, it, vi } from "vitest"
import { Task } from "../assets/js/modules/tasks/models.js"
import { TasksModule } from "../assets/js/modules/tasks/index.js"
import {
  mitItemTemplate
} from "../assets/js/modules/home/templates.js"
import {
  taskCardTemplate
} from "../assets/js/modules/tasks/templates.js"
import {
  getExpandedSubtaskIds,
  isSubtaskExpanded,
  toggleSubtaskExpanded
} from "../assets/js/utils/subtasksStorage.js"

describe("Jerarquía y visualización de Subtareas", () => {
  let task
  let mockStorage
  let mockEventBus

  beforeEach(() => {
    localStorage.clear()
    task = new Task({
      id: "task-100",
      title: "Tarea con subtareas",
      priority: "high",
      tags: ["dev", "ui"],
      subtasks: [
        { id: "sub-1", text: "Subtarea uno", done: true },
        { id: "sub-2", text: "Subtarea dos", done: false },
        { id: "sub-3", text: "Subtarea tres", done: false }
      ]
    })

    mockStorage = {
      data: { tasks: [task.toJSON()] },
      get(k) {
        return this.data[k] || []
      },
      set(k, v) {
        this.data[k] = v
      }
    }

    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn()
    }
  })

  it("persistencia del estado expandido en localStorage", () => {
    expect(isSubtaskExpanded("task-100")).toBe(false)
    toggleSubtaskExpanded("task-100")
    expect(isSubtaskExpanded("task-100")).toBe(true)
    expect(getExpandedSubtaskIds().has("task-100")).toBe(true)

    toggleSubtaskExpanded("task-100")
    expect(isSubtaskExpanded("task-100")).toBe(false)
  })

  it("Dashboard: mitItemTemplate muestra badge sutil (1/3)", () => {
    const html = mitItemTemplate(task, false)
    expect(html).toContain("1/3")
    expect(html).toContain("📋")
    expect(html).toContain('data-action="toggle-subtasks-expand"')
    expect(html).not.toContain("Subtarea uno")
  })

  it("Dashboard: mitItemTemplate muestra subtareas cuando isExpanded es true", () => {
    const html = mitItemTemplate(task, true)
    expect(html).toContain("1/3")
    expect(html).toContain("Subtarea uno")
    expect(html).toContain("Subtarea dos")
    expect(html).toContain('data-action="toggle-subtask"')
    expect(html).toContain('data-subtask-id="sub-1"')
    expect(html).toContain('data-subtask-id="sub-2"')
  })

  it("Dashboard: mitItemTemplate renderiza DOM real sin escapar etiquetas HTML", () => {
    const html = mitItemTemplate(task, true)
    expect(html).not.toContain("&lt;div")
    expect(html).not.toContain("&lt;button")
    expect(html).toContain('data-action="toggle-subtask"')
    expect(html).toContain('data-subtask-id="sub-1"')
  })

  it("Dashboard: mitItemTemplate ubica el badge a la derecha y añade padding a las subtareas", () => {
    const html = mitItemTemplate(task, true)
    expect(html).toContain("justify-between")
    expect(html).toContain("pl-4")
    expect(html).toContain("gap-3")
  })


  it("Tareas: taskCardTemplate incluye barra de subtareas y botón acordeón", () => {
    const htmlColapsed = taskCardTemplate(task, null, false)
    expect(htmlColapsed).toContain("Subtareas 1/3")
    expect(htmlColapsed).toContain('data-action="toggle-subtasks-expand"')
    expect(htmlColapsed).not.toContain('data-subtask-id="sub-1"')

    const htmlExpanded = taskCardTemplate(task, null, true)
    expect(htmlExpanded).toContain("Subtareas 1/3")
    expect(htmlExpanded).toContain('data-action="toggle-subtasks-expand"')
    expect(htmlExpanded).toContain("Subtarea uno")
    expect(htmlExpanded).toContain("Subtarea dos")
    expect(htmlExpanded).toContain('data-subtask-id="sub-1"')
    expect(htmlExpanded).toContain('data-subtask-id="sub-2"')
  })

  it("Tareas: taskCardTemplate tiene espaciado frontal y checkbox más pequeño", () => {
    const htmlExpanded = taskCardTemplate(task, null, true)
    expect(htmlExpanded).toContain("w-3.5 h-3.5")
    expect(htmlExpanded).toMatch(/pl-[3-8]/)
  })

  it("TasksModule.toggleSubtask() alterna subtarea y emite eventos", () => {
    const module = new TasksModule(mockStorage, mockEventBus, null)
    module.tasks = [task]

    module.toggleSubtask("task-100", "sub-2")

    expect(task.subtasks[1].done).toBe(true)
    expect(mockEventBus.emit).toHaveBeenCalledWith("task:subtask-toggled", {
      taskId: "task-100",
      subtaskId: "sub-2",
      task
    })
    expect(mockEventBus.emit).toHaveBeenCalledWith("task:updated", task)
  })

  it("toggleSubtask() estampa createdAt/completedAt de ciclo (BC-010)", () => {
    const module = new TasksModule(mockStorage, mockEventBus, null)
    module.tasks = [task]

    const sub = task.addSubtask("Nueva")
    expect(sub.createdAt).toBeTypeOf("number")
    expect(sub.completedAt).toBeNull()

    module.toggleSubtask("task-100", sub.id)
    expect(sub.done).toBe(true)
    expect(sub.completedAt).toBeTypeOf("number")

    module.toggleSubtask("task-100", sub.id)
    expect(sub.done).toBe(false)
    expect(sub.completedAt).toBeNull()
  })
})
