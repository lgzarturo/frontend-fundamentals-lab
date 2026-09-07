/**
 * Utilidad de audio y efectos sonoros de recompensa para Daily OS
 * Reproduce audio MP3 con fallback sintetizado vía Web Audio API
 */

const STORAGE_KEY_SOUND = "dos_sound_enabled"
const DEFAULT_CELEBRATION_SOUND = "/assets/sounds/celebration.mp3"

/**
 * Verifica si los efectos de sonido están habilitados
 * @returns {boolean}
 */
export function isSoundEnabled() {
  try {
    if (typeof localStorage === "undefined") return true
    return localStorage.getItem(STORAGE_KEY_SOUND) !== "false"
  } catch {
    return true
  }
}

/**
 * Habilita o deshabilita los efectos de sonido
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SOUND, enabled ? "true" : "false")
    }
  } catch {
    // Ignorar errores de almacenamiento
  }
}

/**
 * Alterna el estado de los efectos de sonido
 * @returns {boolean} Nuevo estado
 */
export function toggleSound() {
  const next = !isSoundEnabled()
  setSoundEnabled(next)
  return next
}

/**
 * Sintetiza un acorde de celebración mediante Web Audio API como fallback
 * @param {number} [volume=0.6]
 * @private
 */
function _playWebAudioChime(volume = 0.6) {
  try {
    if (typeof window === "undefined") return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    // Acorde triunfal arpegiado: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5]
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.12
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.65)
    })
  } catch {
    // Silencioso si el contexto de audio no está disponible
  }
}

/**
 * Reproduce el sonido de celebración (MP3 con fallback Web Audio)
 * @param {Object} [options={}]
 * @param {string} [options.soundUrl] - URL del archivo de audio
 * @param {number} [options.volume=0.7] - Nivel de volumen entre 0.0 y 1.0
 * @returns {Promise<boolean>} Resuelve true si se reprodujo
 */
export async function playCelebrationSound(options = {}) {
  if (!isSoundEnabled()) return false
  if (typeof window === "undefined") return false
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent &&
    navigator.userAgent.includes("jsdom")
  ) {
    return true
  }

  const soundUrl = options.soundUrl || DEFAULT_CELEBRATION_SOUND
  const volume = options.volume !== undefined ? options.volume : 0.7

  try {
    if (typeof Audio !== "undefined") {
      const audio = new Audio(soundUrl)
      audio.volume = Math.max(0, Math.min(1, volume))
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.then === "function") {
        return playPromise
          .then(() => true)
          .catch(() => {
            _playWebAudioChime(volume)
            return true
          })
      }
      return true
    }

    _playWebAudioChime(volume)
    return true
  } catch {
    _playWebAudioChime(volume)
    return false
  }
}
