/**
 * Storage Service - Maneja las operaciones de localStorage con soporte de migración de datos
 */

export class StorageService {
  static STORAGE_KEY = "dos-app-data-v2"
  static LEGACY_KEYS = [
    "tasks",
    "habits",
    "budgets",
    "notes",
    "dos-app-data-v1"
  ]

  constructor() {
    this.cache = null
  }

  /**
   * Inicializa el almacenamiento y migra datos heredados si es necesario
   */
  init() {
    const data = this._loadRaw()
    if (data) {
      data.budgets = this._migrateBudgets(data.budgets || [])
      this.cache = data
      return
    }

    // Intenta migrar desde el formato heredado
    const migrated = this._migrateLegacyData()
    if (migrated) {
      this.cache = migrated
      this.save(migrated)
      console.log("Data migrated from legacy format")
    } else {
      // Inicializa con datos vacíos
      this.cache = this._getEmptyData()
      this.save(this.cache)
    }
  }

  /**
   * Obtiene todos los datos
   * @returns {Object} Datos completos de la aplicación
   */
  getAll() {
    if (!this.cache) {
      this.init()
    }
    return { ...this.cache }
  }

  /**
   * Obtiene datos específicos del namespace
   * @param {string} namespace - Namespace de datos (tasks, habits, budgets, notes)
   * @returns {Array} Array de datos
   */
  get(namespace) {
    if (!this.cache) {
      this.init()
    }
    return this.cache[namespace] || []
  }

  /**
   * Guarda datos en un namespace
   * @param {string} namespace - Namespace de datos
   * @param {Array} data - Datos a guardar
   */
  set(namespace, data) {
    if (!this.cache) {
      this.init()
    }
    this.cache[namespace] = data
    this.save(this.cache)
  }

  /**
   * Guarda el objeto de datos completo
   * @param {Object} data - Objeto de datos completo
   */
  save(data) {
    try {
      localStorage.setItem(StorageService.STORAGE_KEY, JSON.stringify(data))
      this.cache = data
    } catch (e) {
      console.error("Error saving to localStorage:", e)
    }
  }

  /**
   * Exporta los datos como una cadena JSON
   * @returns {string} Datos JSON
   */
  exportData() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  /**
   * Importa datos desde una cadena JSON
   * @param {string} json - Datos JSON
   * @returns {boolean} Estado de éxito
   */
  importData(json) {
    try {
      const data = JSON.parse(json)
      if (this._validateData(data)) {
        this.save(data)
        return true
      }
      return false
    } catch (e) {
      console.error("Error importing data:", e)
      return false
    }
  }

  /**
   * Limpia todos los datos
   */
  clear() {
    this.cache = this._getEmptyData()
    this.save(this.cache)
  }

  /**
   * Restablece a los datos de demostración
   * @param {Object} demoData - Objeto de datos de demostración
   */
  resetToDemo(demoData) {
    this.save(demoData)
  }

  /**
   * Carga los datos crudos del almacenamiento
   * @private
   */
  _loadRaw() {
    try {
      const data = localStorage.getItem(StorageService.STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error("Error loading from localStorage:", e)
      return null
    }
  }

  /**
   * Migra desde claves separadas heredadas
   * @private
   */
  _migrateLegacyData() {
    const legacyData = {}
    let hasLegacy = false

    // Intenta con el formato v1 primero
    const v1Data = localStorage.getItem("dos-app-data-v1")
    if (v1Data) {
      try {
        const parsed = JSON.parse(v1Data)
        if (parsed.budgets || parsed.tasks || parsed.notes || parsed.habits) {
          parsed.budgets = this._migrateBudgets(parsed.budgets || [])
          return parsed
        }
      } catch (e) {
        console.warn("Failed to parse v1 data")
      }
    }

    // Intenta con claves separadas
    const keys = ["tasks", "habits", "budgets", "notes"]
    keys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          legacyData[key] = JSON.parse(data)
          hasLegacy = true
        } catch (e) {
          legacyData[key] = []
        }
      }
    })

    if (hasLegacy) {
      legacyData.budgets = this._migrateBudgets(legacyData.budgets || [])
    }

    return hasLegacy ? legacyData : null
  }

  /**
   * Migra presupuestos del formato viejo (con items) al nuevo (type/goalAmount/initialAmount)
   * @private
   */
  _migrateBudgets(budgets) {
    return budgets.map(budget => {
      if (budget.type) return budget
      const items = budget.items || []
      const initialAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
      const { items: _, ...rest } = budget
      return {
        ...rest,
        type: "spending",
        initialAmount,
        goalAmount: 0
      }
    })
  }

  /**
   * Valida la estructura de datos
   * @private
   */
  _validateData(data) {
    return (
      data &&
      Array.isArray(data.budgets) &&
      Array.isArray(data.tasks) &&
      Array.isArray(data.notes) &&
      Array.isArray(data.habits)
    )
  }

  /**
   * Obtiene la estructura de datos vacía
   * @private
   */
  _getEmptyData() {
    return {
      budgets: [],
      tasks: [],
      notes: [],
      habits: [],
      settings: {
        theme: "dark",
        currency: "MXN",
        firstDayOfWeek: 1,
        notificationsEnabled: false
      },
      version: "2.0.0"
    }
  }
}

// Instancia singleton
export const storage = new StorageService()
