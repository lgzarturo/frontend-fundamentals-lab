/**
 * Funciones de utilidad para la generación de IDs
 */

/**
 * Genera un ID único basado en timestamp y valor aleatorio
 * @returns {string} Identificador único
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Genera un lote de IDs únicos
 * @param {number} count - Número de IDs a generar
 * @returns {string[]} Array de IDs únicos
 */
export function generateIds(count) {
  return Array.from({ length: count }, () => generateId())
}

/**
 * Valida si una cadena es un formato de ID válido
 * @param {string} id - ID a validar
 * @returns {boolean} True si es válido
 */
export function isValidId(id) {
  return typeof id === "string" && id.length >= 10
}
