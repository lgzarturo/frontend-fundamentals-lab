/**
 * Funciones de utilidad de HTML
 */

/**
 * Escapa los caracteres especiales de HTML
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
export function escapeHtml(text) {
  if (typeof text !== "string") return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Tagged template para HTML con escape automático
 * Respeta fragmentos seguros marcados con raw() ({ __html })
 * @param {TemplateStringsArray} strings - Partes estáticas del template
 * @param {...any} values - Valores interpolados
 * @returns {string} HTML generado
 */
export function html(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i]
    if (value === undefined || value === null) {
      return result + string
    }
    if (value && typeof value === "object" && value.__html !== undefined) {
      return result + string + value.__html
    }
    if (Array.isArray(value)) {
      const joined = value
        .map(v => {
          if (v === undefined || v === null) return ""
          if (v && typeof v === "object" && v.__html !== undefined) {
            return v.__html
          }
          if (typeof v === "string") return escapeHtml(v)
          return String(v)
        })
        .join("")
      return result + string + joined
    }
    if (typeof value === "string") {
      return result + string + escapeHtml(value)
    }
    return result + string + String(value)
  }, "")
}

/**
 * Marca una cadena como HTML seguro sin escapar
 * @param {any} value - Contenido a marcar como seguro
 * @returns {{ __html: string }}
 */
export function raw(value) {
  if (value && typeof value === "object" && value.__html !== undefined) {
    return value
  }
  if (Array.isArray(value)) {
    return {
      __html: value
        .map(v =>
          v && typeof v === "object" && v.__html !== undefined
            ? v.__html
            : String(v ?? "")
        )
        .join("")
    }
  }
  return { __html: value === null || value === undefined ? "" : String(value) }
}

/**
 * Crea un elemento HTML a partir de una cadena
 * @param {string} html - Cadena HTML
 * @returns {HTMLElement} Elemento creado
 */
export function createElementFromHtml(html) {
  const template = document.createElement("template")
  template.innerHTML = html.trim()
  return template.content.firstChild
}

/**
 * Establece el contenido de texto de forma segura
 * @param {HTMLElement} element - Elemento objetivo
 * @param {string} text - Texto a establecer
 */
export function setTextContent(element, text) {
  if (element) {
    element.textContent = text
  }
}

/**
 * Establece el contenido HTML de forma segura
 * @param {HTMLElement} element - Elemento objetivo
 * @param {string} html - HTML a establecer
 */
export function setHtmlContent(element, html) {
  if (element) {
    element.innerHTML = html
  }
}
