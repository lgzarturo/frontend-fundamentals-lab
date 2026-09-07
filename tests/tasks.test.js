import { beforeEach, describe, expect, it, vi } from "vitest"
import { Subtask, Task } from "../assets/js/modules/tasks/models.js"
import { TasksModule } from "../assets/js/modules/tasks/index.js"

// Mock de document.createElement para escapeHtml (jsdom lo provee, pero html.js lo usa)
// getTodayString depende de Date, la controlamos donde sea necesario

describe("Subtask", () => {
  it("debería crear con valores predeterminados", () => {
    const s = new Subtask({ text: "Hacer algo" })
    expect(s.text).toBe("Hacer algo")
    expect(s.done).toBe(false)
    expect(s.id).toBeDefined()
  })

  it("debería serializar a JSON y restaurar", () => {
    const s = new Subtask({ text: "Paso 1", done: true })
    const json = s.toJSON()
    const restored = Subtask.fromJSON(json)
    expect(restored.text).toBe("Paso 1")
    expect(restored.done).toBe(true)
    expect(restored.id).toBe(s.id)
  })
})

describe("Task - constructor", () => {
  it("debería crear con valores predeterminados", () => {
    const t = new Task({ title: "Mi tarea" })
    expect(t.title).toBe("Mi tarea")
    expect(t.description).toBe("")
    expect(t.priority).toBe("medium")
    expect(t.done).toBe(false)
    expect(t.order).toBe(0)
    expect(t.tags).toEqual([])
    expect(t.subtasks).toEqual([])
    expect(t.id).toBeDefined()
    expect(t.createdAt).toBeTypeOf("number")
    expect(t.updatedAt).toBeTypeOf("number")
  })

  it("debería mapear subtasks crudos a instancias Subtask", () => {
    const t = new Task({
      title: "T",
      subtasks: [{ id: "x", text: "sub", done: false }]
    })
    expect(t.subtasks[0]).toBeInstanceOf(Subtask)
  })
})

describe("Task - isToday()", () => {
  it("debería retornar true cuando dueDate es hoy", () => {
    // Usamos getTodayString() para que coincida con la implementación (fecha local)
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const t = new Task({ title: "T", dueDate: today })
    expect(t.isToday()).toBe(true)
  })

  it("debería retornar false cuando dueDate no es hoy", () => {
    const t = new Task({ title: "T", dueDate: "2000-01-01" })
    expect(t.isToday()).toBe(false)
  })
})

describe("Task - isMIT()", () => {
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  it("done=true + priority=high → NO es MIT", () => {
    const t = new Task({ title: "T", priority: "high", done: true })
    expect(t.isMIT()).toBe(false)
  })

  it("done=false + priority=high → ES MIT", () => {
    const t = new Task({ title: "T", priority: "high", done: false })
    expect(t.isMIT()).toBe(true)
  })

  it("done=false + dueDate=hoy → ES MIT", () => {
    const t = new Task({
      title: "T",
      priority: "low",
      dueDate: today,
      done: false
    })
    expect(t.isMIT()).toBe(true)
  })

  it("done=true + dueDate=hoy → NO es MIT", () => {
    const t = new Task({
      title: "T",
      priority: "low",
      dueDate: today,
      done: true
    })
    expect(t.isMIT()).toBe(false)
  })
})

describe("Task - toggle()", () => {
  it("debería invertir done y actualizar updatedAt", () => {
    const t = new Task({ title: "T" })
    const before = t.updatedAt
    t.toggle()
    expect(t.done).toBe(true)
    expect(t.updatedAt).toBeGreaterThanOrEqual(before)
    t.toggle()
    expect(t.done).toBe(false)
  })
})

describe("Task - subtask operations", () => {
  let task

  beforeEach(() => {
    task = new Task({ title: "T" })
  })

  it("addSubtask() agrega y retorna Subtask", () => {
    const s = task.addSubtask("paso 1")
    expect(s).toBeInstanceOf(Subtask)
    expect(task.subtasks).toHaveLength(1)
    expect(task.subtasks[0].text).toBe("paso 1")
  })

  it("toggleSubtask() invierte done de la subtarea", () => {
    const s = task.addSubtask("paso 1")
    task.toggleSubtask(s.id)
    expect(task.subtasks[0].done).toBe(true)
    task.toggleSubtask(s.id)
    expect(task.subtasks[0].done).toBe(false)
  })

  it("removeSubtask() elimina y retorna la subtarea", () => {
    const s = task.addSubtask("paso 1")
    const removed = task.removeSubtask(s.id)
    expect(removed.id).toBe(s.id)
    expect(task.subtasks).toHaveLength(0)
  })

  it("removeSubtask() con ID inexistente retorna null", () => {
    expect(task.removeSubtask("nope")).toBeNull()
  })

  it("getSubtaskProgress() retorna 0 sin subtareas", () => {
    expect(task.getSubtaskProgress()).toBe(0)
  })

  it("getSubtaskProgress() retorna % correcto", () => {
    const s1 = task.addSubtask("a")
    task.addSubtask("b")
    task.toggleSubtask(s1.id)
    expect(task.getSubtaskProgress()).toBe(50)
  })
})

describe("Task.validate()", () => {
  it("debería rechazar título vacío", () => {
    const errors = Task.validate({ title: "", priority: "medium" })
    expect(errors).toContain("Title is required")
  })

  it("debería aceptar prioridades válidas", () => {
    for (const p of ["low", "medium", "high"]) {
      const errors = Task.validate({ title: "T", priority: p })
      expect(errors).not.toContain("Priority must be low, medium or high")
    }
  })

  it("debería rechazar prioridad inválida", () => {
    const errors = Task.validate({ title: "T", priority: "critical" })
    expect(errors).toContain("Priority must be low, medium or high")
  })

  it("debería rechazar dueDate con formato incorrecto", () => {
    const errors = Task.validate({
      title: "T",
      priority: "low",
      dueDate: "01/01/2025"
    })
    expect(errors.length).toBeGreaterThan(0)
  })

  it("debería aceptar dueDate vacío", () => {
    const errors = Task.validate({ title: "T", priority: "low", dueDate: "" })
    expect(errors).toHaveLength(0)
  })
})

describe("Task - serialización round-trip", () => {
  it("toJSON → fromJSON conserva todos los campos", () => {
    const original = new Task({
      title: "Test",
      description: "desc",
      dueDate: "2025-12-31",
      priority: "high",
      tags: ["trabajo", "urgente"],
      done: true,
      order: 3,
      createdAt: 1000
    })
    original.addSubtask("sub 1")
    // capturo updatedAt después de addSubtask porque muta el campo
    const expectedUpdatedAt = original.updatedAt

    const json = original.toJSON()
    const restored = Task.fromJSON(json)

    expect(restored.id).toBe(original.id)
    expect(restored.title).toBe("Test")
    expect(restored.description).toBe("desc")
    expect(restored.dueDate).toBe("2025-12-31")
    expect(restored.priority).toBe("high")
    expect(restored.tags).toEqual(["trabajo", "urgente"])
    expect(restored.done).toBe(true)
    expect(restored.order).toBe(3)
    expect(restored.createdAt).toBe(1000)
    expect(restored.updatedAt).toBe(expectedUpdatedAt)
    expect(restored.subtasks).toHaveLength(1)
    expect(restored.subtasks[0]).toBeInstanceOf(Subtask)
  })
})

describe("TasksModule", () => {
  let storage
  let eventBus
  let module

  beforeEach(() => {
    const store = {}
    storage = {
      get: vi.fn(key => store[key] ?? null),
      set: vi.fn((key, val) => {
        store[key] = val
      })
    }

    const listeners = {}
    eventBus = {
      on: vi.fn((event, cb) => {
        listeners[event] = listeners[event] || []
        listeners[event].push(cb)
      }),
      emit: vi.fn((event, data) => {
        ;(listeners[event] || []).forEach(cb => cb(data))
      })
    }

    module = new TasksModule(storage, eventBus, null)
    // init sin DOM: cargamos manualmente
    module._loadTasks()
  })

  it("debería iniciar con lista vacía", () => {
    expect(module.tasks).toHaveLength(0)
  })

  it("createTask() crea y persiste la tarea", () => {
    const task = module.createTask({ title: "Nueva", priority: "low" })
    expect(task.title).toBe("Nueva")
    expect(module.tasks).toHaveLength(1)
    expect(storage.set).toHaveBeenCalled()
  })

  it("createTask() emite task:created", () => {
    module.createTask({ title: "T", priority: "medium" })
    expect(eventBus.emit).toHaveBeenCalledWith("task:created", expect.any(Task))
  })

  it("createTask() lanza error si la validación falla", () => {
    expect(() => module.createTask({ title: "", priority: "medium" })).toThrow()
  })

  it("toggleTask() invierte done y emite task:toggled", () => {
    const task = module.createTask({ title: "T", priority: "low" })
    module.toggleTask(task.id)
    expect(module.tasks[0].done).toBe(true)
    expect(eventBus.emit).toHaveBeenCalledWith("task:toggled", expect.any(Task))
  })

  it("deleteTask() elimina la tarea y emite task:deleted", () => {
    const task = module.createTask({ title: "T", priority: "low" })
    module.deleteTask(task.id)
    expect(module.tasks).toHaveLength(0)
    expect(eventBus.emit).toHaveBeenCalledWith("task:deleted", expect.any(Task))
  })

  it('getFilteredTasks("all") retorna solo tareas pendientes (!done)', () => {
    const a = module.createTask({ title: "A", priority: "low" })
    const b = module.createTask({ title: "B", priority: "low" })
    module.toggleTask(b.id)
    const pending = module.getFilteredTasks("all")
    expect(pending).toHaveLength(1)
    expect(pending[0].id).toBe(a.id)
  })

  it('getFilteredTasks("today") retorna solo tareas de hoy pendientes (!done)', () => {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const a = module.createTask({
      title: "Hoy pendiente",
      dueDate: today,
      priority: "low"
    })
    const b = module.createTask({
      title: "Hoy completada",
      dueDate: today,
      priority: "low"
    })
    module.toggleTask(b.id)
    const todayTasks = module.getFilteredTasks("today")
    expect(todayTasks).toHaveLength(1)
    expect(todayTasks[0].id).toBe(a.id)
  })

  it("toggleTask() emite undo:show para permitir revertir la acción", () => {
    const task = module.createTask({ title: "T", priority: "low" })
    module.toggleTask(task.id)
    expect(eventBus.emit).toHaveBeenCalledWith(
      "undo:show",
      expect.objectContaining({
        message: expect.any(String),
        undoCallback: expect.any(Function)
      })
    )

    const undoCall = eventBus.emit.mock.calls.find(c => c[0] === "undo:show")
    undoCall[1].undoCallback()
    expect(module.tasks.find(t => t.id === task.id).done).toBe(false)
  })

  it("_updateFilterCounts() actualiza los contadores en los botones del DOM", () => {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const filtersContainer = document.createElement("div")
    filtersContainer.innerHTML = `
      <div id="tasks-filters">
        <button class="task-filter-btn" data-filter="all"><span class="filter-count-badge"></span></button>
        <button class="task-filter-btn" data-filter="today"><span class="filter-count-badge"></span></button>
        <button class="task-filter-btn" data-filter="high"><span class="filter-count-badge"></span></button>
        <button class="task-filter-btn" data-filter="completed"><span class="filter-count-badge"></span></button>
      </div>
    `
    document.body.appendChild(filtersContainer)
    module.container = document.createElement("div")

    module.createTask({ title: "T1", dueDate: today, priority: "high" })
    const t2 = module.createTask({
      title: "T2",
      dueDate: today,
      priority: "low"
    })
    module.toggleTask(t2.id)

    module._updateFilterCounts()

    const allCount = filtersContainer.querySelector(
      '[data-filter="all"] .filter-count-badge'
    )
    const todayCount = filtersContainer.querySelector(
      '[data-filter="today"] .filter-count-badge'
    )
    const highCount = filtersContainer.querySelector(
      '[data-filter="high"] .filter-count-badge'
    )
    const compCount = filtersContainer.querySelector(
      '[data-filter="completed"] .filter-count-badge'
    )

    expect(allCount.textContent).toBe("1")
    expect(todayCount.textContent).toBe("1")
    expect(highCount.textContent).toBe("1")
    expect(compCount.textContent).toBe("1")
    filtersContainer.remove()
  })

  it('getFilteredTasks("completed") retorna solo done', () => {
    module.createTask({ title: "A", priority: "low" })
    const b = module.createTask({ title: "B", priority: "low" })
    module.toggleTask(b.id)
    const completed = module.getFilteredTasks("completed")
    expect(completed).toHaveLength(1)
    expect(completed[0].id).toBe(b.id)
  })

  it('getFilteredTasks("high") retorna solo high+!done', () => {
    const a = module.createTask({ title: "A", priority: "high" })
    module.createTask({ title: "B", priority: "low" })
    const high = module.getFilteredTasks("high")
    expect(high).toHaveLength(1)
    expect(high[0].id).toBe(a.id)
  })

  it("getMITs() retorna hasta limit tareas MIT", () => {
    module.createTask({ title: "A", priority: "high" })
    module.createTask({ title: "B", priority: "high" })
    module.createTask({ title: "C", priority: "high" })
    module.createTask({ title: "D", priority: "high" })
    const mits = module.getMITs(3)
    expect(mits).toHaveLength(3)
  })

  it("reorderTasks() actualiza el campo order", () => {
    const a = module.createTask({ title: "A", priority: "low" })
    const b = module.createTask({ title: "B", priority: "low" })
    module.reorderTasks([b.id, a.id])
    expect(module.tasks.find(t => t.id === b.id).order).toBe(0)
    expect(module.tasks.find(t => t.id === a.id).order).toBe(1)
  })

  describe("getAllTags()", () => {
    it("debería retornar todas las etiquetas únicas ordenadas de las tareas", () => {
      module.createTask({
        title: "T1",
        priority: "medium",
        tags: ["backend", "api"]
      })
      module.createTask({
        title: "T2",
        priority: "medium",
        tags: ["api", "devops"]
      })
      expect(module.getAllTags()).toEqual(["api", "backend", "devops"])
    })

    it("debería incluir etiquetas de notas almacenadas si existen", () => {
      storage.get = vi.fn(key => {
        if (key === "notes") return [{ tags: ["nota-tag"] }]
        return null
      })
      module.createTask({
        title: "T1",
        priority: "medium",
        tags: ["tarea-tag"]
      })
      expect(module.getAllTags()).toEqual(["nota-tag", "tarea-tag"])
    })
  })

  describe("Modales con TagInput", () => {
    let modalRoot

    beforeEach(() => {
      modalRoot = document.createElement("div")
      modalRoot.id = "modal-content"
      document.body.appendChild(modalRoot)
      module.modalContainer = modalRoot
      eventBus.on("modal:open", ({ contentHtml }) => {
        modalRoot.innerHTML = contentHtml
      })
    })

    afterEach(() => {
      modalRoot?.remove()
    })

    it("showCreateModal debería inicializar TagInput y procesar etiquetas", () => {
      module.showCreateModal()
      const widget = modalRoot.querySelector(".tag-input-widget")
      expect(widget).not.toBeNull()

      const input = modalRoot.querySelector(".tag-text-input")
      input.value = "nueva-tarea-tag"
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      )

      const form = modalRoot.querySelector("#create-task-form")
      form.querySelector('input[name="title"]').value = "Tarea con tag"
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )

      expect(module.tasks[0].title).toBe("Tarea con tag")
      expect(module.tasks[0].tags).toContain("nueva-tarea-tag")
    })

    it("showEditModal debería cargar las etiquetas existentes en TagInput", () => {
      const task = module.createTask({
        title: "Tarea editable",
        priority: "medium",
        tags: ["tarea-existente"]
      })
      module.showEditModal(task.id)

      const chip = modalRoot.querySelector(
        '.tag-chip[data-tag="tarea-existente"]'
      )
      expect(chip).not.toBeNull()

      const form = modalRoot.querySelector("#edit-task-form")
      form.querySelector('input[name="title"]').value = "Tarea actualizada"
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )

      expect(module.tasks[0].title).toBe("Tarea actualizada")
      expect(module.tasks[0].tags).toEqual(["tarea-existente"])
    })

    it("showCreateModal debería inicializar DueDatePicker y selector de prioridad", () => {
      module.showCreateModal()
      const dateWidget = modalRoot.querySelector(".due-date-picker-widget")
      const priorityWidget = modalRoot.querySelector(
        ".priority-selector-widget"
      )
      expect(dateWidget).not.toBeNull()
      expect(priorityWidget).not.toBeNull()

      const form = modalRoot.querySelector("#create-task-form")
      form.querySelector('input[name="title"]').value = "Tarea urgente hoy"

      const todayBtn = dateWidget.querySelector('[data-date-preset="today"]')
      todayBtn.click()

      const highRadio = priorityWidget.querySelector('input[value="high"]')
      highRadio.checked = true

      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )

      const created = module.tasks.find(t => t.title === "Tarea urgente hoy")
      expect(created).toBeDefined()
      expect(created.priority).toBe("high")
      expect(created.dueDate).toBeDefined()
      expect(created.isToday()).toBe(true)
    })
  })
})
