/**
 * Persistencia del estado expandido/colapsado de subtareas en LocalStorage
 */

const STORAGE_KEY = "dos_subtasks_expanded"

/**
 * Obtiene el conjunto de IDs de tareas con subtareas expandidas
 * @returns {Set<string>}
 */
export function getExpandedSubtaskIds() {
  try {
    if (typeof localStorage === "undefined") return new Set()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

/**
 * Comprueba si las subtareas de una tarea están expandidas
 * @param {string} taskId
 * @returns {boolean}
 */
export function isSubtaskExpanded(taskId) {
  return getExpandedSubtaskIds().has(taskId)
}

/**
 * Alterna el estado expandido/colapsado de las subtareas de una tarea
 * @param {string} taskId
 * @returns {boolean} Nuevo estado expandido
 */
export function toggleSubtaskExpanded(taskId) {
  const ids = getExpandedSubtaskIds()
  if (ids.has(taskId)) {
    ids.delete(taskId)
  } else {
    ids.add(taskId)
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
    }
  } catch {
    // Ignorar errores en entornos con almacenamiento restringido
  }
  return ids.has(taskId)
}
