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
