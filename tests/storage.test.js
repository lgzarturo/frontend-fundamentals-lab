/**
 * Pruebas para el servicio de almacenamiento
 */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { StorageService } from "../assets/js/services/storage.js"

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock

describe("StorageService", () => {
  let storage

  beforeEach(() => {
    vi.clearAllMocks()
    storage = new StorageService()
  })

  it("debería inicializar con datos vacíos", () => {
    localStorageMock.getItem.mockReturnValue(null)
    storage.init()

    expect(localStorageMock.setItem).toHaveBeenCalled()
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(savedData.budgets).toEqual([])
    expect(savedData.tasks).toEqual([])
  })

  it("debería cargar datos existentes", () => {
    const existingData = {
      budgets: [{ id: "1", name: "Test" }],
      tasks: [],
      notes: [],
      habits: [],
      settings: {},
      version: "2.0.0"
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
    storage.init()

    expect(storage.get("budgets")).toHaveLength(1)
  })

  it("debería guardar y recuperar datos", () => {
    localStorageMock.getItem.mockReturnValue(null)
    storage.init()

    storage.set("budgets", [{ id: "1", name: "Test Budget" }])
    const budgets = storage.get("budgets")

    expect(budgets).toHaveLength(1)
    expect(budgets[0].name).toBe("Test Budget")
  })

  it("debería exportar datos como JSON", () => {
    const testData = {
      budgets: [],
      tasks: [],
      notes: [],
      habits: []
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testData))
    storage.init()

    const exported = storage.exportData()
    expect(JSON.parse(exported)).toEqual(testData)
  })

  it("debería validar datos importados", () => {
    localStorageMock.getItem.mockReturnValue(null)
    storage.init()

    const validImport = JSON.stringify({
      budgets: [],
      tasks: [],
      notes: [],
      habits: []
    })

    expect(storage.importData(validImport)).toBe(true)

    const invalidImport = JSON.stringify({ budgets: "invalid" })
    expect(storage.importData(invalidImport)).toBe(false)
  })

  describe("contadores de uso (FR-001)", () => {
    const baseData = { budgets: [], tasks: [], notes: [], habits: [] }
    const lastSaved = () => {
      const calls = localStorageMock.setItem.mock.calls
      return JSON.parse(calls[calls.length - 1][1])
    }

    it("debería devolver usage en cero con almacenamiento vacío", () => {
      localStorageMock.getItem.mockReturnValue(null)
      storage.init()

      expect(storage.getUsage()).toEqual({ visits: 0, interactions: 0 })
      expect(lastSaved().usage).toEqual({ visits: 0, interactions: 0 })
    })

    it("debería devolver ceros sin lanzar error si los datos v2 no tienen usage", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(baseData))
      storage.init()

      expect(() => storage.getUsage()).not.toThrow()
      expect(storage.getUsage()).toEqual({ visits: 0, interactions: 0 })
    })

    it("debería completar con cero el campo faltante de usage parcial", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...baseData, usage: { visits: 3 } })
      )
      storage.init()

      expect(storage.getUsage()).toEqual({ visits: 3, interactions: 0 })
    })

    it("debería importar datos sin usage y devolver true", () => {
      localStorageMock.getItem.mockReturnValue(null)
      storage.init()

      expect(storage.importData(JSON.stringify(baseData))).toBe(true)
      expect(storage.getUsage()).toEqual({ visits: 0, interactions: 0 })
    })

    it("debería conservar usage al importar datos que lo incluyen", () => {
      localStorageMock.getItem.mockReturnValue(null)
      storage.init()

      const json = JSON.stringify({
        ...baseData,
        usage: { visits: 7, interactions: 4 }
      })

      expect(storage.importData(json)).toBe(true)
      expect(storage.getUsage()).toEqual({ visits: 7, interactions: 4 })
    })

    it("debería rechazar importación inválida sin alterar usage", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...baseData, usage: { visits: 2, interactions: 1 } })
      )
      storage.init()

      expect(storage.importData(JSON.stringify({ budgets: "x" }))).toBe(false)
      expect(storage.getUsage()).toEqual({ visits: 2, interactions: 1 })
    })

    it("debería incrementar interacciones en 1 y persistir", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...baseData, usage: { visits: 0, interactions: 4 } })
      )
      storage.init()
      localStorageMock.setItem.mockClear()

      storage.incrementInteractions()

      expect(storage.getUsage().interactions).toBe(5)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
      expect(lastSaved().usage.interactions).toBe(5)
    })

    it("debería incrementar interacciones desde datos sin usage", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(baseData))
      storage.init()

      storage.incrementInteractions()
      storage.incrementInteractions()

      expect(storage.getUsage().interactions).toBe(2)
      expect(lastSaved().usage.interactions).toBe(2)
    })

    it("debería persistir las visitas con setVisits", () => {
      localStorageMock.getItem.mockReturnValue(null)
      storage.init()
      localStorageMock.setItem.mockClear()

      storage.setVisits(7)

      expect(storage.getUsage().visits).toBe(7)
      expect(lastSaved().usage.visits).toBe(7)
    })

    it("debería no escribir en localStorage si setVisits recibe el mismo valor", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...baseData, usage: { visits: 7, interactions: 0 } })
      )
      storage.init()
      localStorageMock.setItem.mockClear()

      storage.setVisits(7)

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it("debería no alterar interacciones al llamar setVisits", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ ...baseData, usage: { visits: 1, interactions: 9 } })
      )
      storage.init()

      storage.setVisits(2)

      expect(storage.getUsage()).toEqual({ visits: 2, interactions: 9 })
    })
  })
})
