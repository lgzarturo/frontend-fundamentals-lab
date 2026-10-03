/**
 * Pruebas del resumen narrativo y la telemetría local de uso (BC-006)
 *
 * Contrato de claves (supuesto): buildSummary devuelve claves i18n completas
 * `app.screens.home.summary.<nombre>[.one|.other]`; los plurales usan `.one`
 * cuando el conteo es 1 y `.other` en cualquier otro caso.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventBus } from "../assets/js/core/eventBus.js"
import { StorageService } from "../assets/js/services/storage.js"
import { HomeModule } from "../assets/js/modules/home/index.js"
import { buildSummary } from "../assets/js/modules/home/summary.js"
import { getTodayString } from "../assets/js/utils/date.js"

const P = "app.screens.home.summary."
const today = getTodayString()
const usage = { visits: 7, interactions: 4 }

const task = (over = {}) => ({
  id: String(Math.random()),
  title: "t",
  done: false,
  dueDate: "",
  ...over
})
const habit = (over = {}) => ({ id: String(Math.random()), title: "h", ...over })
const savings = (goalAmount, amount, name = "Viaje") => ({
  id: String(Math.random()),
  name,
  type: "savings",
  goalAmount,
  initialAmount: 0,
  transactions: amount === undefined ? [] : [{ amount, description: "d" }]
})

const run = (over = {}) =>
  buildSummary({
    tasks: [],
    habits: [],
    budgets: [],
    usage,
    today,
    ...over
  })

describe("buildSummary", () => {
  describe("estructura", () => {
    it("debería devolver una entrada {key, params} por área en orden tareas, presupuestos, hábitos, uso", () => {
      const result = run()

      expect(result).toHaveLength(4)
      result.forEach(r => {
        expect(typeof r.key).toBe("string")
        expect(r.key.startsWith(P)).toBe(true)
        expect(typeof r.params).toBe("object")
      })
      expect(result[0].key).toBe(P + "tasksNone")
      expect(result[1].key).toBe(P + "budgetNone")
      expect(result[2].key).toBe(P + "habitsNone")
      expect(result[3].key).toBe(P + "usage")
    })
  })

  describe("tareas", () => {
    it("debería usar tasksToday.other con n=3 para 3 pendientes de hoy", () => {
      const tasks = [1, 2, 3].map(() => task({ dueDate: today }))
      expect(run({ tasks })[0]).toEqual({ key: P + "tasksToday.other", params: { n: 3 } })
    })

    it("debería usar la variante one con 1 tarea pendiente de hoy", () => {
      const tasks = [task({ dueDate: today })]
      expect(run({ tasks })[0]).toEqual({ key: P + "tasksToday.one", params: { n: 1 } })
    })

    it("debería ignorar tareas hechas al contar las de hoy", () => {
      const tasks = [task({ dueDate: today }), task({ dueDate: today, done: true })]
      expect(run({ tasks })[0]).toEqual({ key: P + "tasksToday.one", params: { n: 1 } })
    })

    it("debería usar tasksPending.other con el total pendiente si ninguna es de hoy", () => {
      const tasks = [task(), task({ dueDate: "2000-01-01" }), task({ done: true })]
      expect(run({ tasks })[0]).toEqual({ key: P + "tasksPending.other", params: { n: 2 } })
    })

    it("debería usar tasksPending.one con 1 pendiente que no es de hoy", () => {
      expect(run({ tasks: [task()] })[0]).toEqual({
        key: P + "tasksPending.one",
        params: { n: 1 }
      })
    })

    it("debería usar tasksNone si todas las tareas están hechas", () => {
      const tasks = [task({ done: true, dueDate: today })]
      expect(run({ tasks })[0].key).toBe(P + "tasksNone")
    })

    it("debería usar tasksNone sin tareas", () => {
      expect(run()[0].key).toBe(P + "tasksNone")
    })
  })

  describe("presupuestos", () => {
    it("debería reportar percent=50 con meta 200 y balance 100", () => {
      const r = run({ budgets: [savings(200, 100)] })[1]
      expect(r.key).toBe(P + "budgetProgress")
      expect(r.params.percent).toBe(50)
    })

    it("debería incluir el nombre del presupuesto en params.name", () => {
      const r = run({ budgets: [savings(200, 100, "Casa")] })[1]
      expect(r.params.name).toBe("Casa")
    })

    it("debería acotar percent a 100 cuando el balance supera la meta", () => {
      const r = run({ budgets: [savings(100, 500)] })[1]
      expect(r.key).toBe(P + "budgetProgress")
      expect(r.params.percent).toBe(100)
    })

    it("debería resumir el presupuesto de ahorro con mayor progreso", () => {
      const budgets = [savings(100, 20, "A"), savings(100, 80, "B"), savings(100, 50, "C")]
      const r = run({ budgets })[1]
      expect(r.params).toMatchObject({ name: "B", percent: 80 })
    })

    it("debería usar budgetNone si solo hay presupuestos de gasto", () => {
      const spending = {
        name: "Gasto",
        type: "spending",
        initialAmount: 100,
        goalAmount: 0,
        transactions: []
      }
      expect(run({ budgets: [spending] })[1].key).toBe(P + "budgetNone")
    })

    it("debería ignorar ahorros con goalAmount 0", () => {
      expect(run({ budgets: [savings(0, 50)] })[1].key).toBe(P + "budgetNone")
    })

    it("debería reportar percent=0 para un ahorro sin transacciones", () => {
      const r = run({ budgets: [savings(100)] })[1]
      expect(r.key).toBe(P + "budgetProgress")
      expect(r.params.percent).toBe(0)
    })
  })

  describe("hábitos", () => {
    it("debería usar habitsToday.other con done/total de varios hábitos", () => {
      const habits = [
        habit({ dailyRecords: { [today]: true } }),
        habit({ dailyRecords: { [today]: false } }),
        habit()
      ]
      expect(run({ habits })[2]).toEqual({
        key: P + "habitsToday.other",
        params: { done: 1, total: 3 }
      })
    })

    it("debería usar habitsToday.one con un único hábito", () => {
      const habits = [habit({ dailyRecords: { [today]: true } })]
      expect(run({ habits })[2]).toEqual({
        key: P + "habitsToday.one",
        params: { done: 1, total: 1 }
      })
    })

    it("debería contar 0 completados si solo hay registros de otros días", () => {
      const habits = [habit({ dailyRecords: { "2000-01-01": true } }), habit()]
      expect(run({ habits })[2].params).toEqual({ done: 0, total: 2 })
    })

    it("debería usar habitsNone sin hábitos", () => {
      expect(run()[2].key).toBe(P + "habitsNone")
    })
  })

  describe("uso", () => {
    it("debería pasar visits e interactions en params", () => {
      expect(run()[3]).toEqual({
        key: P + "usage",
        params: { visits: 7, interactions: 4 }
      })
    })

    it("debería reflejar ceros", () => {
      const r = run({ usage: { visits: 0, interactions: 0 } })[3]
      expect(r.params).toEqual({ visits: 0, interactions: 0 })
    })
  })

  describe("entradas inválidas", () => {
    it("debería ser pura: no mutar las entradas", () => {
      const tasks = [task({ dueDate: today })]
      const budgets = [savings(200, 100)]
      const snapshot = JSON.stringify({ tasks, budgets })
      run({ tasks, budgets })
      expect(JSON.stringify({ tasks, budgets })).toBe(snapshot)
    })

    it("debería tolerar usage ausente usando ceros", () => {
      const r = run({ usage: undefined })[3]
      expect(r.params).toEqual({ visits: 0, interactions: 0 })
    })
  })
})

describe("HomeModule telemetría (FR-002, FR-003)", () => {
  let storage
  let eventBus
  let i18n
  let home

  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = '<div id="home-screen"><div id="home-summary"></div></div>'
    storage = new StorageService()
    storage.init()
    eventBus = new EventBus()
    i18n = { t: vi.fn(k => k), getMessage: vi.fn(k => k) }
    home = new HomeModule(storage, eventBus, i18n)
  })

  const EVENTS = [
    "task:created",
    "task:toggled",
    "task:updated",
    "habit:toggled",
    "budget:created",
    "note:created"
  ]

  EVENTS.forEach(evt => {
    it(`debería incrementar interactions en 1 y persistir al emitir ${evt}`, () => {
      home.init()
      eventBus.emit(evt, {})

      expect(storage.getUsage().interactions).toBe(1)
      const saved = JSON.parse(localStorage.getItem(StorageService.STORAGE_KEY))
      expect(saved.usage.interactions).toBe(1)
    })
  })

  it("debería pasar de 4 a 5 interacciones al emitir task:created", () => {
    storage.save({ ...storage.getAll(), usage: { visits: 0, interactions: 4 } })
    home.init()
    eventBus.emit("task:created", {})

    expect(storage.getUsage().interactions).toBe(5)
  })

  it("debería acumular una interacción por cada evento emitido", () => {
    home.init()
    EVENTS.forEach(evt => eventBus.emit(evt, {}))
    expect(storage.getUsage().interactions).toBe(6)
  })

  it("no debería contar task:subtask-toggled ni eventos ajenos", () => {
    home.init()
    eventBus.emit("task:subtask-toggled", {})
    eventBus.emit("task:deleted", {})
    expect(storage.getUsage().interactions).toBe(0)
  })

  it("debería incrementar antes de re-renderizar el resumen", () => {
    home.init()
    eventBus.emit("task:created", {})
    const usageCall = i18n.t.mock.calls.find(([k]) => k === P + "usage")
    expect(usageCall?.[1]).toMatchObject({ interactions: 1 })
  })

  it("debería copiar totalVisits de dos_visit_tracker a usage.visits en init", () => {
    localStorage.setItem(
      "dos_visit_tracker",
      JSON.stringify({ totalVisits: 7, lastVisitDate: today })
    )
    home.init()

    expect(storage.getUsage().visits).toBe(7)
  })

  it("debería dejar visits en 0 si no hay datos del tracker", () => {
    home.init()
    expect(storage.getUsage().visits).toBe(0)
  })

  it("debería pintar cuatro frases en #home-summary al renderizar (FR-004)", () => {
    storage.set("tasks", [task({ dueDate: today })])
    home.init()
    home.render()

    const el = document.getElementById("home-summary")
    expect(el.textContent).toContain(P + "usage")
    const keys = i18n.t.mock.calls.map(([k]) => k)
    expect(keys).toEqual(
      expect.arrayContaining([
        P + "tasksToday.one",
        P + "budgetNone",
        P + "habitsNone",
        P + "usage"
      ])
    )
  })

  it("debería no fallar si #home-summary no existe", () => {
    document.body.innerHTML = '<div id="home-screen"></div>'
    home.init()
    expect(() => home.render()).not.toThrow()
  })
})

describe("HomeModule visitas: orden de arranque real (FR-003)", () => {
  let storage
  let eventBus
  let i18n
  let home

  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = '<div id="home-screen"><div id="home-summary"></div></div>'
    storage = new StorageService()
    storage.init()
    eventBus = new EventBus()
    i18n = { t: vi.fn(k => k), getMessage: vi.fn(k => k) }
    home = new HomeModule(storage, eventBus, i18n)
  })

  const setTracker = totalVisits =>
    localStorage.setItem(
      "dos_visit_tracker",
      JSON.stringify({ totalVisits, lastVisitDate: today })
    )

  it("debería reflejar la visita registrada después de init al renderizar (7 -> 8)", () => {
    setTracker(7)
    home.init()
    setTracker(8) // VisitTracker.recordVisit() corre después de HomeModule.init()
    home.render()

    expect(storage.getUsage().visits).toBe(8)
    const usageCall = i18n.t.mock.calls.find(([k]) => k === P + "usage")
    expect(usageCall?.[1]).toMatchObject({ visits: 8 })
  })

  it("debería mostrar visits 1 en la primera carga (sin tracker en init)", () => {
    home.init()
    expect(storage.getUsage().visits).toBe(0)
    setTracker(1)
    home.render()

    expect(storage.getUsage().visits).toBe(1)
    const usageCall = i18n.t.mock.calls.find(([k]) => k === P + "usage")
    expect(usageCall?.[1]).toMatchObject({ visits: 1 })
  })
})

describe("HomeModule resumen: markup y escape (FR-004)", () => {
  let storage
  let i18n
  let home

  // i18n stub que interpola {param}
  const interpolate = (key, params = {}) =>
    `${key.split(".").pop()}:` +
    Object.entries(params).map(([k, v]) => `${k}=${v}`).join(",")

  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = '<div id="home-screen"><div id="home-summary"></div></div>'
    storage = new StorageService()
    storage.init()
    i18n = { t: vi.fn(interpolate), getMessage: vi.fn(k => k) }
    home = new HomeModule(storage, new EventBus(), i18n)
  })

  it("debería renderizar exactamente cuatro <p> con el texto esperado", () => {
    storage.set("tasks", [task({ dueDate: today }), task({ dueDate: today })])
    storage.set("habits", [habit({ dailyRecords: { [today]: true } }), habit()])
    storage.set("budgets", [savings(200, 100, "Casa")])
    storage.save({ ...storage.getAll(), usage: { visits: 3, interactions: 2 } })
    home.init()
    home.render()

    const ps = document.querySelectorAll("#home-summary p")
    expect(ps).toHaveLength(4)
    expect(ps[0].textContent).toBe("other:n=2")
    expect(ps[1].textContent).toContain("name=Casa")
    expect(ps[1].textContent).toContain("percent=50")
    expect(ps[2].textContent).toBe("other:done=1,total=2")
    expect(ps[3].textContent).toContain("interactions=2")
  })

  it("debería escapar un nombre de presupuesto con HTML (XSS)", () => {
    const evil = "<img src=x onerror=alert(1)>"
    storage.set("budgets", [savings(100, 50, evil)])
    home.init()
    home.render()

    const el = document.getElementById("home-summary")
    expect(el.querySelector("img")).toBeNull()
    expect(el.textContent).toContain("<img")
  })
})

describe("StorageService.setVisits con valores inválidos", () => {
  let storage

  beforeEach(() => {
    localStorage.clear()
    storage = new StorageService()
    storage.init()
  })

  it.each([[NaN], [undefined]])("debería dejar visits en 0 con %s", value => {
    storage.setVisits(value)
    expect(storage.getUsage().visits).toBe(0)
    const saved = JSON.parse(localStorage.getItem(StorageService.STORAGE_KEY))
    expect([undefined, 0]).toContain(saved.usage?.visits)
  })

  it.each([[NaN], [undefined]])("no debería escribir de nuevo al repetir %s", value => {
    const spy = vi.spyOn(storage, "save")
    storage.setVisits(value)
    storage.setVisits(value)
    expect(spy.mock.calls.length).toBeLessThanOrEqual(1)
    expect(storage.getUsage().visits).toBe(0)
  })
})

describe("Locales summary (FR-006)", () => {
  const read = f =>
    JSON.parse(readFileSync(resolve(process.cwd(), `assets/locales/${f}.json`), "utf8"))
  const flatten = (o, p = "") =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === "object" ? flatten(v, `${p}${k}.`) : [[`${p}${k}`, v]]
    )
  const summaryOf = l => l.app?.screens?.home?.summary

  const REQUIRED = [
    "tasksToday.one", "tasksToday.other", "tasksPending.one", "tasksPending.other",
    "tasksNone", "budgetProgress", "budgetNone", "habitsToday.one",
    "habitsToday.other", "habitsNone", "usage"
  ]

  it("debería tener las mismas claves bajo summary en es y en", () => {
    const es = summaryOf(read("es"))
    const en = summaryOf(read("en"))
    expect(es).toBeDefined()
    expect(en).toBeDefined()
    expect(flatten(es).map(([k]) => k).sort()).toEqual(flatten(en).map(([k]) => k).sort())
  })

  it("debería definir todas las claves que emite buildSummary con texto no vacío", () => {
    ;["es", "en"].forEach(lang => {
      const map = Object.fromEntries(flatten(summaryOf(read(lang)) || {}))
      REQUIRED.forEach(k => {
        expect(typeof map[k], `${lang}:${k}`).toBe("string")
        expect(map[k].length, `${lang}:${k}`).toBeGreaterThan(0)
      })
    })
  })

  it("debería usar los mismos placeholders en es y en por clave", () => {
    const ph = s => (s.match(/\{\{?\w+\}?\}/g) || []).sort()
    const es = Object.fromEntries(flatten(summaryOf(read("es")) || {}))
    const en = Object.fromEntries(flatten(summaryOf(read("en")) || {}))
    expect(Object.keys(es).length).toBeGreaterThan(0)
    Object.keys(es).forEach(k => expect(ph(es[k]), k).toEqual(ph(en[k] || "")))
  })
})

describe("Alcance local (FR-007)", () => {
  const FILES = [
    "assets/js/modules/home/summary.js",
    "assets/js/modules/home/index.js",
    "assets/js/modules/home/templates.js",
    "assets/js/services/storage.js"
  ]

  FILES.forEach(f => {
    it(`no debería contener fetch, XMLHttpRequest ni sendBeacon en ${f}`, () => {
      const src = readFileSync(resolve(process.cwd(), f), "utf8")
      expect(src).not.toMatch(/\bfetch\b|XMLHttpRequest|sendBeacon/)
    })
  })
})
