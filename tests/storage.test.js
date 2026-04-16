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
})
