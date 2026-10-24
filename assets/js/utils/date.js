/**
 * Funciones de utilidad de fecha
 */

let appTimezone = null

const FALLBACK_TIMEZONES = [
  "UTC",
  "America/Mexico_City",
  "America/Cancun",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Buenos_Aires",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland"
]

/**
 * Zona horaria configurada por el usuario o la del navegador por defecto
 * @returns {string} Nombre de zona IANA
 */
export function getAppTimezone() {
  if (appTimezone) return appTimezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

/**
 * Fija la zona horaria de la app. `null`/vacío restaura la del navegador.
 * @param {string|null} tz - Nombre de zona IANA
 */
export function setAppTimezone(tz) {
  appTimezone = typeof tz === "string" && tz ? tz : null
}

/**
 * Lista de zonas IANA disponibles para el selector de settings
 * @returns {string[]} Nombres de zona IANA
 */
export function listTimeZones() {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      const zones = Intl.supportedValuesOf("timeZone")
      if (Array.isArray(zones) && zones.length) {
        return zones.includes("UTC") ? zones : ["UTC", ...zones]
      }
    }
  } catch {
    // Continúa con la lista de respaldo
  }
  return [...FALLBACK_TIMEZONES]
}

function resolveTimeZone(timeZone) {
  return timeZone || getAppTimezone()
}

/**
 * Formatea una fecha a YYYY-MM-DD en la zona indicada
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} [timeZone] - Zona IANA (por defecto la configurada)
 * @returns {string} Fecha YYYY-MM-DD
 */
export function formatDateInTimezone(date, timeZone) {
  const tz = resolveTimeZone(timeZone)
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(date))
    const get = type => parts.find(p => p.type === type)?.value
    return `${get("year")}-${get("month")}-${get("day")}`
  } catch {
    return formatDate(date)
  }
}

/**
 * Formatea una fecha a una cadena YYYY-MM-DD
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (typeof date === "string") return date
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Parsea una cadena YYYY-MM-DD como fecha local.
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Fecha local
 */
export function parseDateStringLocal(dateString) {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Obtiene la fecha de hoy como cadena formateada
 * @param {string} [timeZone] - Zona IANA (por defecto la configurada)
 * @returns {string} Fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayString(timeZone) {
  return formatDateInTimezone(new Date(), timeZone)
}

/**
 * Obtiene los últimos N días como cadenas formateadas
 * @param {number} days - Número de días
 * @param {string} [timeZone] - Zona IANA (por defecto la configurada)
 * @returns {string[]} Array de cadenas de fecha
 */
export function getLastNDays(days, timeZone) {
  const result = []
  const today = parseDateStringLocal(
    formatDateInTimezone(new Date(), timeZone)
  )

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    result.push(formatDate(date))
  }

  return result
}

/**
 * Obtiene las fechas de la semana calendario de referencia.
 * @param {Date} referenceDate - Fecha dentro de la semana
 * @param {number} firstDayOfWeek - Día inicial: 0 domingo, 1 lunes
 * @param {string} [timeZone] - Zona IANA (por defecto la configurada)
 * @returns {string[]} Array de fechas YYYY-MM-DD
 */
export function getCurrentWeekDates(
  referenceDate = new Date(),
  firstDayOfWeek = 1,
  timeZone
) {
  const refDay =
    typeof referenceDate === "string"
      ? referenceDate
      : formatDateInTimezone(referenceDate, timeZone)
  const reference = parseDateStringLocal(refDay)
  const dayOffset = (reference.getDay() - firstDayOfWeek + 7) % 7
  const startDate = new Date(reference)
  startDate.setDate(reference.getDate() - dayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return formatDate(date)
  })
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
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      timeZone: getAppTimezone()
    })
  } catch {
    return new Date(timestamp).toLocaleDateString()
  }
}

/**
 * Genera registros pasados con tasa de éxito
 * @param {number} days - Número de días
 * @param {number} successRate - Tasa de éxito (0-1)
 * @returns {Object} Objeto de registros con claves de fecha
 */
/**
 * Cuenta días lun-vie en el rango inclusivo de fechas calendario.
 * @param {string} startYmd - Fecha inicial YYYY-MM-DD
 * @param {string} endYmd - Fecha final YYYY-MM-DD
 * @returns {number} Días hábiles (0 si el rango es inválido)
 */
export function countWeekdaysInclusive(startYmd, endYmd) {
  if (!startYmd || !endYmd || endYmd < startYmd) return 0
  let count = 0
  const current = parseDateStringLocal(startYmd)
  const end = parseDateStringLocal(endYmd)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export function generatePastRecords(days, successRate) {
  const records = {}
  for (const dateStr of getLastNDays(days)) {
    records[dateStr] = Math.random() < successRate
  }
  return records
}
