/**
 * Servicio de internacionalización (i18n)
 * Extraído del monolito legacy (app.js) como módulo ES
 */

/**
 * Clave de caché del service worker para los locales
 * @constant {string}
 */
const PWA_CACHE_NAME = "pwa-cache-v3"

/**
 * Idiomas soportados por la aplicación
 * @constant {string[]}
 */
const SUPPORTED_LANGUAGES = ["es", "en"]

class I18nService {
  constructor() {
    this.currentLanguage = "es"
    this.messages = {}
    this.eventBus = null
  }

  /**
   * Inicializa el servicio con el bus de eventos de la aplicación
   * @param {import("../core/eventBus.js").EventBus} eventBus - Bus de eventos
   * @param {string} defaultLang - Idioma por defecto si no se detecta otro
   * @returns {Promise<void>}
   */
  async init(eventBus, defaultLang = "es") {
    this.eventBus = eventBus

    const savedLang = localStorage.getItem("userLanguage")
    let detectedLang = savedLang
    if (!detectedLang && navigator.language) {
      detectedLang = navigator.language.split("-")[0]
    }
    if (!detectedLang || !SUPPORTED_LANGUAGES.includes(detectedLang)) {
      detectedLang = defaultLang
    }

    this.currentLanguage = detectedLang
    await this.loadMessages(this.currentLanguage)
    this.applyTranslations()
  }

  /**
   * Carga los mensajes traducidos para un idioma específico
   * Con fallback al idioma por defecto ("es") si falla la carga
   * @param {string} lang - Código del idioma a cargar (e.g., "es", "en")
   * @returns {Promise<void>}
   */
  async loadMessages(lang) {
    try {
      const response = await fetch(`/assets/locales/${lang}.json`)
      if (!response.ok) {
        throw new Error(
          `Error loading messages for ${lang}: ${response.status}`
        )
      }
      this.messages = await response.json()
    } catch (e) {
      console.error("Failed to load i18n messages:", e)
      if (lang !== "es") {
        const response = await fetch("/assets/locales/es.json")
        this.messages = await response.json()
      }
    }
  }

  /**
   * Establece el idioma actual, recarga los mensajes y notifica el cambio
   * @param {string} lang - Código del idioma a establecer
   * @returns {Promise<void>}
   */
  async setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return

    this.currentLanguage = lang
    localStorage.setItem("userLanguage", lang)
    await this.invalidateLocaleCache(lang)
    await this.loadMessages(lang)
    this.applyTranslations()
    this.eventBus?.emit("i18n:languageChanged", { language: lang })
  }

  /**
   * Invalida la caché del service worker para un locale
   * @param {string} lang - Código del idioma
   * @returns {Promise<void>}
   */
  async invalidateLocaleCache(lang) {
    if ("caches" in window) {
      const cache = await caches.open(PWA_CACHE_NAME)
      await cache.delete(`/assets/locales/${lang}.json`)
    }
  }

  /**
   * Obtiene el mensaje traducido por clave con interpolación de parámetros
   * Soporta placeholders básicos: "{nombre}" -> params.nombre
   * @param {string} key - Clave del mensaje (e.g., "ui.common.save")
   * @param {object} params - Parámetros para placeholders en el mensaje
   * @returns {string} Mensaje traducido o la clave si no existe
   */
  t(key, params = {}) {
    let message = key.split(".").reduce((obj, k) => obj?.[k], this.messages)
    if (message === undefined) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    if (params && typeof params === "object") {
      Object.keys(params).forEach(param => {
        message = message.replace(new RegExp(`{${param}}`, "g"), params[param])
      })
    }
    return message
  }

  /**
   * Aplica las traducciones a los elementos del DOM
   * Soporta data-i18n, data-i18n-placeholder y data-i18n-aria-label
   * @returns {void}
   */
  applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.getAttribute("data-i18n")
      const translation = this.t(key)
      const attr = element.getAttribute("data-i18n-attr") || "textContent"
      if (attr === "textContent") {
        element.textContent = translation
      } else {
        element.setAttribute(attr, translation)
      }
    })

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      const key = element.getAttribute("data-i18n-placeholder")
      element.setAttribute("placeholder", this.t(key))
    })

    document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
      const key = element.getAttribute("data-i18n-aria-label")
      element.setAttribute("aria-label", this.t(key))
    })

    const htmlRoot = document.getElementById("html-root")
    if (htmlRoot) htmlRoot.lang = this.currentLanguage
  }

  /**
   * Clona un template y aplica traducciones a los elementos con data-i18n
   * @param {string} templateId - El id del template a clonar
   * @returns {DocumentFragment|null} El fragmento clonado y traducido
   */
  cloneTemplateWithI18n(templateId) {
    const template = document.getElementById(templateId)
    if (!template) return null
    const clone = template.content.cloneNode(true)

    clone.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = this.t(el.getAttribute("data-i18n"))
    })

    return clone
  }

  /**
   * Alias de t() para compatibilidad con el contrato de los módulos
   * @param {string} key - Clave del mensaje
   * @param {object} params - Parámetros de interpolación
   * @returns {string} Mensaje traducido
   */
  getMessage(key, params = {}) {
    return this.t(key, params)
  }
}

// Instancia singleton
export const i18n = new I18nService()
