import { playCelebrationSound } from "./sound.js"

/**
 * Lanza una animación de confeti en la pantalla y reproduce sonido de recompensa
 * @param {Object} [options={}]
 * @param {boolean} [options.playSound=true] - Si reproduce el sonido de celebración
 * @returns {void}
 */
export function launchConfetti({ playSound = true } = {}) {
  if (playSound) {
    playCelebrationSound()
  }
  const width = window.innerWidth
  const height = window.innerHeight
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent &&
    navigator.userAgent.includes("jsdom")
  ) {
    return
  }
  const canvas = document.createElement("canvas")
  let context = null
  try {
    context = canvas.getContext ? canvas.getContext("2d") : null
  } catch {
    return
  }
  // Guarda: entornos sin soporte de canvas 2d (p. ej. jsdom en tests)
  if (!context) return
  canvas.width = width
  canvas.height = height
  canvas.style.position = "fixed"
  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.pointerEvents = "none"
  canvas.style.opacity = "0"
  canvas.style.transition = "opacity 0.6s"
  canvas.style.zIndex = "9999"
  document.body.appendChild(canvas)
  // Fade-in al cargar
  setTimeout(() => {
    canvas.style.opacity = "1"
  }, 10)

  const particles = []
  const colors = [
    "#0acc71",
    "#007acc",
    "#ff0055",
    "#b57800",
    "#ffffff",
    "#888888",
    "#4526b6ff",
    "#ff00ff",
    "#00ffff"
  ]
  const shapes = ["rect", "ellipse", "diamond", "triangle"]
  for (let i = 0; i < 300; i++) {
    // Spread explosivo: ángulo y velocidad
    const angle = Math.random() * Math.PI * 5
    const speed = Math.random() * 8 + 2
    // Figuras aleatorias
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    const w = Math.random() * 12 + 8
    const h = Math.random() * 4 + 2
    // Desplazamiento inicial aleatorio para evitar círculo denso
    const radius = Math.random() * 18 // dispersión inicial (px)
    const offsetX = Math.cos(angle) * radius
    const offsetY = Math.sin(angle) * radius
    particles.push({
      x: width / 2 + offsetX,
      y: height / 2 + offsetY,
      w,
      h,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      amplitude: Math.random() * 40 + 20,
      freq: Math.random() * 0.04 + 0.06,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      gravity: 0.12,
      swayPhase: Math.random() * Math.PI * 2,
      shape,
      reachedPeak: false
    })
  }

  let time = 0
  const duration = 300

  /**
   * Función de animación del confeti
   * Actualiza la posición y el estado de cada partícula
   * @return {void}
   */
  function animate() {
    context.clearRect(0, 0, width, height)
    particles.forEach(p => {
      // Spread explosivo, parabólico y balanceo
      // Detectar el pico (cuando la velocidad vertical cambia de negativa a positiva)
      if (!p.reachedPeak && p.speedY > 0) {
        p.reachedPeak = true
      }
      // Movimiento horizontal y vertical
      if (p.reachedPeak) {
        p.x += p.speedX + Math.sin(time * p.freq + p.swayPhase) * 0.8
      } else {
        p.x += p.speedX
      }
      p.y += p.speedY
      p.speedY += p.gravity
      p.rotation += p.rotationSpeed

      context.save()
      context.translate(p.x, p.y)
      context.rotate((p.rotation * Math.PI) / 180)
      context.fillStyle = p.color
      // Dibuja la figura correspondiente
      if (p.shape === "rect") {
        context.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      } else if (p.shape === "ellipse") {
        context.beginPath()
        context.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, 2 * Math.PI)
        context.fill()
      } else if (p.shape === "diamond") {
        context.beginPath()
        context.moveTo(0, -p.h / 2)
        context.lineTo(p.w / 2, 0)
        context.lineTo(0, p.h / 2)
        context.lineTo(-p.w / 2, 0)
        context.closePath()
        context.fill()
      } else if (p.shape === "triangle") {
        context.beginPath()
        context.moveTo(0, -p.h / 2)
        context.lineTo(p.w / 2, p.h / 2)
        context.lineTo(-p.w / 2, p.h / 2)
        context.closePath()
        context.fill()
      }
      context.restore()
    })
    time++
    if (time < duration) {
      requestAnimationFrame(animate)
    } else {
      // Fade-out antes de remover
      canvas.style.opacity = "0"
      setTimeout(() => {
        if (canvas.parentNode) document.body.removeChild(canvas)
      }, 600)
    }
  }

  animate()
}
