/**
 * Funciones de utilidad de fecha
 */

/**
 * Formatea una fecha a una cadena YYYY-MM-DD
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (typeof date === "string") return date
  const d = new Date(date)
  // Usar métodos UTC para evitar problemas de zona horaria
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha de hoy como cadena formateada
 * @returns {string} Fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayString() {
  return formatDate(new Date())
}

/**
 * Obtiene los últimos N días como cadenas formateadas
 * @param {number} days - Número de días
 * @returns {string[]} Array de cadenas de fecha
 */
export function getLastNDays(days) {
  const result = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    result.push(formatDate(date))
  }

  return result
}

/**
 * Obtiene la cadena de tiempo relativo desde el timestamp
 * @param {number} timestamp - Timestamp en milisegundos
 * @returns {string} Cadena de tiempo relativo
 */
export function getRelativeTime(timestamp, i18n) {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return i18n?.getMessage("label.justNow") || "Just now"
  if (minutes < 60)
    return `${minutes}m ${i18n?.getMessage("label.ago") || "ago"}`
  if (hours < 24) return `${hours}h ${i18n?.getMessage("label.ago") || "ago"}`
  if (days < 7) return `${days}d ${i18n?.getMessage("label.ago") || "ago"}`
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Genera registros pasados con tasa de éxito
 * @param {number} days - Número de días
 * @param {number} successRate - Tasa de éxito (0-1)
 * @returns {Object} Objeto de registros con claves de fecha
 */
export function generatePastRecords(days, successRate) {
  const records = {}
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = formatDate(date)
    records[dateStr] = Math.random() < successRate
  }

  return records
}
