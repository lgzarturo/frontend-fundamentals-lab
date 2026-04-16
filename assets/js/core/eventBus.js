/**
 * EventBus - Emisor de eventos simple para la comunicación entre módulos
 */
export class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * Suscribirse a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Manejador del evento
   * @returns {Function} Función de cancelación de la suscripción
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)

    // Retorna la función de cancelación de la suscripción
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }

  /**
   * Suscribirse a un evento una sola vez
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Manejador del evento
   */
  once(event, callback) {
    const onceCallback = data => {
      callback(data)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  /**
   * Cancelar la suscripción a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Manejador del evento a eliminar
   */
  off(event, callback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  /**
   * Emitir un evento
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos a pasar a los manejadores
   */
  emit(event, data) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => {
      try {
        callback(data)
      } catch (err) {
        console.error(`Error in event handler for ${event}:`, err)
      }
    })
  }

  /**
   * Eliminar todos los manejadores de un evento
   * @param {string} event - Nombre del evento
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }
}

// Instancia singleton
export const eventBus = new EventBus()
