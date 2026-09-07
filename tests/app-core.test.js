/**
 * Pruebas de integración del core DOSApp y la fachada pública
 * usada por los handlers inline (onclick="app...") de index.html
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DOSApp } from "../assets/js/core/app.js"

const FIXTURE = `
  <div id="home-screen" class="screen">
    <div id="home-mits-list"></div>
    <div id="home-habits-list"></div>
    <span id="home-habits-streak"></span>
    <span id="home-tasks-done"></span>
    <span id="home-budget-remaining"></span>
    <span id="home-notes-count"></span>
    <div id="home-recent-activity"></div>
  </div>
  <div id="budgets-screen" class="screen">
    <div id="budgets-list"></div>
  </div>
  <div id="tasks-screen" class="screen">
    <div id="tasks-list"></div>
  </div>
  <div id="habits-screen" class="screen">
    <span id="habits-current-streak"></span>
    <span id="habits-completion-rate"></span>
    <div id="habits-list"></div>
  </div>
  <div id="notes-screen" class="screen">
    <div id="notes-list"></div>
  </div>
  <div id="settings-screen" class="screen">
    <input type="checkbox" id="theme-toggle" />
  </div>
  <nav>
    <button class="nav-btn" data-screen="home"></button>
    <button class="nav-btn" data-screen="tasks"></button>
  </nav>
  <div id="modal-backdrop" class="hidden">
    <div id="modal-content"></div>
  </div>
  <div id="toast-container"></div>
  <div id="undo-toast" class="hidden">
    <span id="undo-message"></span>
  </div>
  <span id="current-date"></span>
  <span id="hit-counter"></span>
`

const i18nStub = {
  currentLanguage: "es",
  getMessage: key => key,
  t: key => key,
  applyTranslations: () => {}
}

function createApp() {
  const app = new DOSApp()
  app.i18n = i18nStub
  return app
}

describe("DOSApp core", () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = FIXTURE
    vi.stubGlobal("confirm", () => true)
    URL.createObjectURL = vi.fn(() => "blob:mock")
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("debería inicializar los cinco módulos", async () => {
    const app = createApp()
    await app.init()

    expect(Object.keys(app.modules).sort()).toEqual([
      "budgets",
      "habits",
      "home",
      "notes",
      "tasks"
    ])
  })

  it("debería navegar entre pantallas y persistir la actual", async () => {
    const app = createApp()
    await app.init()

    app.navigateTo("tasks")

    const tasksScreen = document.getElementById("tasks-screen")
    expect(tasksScreen.classList.contains("active")).toBe(true)
    expect(
      document.getElementById("home-screen").classList.contains("active")
    ).toBe(false)
    expect(localStorage.getItem("currentScreen")).toBe("tasks")
  })

  it("debería exponer la fachada usada por los handlers inline", async () => {
    const app = createApp()
    await app.init()

    const facadeMethods = [
      "navigateTo",
      "showCreateBudgetModal",
      "showCreateTaskModal",
      "showCreateNoteModal",
      "showHabitTemplatesModal",
      "filterTasks",
      "searchNotes",
      "closeModal",
      "performUndo",
      "toggleTheme",
      "exportData",
      "showImportModal",
      "resetToDemo",
      "clearAllData"
    ]
    facadeMethods.forEach(method => {
      expect(typeof app[method]).toBe("function")
    })
  })

  it("debería abrir el modal de detalles con la acción view-details", async () => {
    const app = createApp()
    await app.init()
    app.navigateTo("budgets")

    app.modules.budgets.createBudget({
      name: "Ahorro Test",
      currency: "MXN",
      type: "savings",
      goalAmount: 1000
    })

    const detailsBtn = document.querySelector('[data-action="view-details"]')
    expect(detailsBtn).not.toBeNull()

    detailsBtn.click()

    const backdrop = document.getElementById("modal-backdrop")
    expect(backdrop.classList.contains("hidden")).toBe(false)
    expect(document.getElementById("modal-content").innerHTML).toContain(
      "Ahorro Test"
    )
  })

  it("debería filtrar tareas desde la fachada filterTasks", async () => {
    const app = createApp()
    await app.init()
    app.navigateTo("tasks")

    const today = new Date().toISOString().slice(0, 10)
    app.modules.tasks.createTask({
      title: "Tarea de hoy",
      dueDate: today,
      priority: "medium"
    })
    app.modules.tasks.createTask({
      title: "Tarea sin fecha",
      priority: "medium"
    })

    app.filterTasks("today")

    expect(app.modules.tasks.activeFilter).toBe("today")
    const listHtml = document.getElementById("tasks-list").innerHTML
    expect(listHtml).toContain("Tarea de hoy")
    expect(listHtml).not.toContain("Tarea sin fecha")
  })

  it("debería buscar notas desde la fachada searchNotes", async () => {
    const app = createApp()
    await app.init()
    app.navigateTo("notes")

    app.modules.notes.createNote({ title: "Alpha", bodyMarkdown: "hola" })
    app.modules.notes.createNote({ title: "Beta", bodyMarkdown: "adios" })

    app.searchNotes("hola")

    const listHtml = document.getElementById("notes-list").innerHTML
    expect(listHtml).toContain("Alpha")
    expect(listHtml).not.toContain("Beta")
  })

  it("debería actualizar las estadísticas de hábitos al renderizar", async () => {
    const app = createApp()
    await app.init()
    app.navigateTo("habits")

    const habit = app.modules.habits.createHabit({ title: "Correr" })
    app.modules.habits.toggleHabit(habit.id)

    const streakEl = document.getElementById("habits-current-streak")
    const rateEl = document.getElementById("habits-completion-rate")
    expect(streakEl.textContent).toContain("1")
    expect(rateEl.textContent).toBe("100%")
  })

  it("debería completar MITs y hábitos desde la vista de inicio", async () => {
    const app = createApp()
    await app.init()
    app.navigateTo("home")

    const today = new Date().toISOString().slice(0, 10)
    app.modules.tasks.createTask({
      title: "MIT importante",
      dueDate: today,
      priority: "high"
    })
    app.modules.habits.createHabit({ title: "Leer" })
    app.modules.home.render()

    const taskBtn = document.querySelector(
      '#home-screen [data-action="toggle-task"]'
    )
    expect(taskBtn).not.toBeNull()
    taskBtn.click()
    expect(app.modules.tasks.tasks[0].done).toBe(true)

    const habitBtn = document.querySelector(
      '#home-screen [data-action="toggle-habit"]'
    )
    expect(habitBtn).not.toBeNull()
    habitBtn.click()
    expect(app.modules.habits.habits[0].isCompletedToday()).toBe(true)
  })
})

describe("DOSApp gestión de datos", () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = FIXTURE
    vi.stubGlobal("confirm", () => true)
    URL.createObjectURL = vi.fn(() => "blob:mock")
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("debería recargar módulos al importar sin duplicar listeners", async () => {
    const app = createApp()
    await app.init()

    const listenersBefore = app.eventBus.events["task:create"].length

    const imported = {
      budgets: [],
      tasks: [
        {
          id: "t1",
          title: "Tarea importada",
          description: "",
          dueDate: "",
          priority: "medium",
          tags: [],
          subtasks: [],
          done: false,
          order: 0
        }
      ],
      notes: [],
      habits: []
    }
    const success = app.importData(JSON.stringify(imported))

    expect(success).toBe(true)
    expect(app.modules.tasks.tasks.length).toBe(1)
    expect(app.modules.tasks.tasks[0].title).toBe("Tarea importada")
    expect(app.eventBus.events["task:create"].length).toBe(listenersBefore)
  })

  it("debería restablecer a los datos de demostración", async () => {
    const app = createApp()
    await app.init()

    app.modules.tasks.createTask({
      title: "Tarea temporal",
      priority: "medium"
    })
    app.resetToDemo()

    expect(app.modules.budgets.budgets.length).toBe(2)
    expect(app.modules.tasks.tasks.length).toBe(2)
    expect(app.modules.habits.habits.length).toBe(2)
    expect(app.modules.notes.notes.length).toBe(1)
  })

  it("debería borrar todos los datos", async () => {
    const app = createApp()
    await app.init()

    app.modules.tasks.createTask({
      title: "Tarea temporal",
      priority: "medium"
    })
    app.clearAllData()

    expect(app.modules.tasks.tasks.length).toBe(0)
    expect(app.modules.budgets.budgets.length).toBe(0)
  })

  it("debería alternar y cargar el tema", async () => {
    const app = createApp()
    await app.init()

    localStorage.setItem("theme", "light")
    app.toggleTheme()

    expect(localStorage.getItem("theme")).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    app.loadTheme()
    expect(document.getElementById("theme-toggle").checked).toBe(true)

    app.toggleTheme()
    expect(localStorage.getItem("theme")).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("debería exportar datos sin lanzar errores", async () => {
    const app = createApp()
    await app.init()

    expect(() => app.exportData()).not.toThrow()
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it("debería mostrar el modal de importación con selector de archivo", async () => {
    const app = createApp()
    await app.init()

    app.showImportModal()

    expect(document.getElementById("import-file-input")).not.toBeNull()
    expect(document.getElementById("import-confirm-btn")).not.toBeNull()
  })
})
