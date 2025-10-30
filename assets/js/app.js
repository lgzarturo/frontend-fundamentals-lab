/**
 * Configuración de TailwindCSS para el tema personalizado XP
 * @type {object}
 */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        xp: {
          primary: "#0acc71ff",
          secondary: "#0099ff",
          danger: "#ff0055",
          warning: "#ffaa00",
          dark: "#0a0e1a",
          darker: "#05070f",
          card: "#131829"
        }
      }
    }
  }
}

/**
 * Genera un ID único simple
 * @returns {string} ID único generado
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Formatea una fecha en formato AAAA-MM-DD
 * @param {Date|string} date Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
  if (typeof date === "string") return date
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Escapa caracteres HTML especiales en un string
 * @param {string} text Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Lanza una animación de confeti en la pantalla
 */
function launchConfetti() {
  const width = window.innerWidth
  const height = window.innerHeight
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
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
    "#0099ff",
    "#ff0055",
    "#ffaa00",
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
    particles.forEach((p) => {
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

/** Fecha actual y formato string */
const today = new Date()
const todayStr = formatDate(today)

/** Pantalla actual */
let currentScreen = "home"

/** Visitas */
let visitCount = 0

/** Espacio de nombres para el localStorage */
const localStorageNamespace = "app_habits_v1"

/**
 * Renderiza la pantalla de inicio con las tareas MIT (Most Important Tasks)
 * Filtra, ordena y muestra las 3 tareas más importantes no completadas
 */
function home() {
  const mits = app.tasks
    .filter((t) => !t.done && (t.priority === "high" || t.dueDate === todayStr))
    .sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1
      if (b.priority === "high" && a.priority !== "high") return 1
      return 0
    })
    .slice(0, 3)
  console.log("Tareas MIT para hoy:", mits)
  // Generar el HTML para la lista de MITs
  // TODO: Mejorar el diseño visual de las tareas MIT
  const mitsHtml =
    mits.length > 0
      ? mits
          .map(
            (task) => `
            <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
                <button onclick="app.toggleTask('${task.id}')"
                    class="mt-1 w-6 h-6 rounded border-2 border-xp-primary flex items-center justify-center flex-shrink-0 hover:bg-xp-primary/20 transition-colors">
                    ${
                      task.done
                        ? '<span class="text-xp-primary text-lg">✓</span>'
                        : ""
                    }
                </button>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold ${
                      task.done ? "line-through opacity-60" : ""
                    }">${escapeHtml(task.title)}</div>
                    ${
                      task.description
                        ? `<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">${escapeHtml(
                            task.description
                          )}</div>`
                        : ""
                    }
                    ${
                      task.tags.length > 0
                        ? `
                        <div class="flex gap-1 mt-2 flex-wrap">
                            ${task.tags
                              .map(
                                (tag) =>
                                  `<span class="text-xs px-2 py-1 bg-xp-primary/20 text-xp-primary rounded">${escapeHtml(
                                    tag
                                  )}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
                ${
                  task.priority === "high"
                    ? '<span class="text-xp-danger text-xl">⚡</span>'
                    : ""
                }
            </div>
        `
          )
          .join("")
      : '<div class="text-gray-500 dark:text-gray-400 text-center py-8">No tasks for today. Create some MITs! 🎯</div>'
  // Insertar el HTML generado en el contenedor correspondiente
  document.getElementById("home-mits-list").innerHTML = mitsHtml
}

/**
 * Renderiza la pantalla actual según el estado
 */
function render() {
  console.log("Renderizando la pantalla:", currentScreen)
  switch (currentScreen) {
    case "home":
      console.log("Tareas actuales:", app.tasks)
      home()
      break
    // Otros casos para diferentes pantallas
  }
}

/**
 * Objeto para gestionar el almacenamiento local (localStorage)
 * @type {object}
 */
const store = {
  /**
   * Inicializa el almacenamiento con datos de ejemplo si no existen
   * @param {string} namespace Espacio de nombres para el localStorage
   * */
  init: function (namespace) {
    if (!localStorage.getItem(namespace)) {
      this.save(this.dummyTasks)
    }
  },
  /**
   * Guarda datos en el localStorage
   * @param {any} data Datos a guardar
   * @param {string} namespace Espacio de nombres para el localStorage
   * */
  save: function (data, namespace) {
    if (data instanceof Array === true) {
      localStorage.setItem(namespace, JSON.stringify(data))
      return
    }
    try {
      const dataNumber = Number(data)
      localStorage.setItem(namespace, dataNumber)
    } catch (e) {
      console.error("Error saving data to localStorage:", e)
    }
    return
  },
  /**
   * Carga las tareas desde el localStorage
   * @param {string} namespace Espacio de nombres para el localStorage
   * @param {string} typeData Tipo de dato a cargar: "array" o "number"
   * */
  load: function (namespace, typeData = "array") {
    const data = localStorage.getItem(namespace)
    switch (typeData) {
      case "number":
        try {
          const dataNumber = Number(data)
          console.log("Es un número válido:", dataNumber)
          visitCount = dataNumber
        } catch (e) {
          console.error("Error loading numeric data from localStorage:", e)
        }
        break
      case "array":
      default:
        if (data) {
          app.tasks = JSON.parse(data)
        }
        break
    }
    return
  },
  loadCounter: function () {
    store.load("visit_counter", "number")
    visitCount += 1
    store.save(visitCount, "visit_counter")
  },
  /**
   * Datos con tareas de ejemplo
   * @type {Array<object>}
   */
  dummyTasks: [
    {
      id: generateId(),
      title: "Define 3 MITs for today",
      description: "Plan the most important tasks during breakfast",
      dueDate: todayStr,
      priority: "high",
      tags: ["planning", "morning"],
      subtasks: [],
      done: false,
      order: 1
    },
    {
      id: generateId(),
      title: "Complete first deep work block",
      description: "60-minute focused coding session",
      dueDate: todayStr,
      priority: "high",
      tags: ["deepwork", "coding"],
      subtasks: [
        { id: generateId(), text: "Review yesterday's progress", done: false },
        { id: generateId(), text: "Work on main feature", done: false },
        { id: generateId(), text: "Commit and push changes", done: false }
      ],
      done: false,
      order: 2
    },
    {
      id: generateId(),
      title: "Learning block: New JavaScript patterns",
      description: "30-45 minutes of focused learning",
      dueDate: todayStr,
      priority: "medium",
      tags: ["learning", "javascript"],
      subtasks: [],
      done: false,
      order: 3
    },
    {
      id: generateId(),
      title: "End of day review",
      description: "Review accomplishments and plan tomorrow",
      dueDate: todayStr,
      priority: "medium",
      tags: ["planning", "review"],
      subtasks: [],
      done: false,
      order: 4
    },
    {
      id: generateId(),
      title: "Refactor authentication module",
      description: "Improve code quality and add tests",
      dueDate: formatDate(new Date(today.getTime() + 86400000)),
      priority: "high",
      tags: ["coding", "refactor"],
      subtasks: [],
      done: false,
      order: 5
    }
  ]
}

/**
 * Objeto principal de la aplicación
 * @type {object}
 */
const app = {
  /** Inicializa la app y navega a la pantalla principal */
  init: function () {
    // Al ejecutar por primera vez se deben de crear los datos iniciales.
    store.init(localStorageNamespace)
    store.load(localStorageNamespace, "array")
    app.visitCounter()
    this.navigateTo("home")
  },
  /**
   * Navega a la pantalla indicada y actualiza el estado visual
   * @param {string} screen Pantalla destino
   */
  navigateTo: function (screen) {
    console.log("Navegando a la pantalla:", screen)
    currentScreen = screen
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"))
    const screenEl = document.getElementById(`${screen}-screen`)
    if (screenEl) screenEl.classList.add("active")
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      if (btn.dataset.screen === screen) {
        btn.classList.add(
          "bg-xp-primary",
          "text-xp-darker",
          "dark:bg-xp-primary",
          "dark:text-xp-darker"
        )
        btn.classList.remove(
          "bg-gray-200",
          "dark:bg-xp-card",
          "text-gray-700",
          "dark:text-gray-300"
        )
      } else {
        btn.classList.remove(
          "bg-xp-primary",
          "text-xp-darker",
          "dark:bg-xp-primary",
          "dark:text-xp-darker"
        )
        btn.classList.add(
          "bg-gray-200",
          "dark:bg-xp-card",
          "text-gray-700",
          "dark:text-gray-300"
        )
      }
    })
    render()
  },
  /**
   * Estado inicial de la aplicación
   * @type {Array<object>}
   */
  tasks: [],
  toggleTask: function (taskId) {
    console.log("Toggling task with ID:", taskId)
    alert("No se ha implementado esta función")
  },
  visitCounter: function () {
    store.loadCounter()
    document.getElementById("hit-counter").textContent = visitCount
    launchConfetti()
    if (visitCount % 10 === 0) {
      // Lanzar confeti cada 10 visitas
    }
  }
}

/**
 * Inicializa la app, modo oscuro y seguimiento de analíticas
 */
window.addEventListener("load", () => {
  app.init()
  // Modo oscuro según preferencia del usuario o sistema
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  )
  // Preferencias de tema (ejemplo, se puede mejorar)
  localStorage.theme = "light"
  localStorage.theme = "dark"
  localStorage.removeItem("theme")
  console.log("Página cargada. Iniciando seguimiento de analíticas...")
  // Evento personalizado para Google Analytics 4 vía Tag Manager
  document.addEventListener("DOMContentLoaded", function () {
    // Medición de clics en enlaces para GA4
    document.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "click_link",
            link_url: link.href,
            link_content: link.textContent.trim()
          })
        }
      })
    })
  })
})
