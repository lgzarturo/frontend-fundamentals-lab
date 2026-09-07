/**
 * VisitTracker - Servicio inteligente de seguimiento de visitas y rachas de uso continuo.
 * Monitorea las visitas en ventanas de 24 horas y celebra hitos cada 10 días seguidos.
 */
import { getTodayString } from "../utils/date.js"

export const DEFAULT_TRACKER_STORAGE_KEY = "dos_visit_tracker"

export class VisitTracker {
  /**
   * @param {string} [storageKey=DEFAULT_TRACKER_STORAGE_KEY]
   */
  constructor(storageKey = DEFAULT_TRACKER_STORAGE_KEY) {
    this.storageKey = storageKey
  }

  /**
   * Obtiene el estado actual almacenado o estado inicial
   * @returns {Object}
   */
  getState() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(this.storageKey)
        if (raw) return JSON.parse(raw)
      }
    } catch {
      // Ignorar errores de lectura
    }

    let legacyCount = 0
    try {
      if (typeof localStorage !== "undefined") {
        legacyCount = parseInt(localStorage.getItem("visit_counter"), 10) || 0
      }
    } catch {
      legacyCount = 0
    }

    return {
      lastVisitDate: null,
      lastVisitTimestamp: 0,
      currentStreak: legacyCount > 0 ? 1 : 0,
      maxStreak: legacyCount > 0 ? 1 : 0,
      totalActiveDays: legacyCount > 0 ? 1 : 0,
      totalVisits: legacyCount,
      milestonesCelebrated: []
    }
  }

  /**
   * Persiste el estado del contador y sincroniza con claves legacy
   * @param {Object} state
   */
  saveState(state) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(state))
        localStorage.setItem("visit_counter", String(state.totalVisits || 0))
      }
    } catch {
      // Ignorar fallos de cuota o persistencia en entornos restringidos
    }
  }

  /**
   * Registra una visita evaluando la ventana de 24 horas y racha diaria continua
   * @param {string} [today=getTodayString()] - Fecha local YYYY-MM-DD
   * @returns {Object} Resumen de métricas actualizadas
   */
  recordVisit(today = getTodayString()) {
    const state = this.getState()
    const now = Date.now()
    const lastDate = state.lastVisitDate

    let isNewDay = false
    let isContinuousStreak = false
    let milestoneReached = false
    let milestoneValue = 0

    if (!lastDate) {
      // Primera visita del usuario
      isNewDay = true
      state.currentStreak = 1
      state.maxStreak = 1
      state.totalActiveDays = 1
      state.totalVisits = (state.totalVisits || 0) + 1
      state.lastVisitDate = today
      state.lastVisitTimestamp = now
    } else if (lastDate === today) {
      // Visita dentro de la misma ventana de 24h (mismo día calendario)
      isNewDay = false
      state.lastVisitTimestamp = now
      if (!state.currentStreak) state.currentStreak = 1
      if (!state.maxStreak) state.maxStreak = 1
      if (!state.totalActiveDays) state.totalActiveDays = 1
      if (!state.totalVisits) state.totalVisits = 1
    } else {
      const diffDays = this._getDaysDifference(lastDate, today)

      if (diffDays === 1) {
        // Uso continuo en días consecutivos
        isNewDay = true
        isContinuousStreak = true
        state.currentStreak = (state.currentStreak || 0) + 1
        if (state.currentStreak > (state.maxStreak || 0)) {
          state.maxStreak = state.currentStreak
        }
        state.totalActiveDays = (state.totalActiveDays || 0) + 1
        state.totalVisits = (state.totalVisits || 0) + 1
        state.lastVisitDate = today
        state.lastVisitTimestamp = now

        // Comprobar hito de cada 10 días seguidos (10, 20, 30...)
        state.milestonesCelebrated = state.milestonesCelebrated || []
        if (
          state.currentStreak > 0 &&
          state.currentStreak % 10 === 0 &&
          !state.milestonesCelebrated.includes(state.currentStreak)
        ) {
          milestoneReached = true
          milestoneValue = state.currentStreak
          state.milestonesCelebrated.push(state.currentStreak)
        }
      } else if (diffDays > 1) {
        // Racha interrumpida: se reinicia la racha a 1
        isNewDay = true
        state.currentStreak = 1
        state.totalActiveDays = (state.totalActiveDays || 0) + 1
        state.totalVisits = (state.totalVisits || 0) + 1
        state.lastVisitDate = today
        state.lastVisitTimestamp = now
      } else {
        // Ajuste en caso de viaje o variación de huso horario local
        state.lastVisitTimestamp = now
      }
    }

    this.saveState(state)

    const streak = state.currentStreak || 0
    const rem = streak % 10
    const daysToNextMilestone = rem === 0 ? (streak === 0 ? 10 : 10) : 10 - rem
    const progressPercentage =
      rem === 0 && streak > 0 ? 100 : Math.round((rem / 10) * 100)

    return {
      currentStreak: state.currentStreak,
      maxStreak: state.maxStreak,
      totalActiveDays: state.totalActiveDays,
      totalVisits: state.totalVisits,
      lastVisitDate: state.lastVisitDate,
      isNewDay,
      isContinuousStreak,
      milestoneReached,
      milestoneValue,
      daysToNextMilestone,
      progressPercentage
    }
  }

  /**
   * Calcula la diferencia en días enteros entre dos fechas YYYY-MM-DD
   * @param {string} dateStr1
   * @param {string} dateStr2
   * @returns {number}
   * @private
   */
  _getDaysDifference(dateStr1, dateStr2) {
    if (!dateStr1 || !dateStr2) return 0
    const [y1, m1, d1] = dateStr1.split("-").map(Number)
    const [y2, m2, d2] = dateStr2.split("-").map(Number)
    const dt1 = new Date(y1, m1 - 1, d1)
    const dt2 = new Date(y2, m2 - 1, d2)
    const diffMs = dt2.getTime() - dt1.getTime()
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  }
}
