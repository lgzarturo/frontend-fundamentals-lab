/**
 * Clase principal de la aplicación DOSApp
 */
class DOSApp {
  constructor() {
    // Estado inicial
    this.currentScreen = "home"
    this.currentFilter = "all"
    this.undoStack = []
    this.storageKey = "dos-app-data-v1"

    // Datos de la aplicación
    this.state = {
      budgets: [],
      tasks: [],
      notes: [],
      habits: [],
      settings: {
        theme: "dark",
        currency: "MXN",
        firstDayOfWeek: 1,
        notificationsEnabled: false
      }
    }

    // Inicializa la aplicación
    this.init()
  }

  /**
   * Inicializa la aplicación DOSApp
   * Función de arranque que configura la aplicación al cargar
   */
  init() {
    console.log("DOSApp initialized")
    // Paso 1: Cargar datos de la aplicación del localStorage
    // Paso 2: Inicializar la interfaz de usuario (Theme, idioma, etc.)
    // Paso 3: Configurar eventos y listeners
    // Paso 4: Renderizar la pantalla inicial
    // Paso 5: Configurar auto-guardado periódico
    this.updateDateTime()
    setInterval(() => {
      console.log("Auto-guardado de datos")
      this.updateDateTime()
    }, 60000)
  }

  /**
   * Actualiza la fecha y hora mostrada en la interfaz de usuario
   * @returns {void}
   */
  updateDateTime() {
    const now = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
    // TODO: Obtener el idioma desde la configuración del usuario
    const dateStr = now.toLocaleDateString("en-US", options)
    const dateEl = document.getElementById("current-date")
    if (dateEl) dateEl.textContent = dateStr
  }
}

// Instancia global de la aplicación
const application = new DOSApp()

/**
 * Genera un identificador único basado en la fecha actual y un valor aleatorio.
 * Útil para asignar IDs a los elementos.
 * @returns {string} - ID único generado.
 * @example
 * const id = generateId(); // "kz7v1w8xg2"+
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Genera registros de éxito/fracaso para los últimos días
 * Se toma una tasa de éxito para determinar la probabilidad de éxito en cada día
 * @param {number} days - Número de días hacia atrás para generar registros
 * @param {number} successRate - Tasa de éxito (0 a 1)
 * @returns {object} Objeto con fechas como claves y resultados booleanos como valores
 * @example
 * const records = generatePastRecords(30, 0.7); // { "2023-09-01": true, "2023-09-02": false, ... }
 */
function generatePastRecords(days, successRate) {
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

/**
 * Obtiene los últimos 7 días en formato AAAA-MM-DD
 * @returns {string[]} - Array con las fechas de los últimos 7 días
 */
function getLast7Days() {
  const days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push(formatDate(date))
  }

  return days
}

/**
 * Formatea una fecha en formato AAAA-MM-DD
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
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
 * Obtiene una representación de tiempo relativo (hace cuánto tiempo) a partir de una marca de tiempo
 * @param {number} timestamp - Marca de tiempo en milisegundos
 * @returns {string} - Representación de tiempo relativo (e.g., "5m ago", "2h ago", "3d ago", "Just now")
 */
function getRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Escapa caracteres HTML especiales en un string
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Lanza una animación de confeti en la pantalla
 * @returns {void}
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

/**
 * Renderiza la pantalla de inicio con las tareas MIT (Most Important Tasks)
 * Filtra, ordena y muestra las 3 tareas más importantes no completadas
 * @returns {void}
 */
function home() {
  const todayStr = formatDate(new Date())
  const maxStreak = Math.max(...app.habits.map((h) => h.streak || 0), 0)

  document.getElementById("home-habits-streak").textContent = maxStreak

  const totalTasks = app.tasks.filter(
    (t) => !t.done && t.dueDate === todayStr
  ).length
  const doneTasks = app.tasks.filter(
    (t) => t.done && t.dueDate === todayStr
  ).length
  document.getElementById(
    "home-tasks-done"
  ).textContent = `${doneTasks}/${totalTasks}`

  const totalBudget = app.budgets.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.amount, 0),
    0
  )
  const totalSpent = app.budgets.reduce(
    (sum, b) =>
      sum + b.transactions.reduce((s, t) => s + Math.abs(t.amount), 0),
    0
  )
  document.getElementById("home-budget-remaining").textContent = `$${(
    totalBudget - totalSpent
  ).toFixed(0)}`
  document.getElementById("home-notes-count").textContent = app.notes.length

  const mits = app.tasks
    .filter((t) => !t.done && (t.priority === "high" || t.dueDate === todayStr))
    .sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1
      if (b.priority === "high" && a.priority !== "high") return 1
      return 0
    })
    .slice(0, 3)

  const mitsList = document.getElementById("home-mits-list")
  mitsList.innerHTML = ""

  if (mits.length > 0) {
    const template = document.getElementById("home-content-template")
    mits.forEach((task) => {
      const node = template.content.cloneNode(true)
      // Submit action
      const btn = node.querySelector("[data-done-button]")
      btn.onclick = () => app.toggleTask(task.id)
      // Título
      node.querySelector("[data-title]").textContent = task.title
      // Description
      node.querySelector("[data-description]").textContent = task.description
        ? task.description
        : ""
      // Tags
      const tagsContainer = node.querySelector("[data-tags]")
      tagsContainer.innerHTML = ""
      if (task.tags.length > 0) {
        const tagTemplate = document.getElementById("home-component-tag")
        task.tags.forEach((tag) => {
          const tagNode = tagTemplate.content.cloneNode(true)
          tagNode.querySelector("[data-tag-name]").textContent = tag
          tagsContainer.appendChild(tagNode)
        })
      }
      // Prioridad
      if (task.priority === "high") {
        node.querySelector("[data-priority-icon]").textContent = "⚡"
      }
      // Estado completado
      if (task.done) {
        node.querySelector("data-done-icon").textContent = "✓"
        node.querySelector("[data-done-button]").classList.add("bg-xp-primary")
        node
          .querySelector("[data-title]")
          .classList.add("line-through", "opacity-60")
      }
      mitsList.appendChild(node)
    })
  } else {
    const noContentTemplate = document.getElementById(
      "home-no-content-template"
    )
    const noContentNode = noContentTemplate.content.cloneNode(true)
    mitsList.appendChild(noContentNode)
  }

  // Renderizar los hábitos en el inicio
  const habitsHtml = app.habits
    .map((habit) => {
      const isDone = habit.dailyRecords[todayStr]
      return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
                    <div class="flex items-center gap-3 flex-1">
                        <button onclick="app.toggleHabit('${habit.id}')"
                                class="w-8 h-8 rounded-full border-2 ${
                                  isDone
                                    ? "bg-xp-primary border-xp-primary"
                                    : "border-gray-400"
                                } flex items-center justify-center hover:scale-110 transition-transform">
                            ${
                              isDone
                                ? '<span class="text-xp-darker text-lg">✓</span>'
                                : ""
                            }
                        </button>
                        <div>
                            <div class="font-semibold">${escapeHtml(
                              habit.title
                            )}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">🔥 ${
                              habit.streak
                            } day streak</div>
                        </div>
                    </div>
                    ${
                      isDone
                        ? '<span class="text-xp-primary font-bold">+10 XP</span>'
                        : ""
                    }
                </div>
            `
    })
    .join("")

  document.getElementById("home-habits-list").innerHTML = habitsHtml

  // Mostrar la actividad reciente
  const recentActivity = []

  // Tareas recientes
  const recentTasks = app.tasks
    .filter((t) => t.done)
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 2)

  recentTasks.forEach((task) => {
    recentActivity.push({
      icon: "✓",
      text: `Completed: ${task.title}`,
      time: "Today",
      color: "text-xp-primary"
    })
  })

  // Notas recientes
  const recentNotes = app.notes
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 2)

  recentNotes.forEach((note) => {
    recentActivity.push({
      icon: "📝",
      text: `Updated: ${note.title}`,
      time: getRelativeTime(note.updatedAt),
      color: "text-purple-500"
    })
  })

  const activityHtml =
    recentActivity.length > 0
      ? recentActivity
          .map(
            (item) => `
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
                <span class="${item.color} text-2xl">${item.icon}</span>
                <div class="flex-1">
                    <div class="font-semibold">${item.text}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">${item.time}</div>
                </div>
            </div>
        `
          )
          .join("")
      : '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</div>'

  document.getElementById("home-recent-activity").innerHTML = activityHtml
}

/**
 * Renderiza la pantalla de presupuestos
 * @returns {void}
 */
function budgets() {
  const totalBudget = app.budgets.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.amount, 0),
    0
  )
  const totalSpent = app.budgets.reduce(
    (sum, b) =>
      sum + b.transactions.reduce((s, t) => s + Math.abs(t.amount), 0),
    0
  )
  const remaining = totalBudget - totalSpent

  document.getElementById("budget-total").textContent = `$${totalBudget.toFixed(
    2
  )}`
  document.getElementById("budget-spent").textContent = `$${totalSpent.toFixed(
    2
  )}`
  document.getElementById(
    "budget-remaining"
  ).textContent = `$${remaining.toFixed(2)}`

  const budgetsHtml = app.budgets
    .map((budget) => {
      const budgetTotal = budget.items.reduce(
        (sum, item) => sum + item.amount,
        0
      )
      const budgetSpent = budget.transactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      )
      const budgetRemaining = budgetTotal - budgetSpent
      const percentage = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0

      return `
                <div class="bg-white dark:bg-xp-card rounded-xl p-6 border-2 border-gray-200 dark:border-xp-primary/20">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold">${escapeHtml(
                          budget.name
                        )}</h3>
                        <div class="flex gap-2">
                            <button onclick="app.showBudgetDetails('${
                              budget.id
                            }')"
                                    class="px-4 py-2 bg-xp-secondary/20 hover:bg-xp-secondary/30 rounded-lg transition-colors">
                                View Details
                            </button>
                            <button onclick="app.showAddTransactionModal('${
                              budget.id
                            }')"
                                    class="px-4 py-2 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker rounded-lg transition-colors">
                                + Transaction
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Budget</div>
                            <div class="text-lg font-bold">$${budgetTotal.toFixed(
                              2
                            )}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Spent</div>
                            <div class="text-lg font-bold text-xp-danger">$${budgetSpent.toFixed(
                              2
                            )}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                            <div class="text-lg font-bold text-xp-primary">$${budgetRemaining.toFixed(
                              2
                            )}</div>
                        </div>
                    </div>

                    <div class="relative w-full h-4 bg-gray-200 dark:bg-xp-darker rounded-full overflow-hidden">
                        <div class="xp-bar-fill absolute top-0 left-0 h-full ${
                          percentage > 90
                            ? "bg-xp-danger"
                            : percentage > 70
                            ? "bg-xp-warning"
                            : "bg-xp-primary"
                        }"
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-2 text-right">${percentage.toFixed(
                      1
                    )}% used</div>
                </div>
            `
    })
    .join("")

  document.getElementById("budgets-list").innerHTML =
    budgetsHtml ||
    '<div class="text-center text-gray-500 dark:text-gray-400 py-12">No budgets yet. Create your first budget to get started! 💰</div>'
}

// Controlador de filtro actual
let currentFilter = "all"

/**
 * Renderiza la lista de tareas con filtros y ordenamiento
 * @returns {void}
 */
function tasks() {
  let tasks = app.tasks
  const todayStr = formatDate(new Date())

  // Aplicar filtros
  switch (currentFilter) {
    case "today":
      tasks = tasks.filter((t) => t.dueDate === todayStr && !t.done)
      break
    case "high":
      tasks = tasks.filter((t) => t.priority === "high" && !t.done)
      break
    case "completed":
      tasks = tasks.filter((t) => t.done)
      break
  }

  // Ordenar por orden y prioridad
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.priority === "high" && b.priority !== "high") return -1
    if (b.priority === "high" && a.priority !== "high") return 1
    return a.order - b.order
  })

  // Renderizar tareas
  const tasksHtml = tasks
    .map(
      (task, index) => `
            <div class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20 task-item"
                 data-task-id="${task.id}" draggable="true"
                 ondragstart="handleDragStart(event)"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event)"
                 ondragend="handleDragEnd(event)">
                <div class="flex items-start gap-3">
                    <button onclick="app.toggleTask('${task.id}')"
                            class="mt-1 w-6 h-6 rounded border-2 border-xp-primary flex items-center justify-center flex-shrink-0 hover:bg-xp-primary/20 transition-colors">
                        ${
                          task.done
                            ? '<span class="text-xp-primary text-lg">✓</span>'
                            : ""
                        }
                    </button>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-1">
                                <div class="font-bold text-lg ${
                                  task.done ? "line-through opacity-60" : ""
                                }">${escapeHtml(task.title)}</div>
                                ${
                                  task.description
                                    ? `<div class="text-sm text-gray-600 dark:text-gray-400 mt-1 ${
                                        task.done
                                          ? "line-through opacity-60"
                                          : ""
                                      }">${escapeHtml(task.description)}</div>`
                                    : ""
                                }
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                ${
                                  task.priority === "high"
                                    ? '<span class="text-xp-danger text-xl" title="High Priority">⚡</span>'
                                    : ""
                                }
                                ${
                                  task.dueDate === todayStr
                                    ? '<span class="text-xp-warning text-xl" title="Due Today">📅</span>'
                                    : ""
                                }
                            </div>
                        </div>

                        ${
                          task.subtasks && task.subtasks.length > 0
                            ? `
                            <div class="mt-3 space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                ${task.subtasks
                                  .map(
                                    (subtask) => `
                                    <div class="flex items-center gap-2">
                                        <button onclick="app.toggleSubtask('${
                                          task.id
                                        }', '${subtask.id}')"
                                                class="w-4 h-4 rounded border border-gray-400 flex items-center justify-center hover:border-xp-primary transition-colors">
                                            ${
                                              subtask.done
                                                ? '<span class="text-xp-primary text-xs">✓</span>'
                                                : ""
                                            }
                                        </button>
                                        <span class="text-sm ${
                                          subtask.done
                                            ? "line-through opacity-60"
                                            : ""
                                        }">${escapeHtml(subtask.text)}</span>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        `
                            : ""
                        }

                        <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
                            <div class="flex gap-2 flex-wrap">
                                ${task.tags
                                  .map(
                                    (tag) =>
                                      `<span class="text-xs px-2 py-1 bg-xp-primary/20 text-xp-primary rounded">${tag}</span>`
                                  )
                                  .join("")}
                                ${
                                  task.dueDate
                                    ? `<span class="text-xs px-2 py-1 bg-gray-200 dark:bg-xp-darker text-gray-700 dark:text-gray-300 rounded">Due: ${task.dueDate}</span>`
                                    : ""
                                }
                            </div>
                            <div class="flex gap-2">
                                <button onclick="app.showEditTaskModal('${
                                  task.id
                                }')"
                                        class="text-sm px-3 py-1 bg-xp-secondary/20 hover:bg-xp-secondary/30 rounded transition-colors">
                                    Edit
                                </button>
                                <button onclick="app.deleteTask('${task.id}')"
                                        class="text-sm px-3 py-1 bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    )
    .join("")

  document.getElementById("tasks-list").innerHTML =
    tasksHtml ||
    '<div class="text-center text-gray-500 dark:text-gray-400 py-12">No tasks found. Create your first task! ✓</div>'
}

/**
 * Renderiza la pantalla de hábitos
 * @returns {void}
 */
function habits() {
  const todayStr = formatDate(new Date())
  const totalHabits = app.habits.length
  const completedToday = app.habits.filter(
    (h) => h.dailyRecords[todayStr]
  ).length
  const completionRate =
    totalHabits > 0 ? ((completedToday / totalHabits) * 100).toFixed(0) : 0
  const maxStreak = Math.max(...app.habits.map((h) => h.streak || 0), 0)

  document.getElementById(
    "habits-current-streak"
  ).textContent = `${maxStreak} days 🔥`
  document.getElementById(
    "habits-completion-rate"
  ).textContent = `${completionRate}%`

  const habitsHtml = app.habits
    .map((habit) => {
      const isDoneToday = habit.dailyRecords[todayStr]
      const last7Days = getLast7Days()

      return `
                <div class="bg-white dark:bg-xp-card rounded-xl p-6 border-2 border-gray-200 dark:border-xp-primary/20">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h4 class="text-lg font-bold mb-1">${escapeHtml(
                              habit.title
                            )}</h4>
                            ${
                              habit.description
                                ? `<p class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(
                                    habit.description
                                  )}</p>`
                                : ""
                            }
                        </div>
                        <button onclick="app.deleteHabit('${habit.id}')"
                                class="px-3 py-1 text-xs bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors">
                            Delete
                        </button>
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <button onclick="app.toggleHabit('${habit.id}')"
                                class="flex items-center gap-3 px-6 py-3 rounded-lg ${
                                  isDoneToday
                                    ? "bg-xp-primary text-xp-darker"
                                    : "bg-gray-200 dark:bg-xp-darker text-gray-700 dark:text-gray-300"
                                } hover:opacity-80 transition-all font-semibold">
                            ${
                              isDoneToday
                                ? "✓ Completed Today"
                                : "○ Mark Complete"
                            }
                        </button>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🔥</span>
                            <div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                                <div class="font-bold text-lg">${
                                  habit.streak
                                } days</div>
                            </div>
                        </div>
                        ${
                          isDoneToday
                            ? '<div class="ml-auto text-xp-primary font-bold animate-bounce-subtle">+10 XP</div>'
                            : ""
                        }
                    </div>

                    <div class="flex gap-2">
                        ${last7Days
                          .map((date) => {
                            const done = habit.dailyRecords[date]
                            const isToday = date === todayStr
                            return `
                                <div class="flex-1 h-12 rounded-lg ${
                                  done
                                    ? "bg-xp-primary"
                                    : "bg-gray-200 dark:bg-xp-darker"
                                } ${
                              isToday ? "ring-2 ring-xp-secondary" : ""
                            } flex items-center justify-center">
                                    ${
                                      done
                                        ? '<span class="text-xp-darker text-xl">✓</span>'
                                        : ""
                                    }
                                </div>
                            `
                          })
                          .join("")}
                    </div>
                    <div class="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                        ${last7Days
                          .map((date) => {
                            const d = new Date(date)
                            return `<div class="flex-1 text-center">${d
                              .toLocaleDateString("en-US", { weekday: "short" })
                              .substr(0, 1)}</div>`
                          })
                          .join("")}
                    </div>
                </div>
            `
    })
    .join("")

  document.getElementById("habits-list").innerHTML =
    habitsHtml ||
    '<div class="text-center text-gray-500 dark:text-gray-400 py-12">No habits yet. Add habits to start tracking! 🎯</div>'
}

/**
 * Renderiza la pantalla de notas
 * @returns {void}
 */
function notes() {
  const notesHtml = app.notes
    .map(
      (note) => `
            <div class="bg-white dark:bg-xp-card rounded-xl p-5 border-2 border-gray-200 dark:border-xp-primary/20 hover:border-xp-primary/40 transition-colors cursor-pointer"
                 onclick="app.showNoteModal('${note.id}')">
                <h4 class="font-bold text-lg mb-2">${escapeHtml(
                  note.title
                )}</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    ${escapeHtml(note.bodyMarkdown.substring(0, 100))}${
        note.bodyMarkdown.length > 100 ? "..." : ""
      }
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex gap-1 flex-wrap">
                        ${note.tags
                          .map(
                            (tag) =>
                              `<span class="text-xs px-2 py-1 bg-purple-500/20 text-purple-500 rounded">${tag}</span>`
                          )
                          .join("")}
                    </div>
                    <div class="text-xs text-gray-500">${getRelativeTime(
                      note.updatedAt
                    )}</div>
                </div>
            </div>
        `
    )
    .join("")

  document.getElementById("notes-list").innerHTML =
    notesHtml ||
    '<div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">No notes yet. Start writing! 📝</div>'
}

/**
 * Renderiza la pantalla actual según el estado
 * @returns {void}
 */
function render() {
  console.debug("Renderizando la pantalla:", currentScreen)
  switch (currentScreen) {
    case "home":
      home()
      break
    case "budgets":
      budgets()
      break
    case "tasks":
      tasks()
      break
    case "habits":
      habits()
      break
    case "notes":
      notes()
      break
    // Otros casos para diferentes pantallas
  }
}

/**
 * Representa una subtarea de una tarea.
 * @typedef {Object} Subtask
 * @property {string} id - Identificador único de la subtarea.
 * @property {string} text - Texto descriptivo de la subtarea.
 * @property {boolean} done - Estado de completado.
 */

/**
 * Representa una tarea.
 * @typedef {Object} Task
 * @property {string} id - Identificador único de la tarea.
 * @property {string} title - Título de la tarea.
 * @property {string} description - Descripción de la tarea.
 * @property {string} dueDate - Fecha de vencimiento (AAAA-MM-DD).
 * @property {string} priority - Prioridad ("low", "medium", "high").
 * @property {string[]} tags - Etiquetas asociadas.
 * @property {Subtask[]} subtasks - Lista de subtareas.
 * @property {boolean} done - Estado de completado.
 * @property {number} order - Orden de la tarea.
 */

/**
 * Representa un hábito.
 * @typedef {Object} Habit
 * @property {string} id - Identificador único del hábito.
 * @property {string} title - Título del hábito.
 * @property {string} description - Descripción del hábito.
 * @property {string} schedule - Frecuencia ("daily", etc.).
 * @property {Object.<string, boolean>} dailyRecords - Registro de días completados.
 * @property {number} streak - Racha actual de días completados.
 * @property {string} color - Color asociado al hábito.
 */

/**
 * Representa un ítem dentro de un budget.
 * @typedef {Object} ItemBudget
 * @property {string} id - Identificador único del ítem.
 * @property {string} [itemId] - Identificador del ítem asociado (opcional).
 * @property {string} title - Nombre del ítem.
 * @property {number} amount - Monto asignado al ítem.
 * @property {string} date - Fecha de creación del ítem (AAAA-MM-DD).
 * @property {string} notes - Notas adicionales del ítem.
 */

/**
 * Representa una transacción financiera.
 * @typedef {Object} Transaction
 * @property {string} id - Identificador único de la transacción.
 * @property {string} itemId - Identificador del ítem asociado.
 * @property {number} amount - Monto de la transacción.
 * @property {string} description - Descripción de la transacción.
 * @property {string} date - Fecha de la transacción (AAAA-MM-DD).
 */

/**
 * Representa el budget del usuario.
 * @typedef {Object} Budget
 * @property {string} id - Identificador único del budget.
 * @property {string} name - Nombre del budget.
 * @property {string} currency - Moneda del budget.
 * @property {ItemBudget[]} items - Lista de items del budget.
 * @property {Transaction[]} transactions - Lista de transacciones del budget.
 */

/**
 * Representa una nota del usuario.
 * @typedef {Object} Note
 * @property {string} id - Identificador único de la nota.
 * @property {string} title - Título de la nota.
 * @property {string} bodyMarkdown - Contenido de la nota en formato Markdown.
 * @property {string[]} tags - Etiquetas asociadas a la nota.
 * @property {number} updatedAt - Fecha de última actualización de la nota (AAAA-MM-DD).
 */

/**
 * Objeto para gestionar el almacenamiento local (localStorage)
 * @type {object}
 * @namespace
 * @method init - Inicializa el almacenamiento con datos de ejemplo si no existen
 * @method save - Guarda datos en el localStorage
 * @method load - Carga datos desde el localStorage
 * @method loadCounter - Carga y actualiza el contador de visitas
 * @property {Array<Task>} dummyTasks - Datos con tareas de ejemplo
 * @property {Array<Habit>} dummyHabits - Datos con hábitos de ejemplo
 * @property {Array<Budget>} dummyBudget - Datos con budgets de ejemplo
 */
const store = {
  /**
   * Inicializa el almacenamiento con datos de ejemplo si no existen
   * @param {string} namespace - Espacio de nombres para el localStorage
   * @returns {void}
   * */
  init: function () {
    if (!localStorage.getItem("tasks")) {
      this.save(this.dummyTasks, "tasks")
    }
    if (!localStorage.getItem("habits")) {
      this.save(this.dummyHabits, "habits")
    }
    if (!localStorage.getItem("budgets")) {
      this.save(this.dummyBudget, "budgets")
    }
    if (!localStorage.getItem("notes")) {
      this.save(this.dummyNotes, "notes")
    }
  },
  /**
   * Guarda datos en el localStorage
   * @param {any} data - Datos a guardar
   * @param {string} namespace - Espacio de nombres para el localStorage
   * @returns {void}
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
   * @param {string} namespace - Espacio de nombres para el localStorage
   * @param {string} typeData - Tipo de dato a cargar: "array" o "number"
   * @returns {void}
   * */
  load: function (namespace, typeData = "array") {
    const data = localStorage.getItem(namespace)
    switch (typeData) {
      case "number":
        try {
          const dataNumber = Number(data)
          visitCount = dataNumber
        } catch (e) {
          console.error("Error loading numeric data from localStorage:", e)
        }
        break
      case "array":
      default:
        if (data) {
          // Asignar los datos cargados a la aplicación según el espacio de nombres
          switch (namespace) {
            case "tasks":
              app.tasks = JSON.parse(data)
              break
            case "habits":
              app.habits = JSON.parse(data)
              break
            case "budgets":
              app.budgets = JSON.parse(data)
              break
            case "notes":
              app.notes = JSON.parse(data)
              break
            default:
              console.warn(`Unknown namespace "${namespace}" for loading data.`)
          }
        }
        break
    }
    return
  },
  /**
   * Carga y actualiza el contador de visitas
   * @returns {void}
   */
  loadCounter: function () {
    store.load("visit_counter", "number")
    visitCount += 1
    store.save(visitCount, "visit_counter")
  },
  /**
   * Datos con tareas de ejemplo
   * @type {Array<Task>}
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
  ],
  /**
   * Datos con hábitos de ejemplo
   * @type {Array<Habit>}
   */
  dummyHabits: [
    {
      id: generateId(),
      title: "🌅 Wake without snooze",
      description: "Wake up at target time without hitting snooze",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.8),
      streak: 5,
      color: "#00ff88"
    },
    {
      id: generateId(),
      title: "💧 Hydrate (500ml water)",
      description: "Drink 500ml water with lemon immediately after waking",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.9),
      streak: 7,
      color: "#0099ff"
    },
    {
      id: generateId(),
      title: "🧘 Stoic meditation (10 min)",
      description: "Morning meditation and journaling",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.7),
      streak: 3,
      color: "#9333ea"
    },
    {
      id: generateId(),
      title: "🏃 Mobility routine",
      description: "15-20 minutes of stretching and calisthenics",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.6),
      streak: 2,
      color: "#f59e0b"
    },
    {
      id: generateId(),
      title: "⭐ Define 3 MITs",
      description: "Plan the 3 most important tasks during breakfast",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.85),
      streak: 6,
      color: "#00ff88"
    },
    {
      id: generateId(),
      title: "🎯 Complete first deep work block",
      description: "60-minute focused work session starting at 9:00",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.75),
      streak: 4,
      color: "#ef4444"
    },
    {
      id: generateId(),
      title: "📚 Learning block (30-45 min)",
      description: "Dedicated time for learning new skills",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.8),
      streak: 5,
      color: "#8b5cf6"
    },
    {
      id: generateId(),
      title: "📝 End of day review",
      description: "Review accomplishments and plan tomorrow",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.7),
      streak: 3,
      color: "#10b981"
    },
    {
      id: generateId(),
      title: "🌙 Digital sunset (6 PM)",
      description: "Disconnect from screens by 6 PM",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.5),
      streak: 1,
      color: "#f97316"
    },
    {
      id: generateId(),
      title: "😴 Sleep prep by 9 PM",
      description: "Begin sleep routine, target sleep by 11 PM",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.6),
      streak: 2,
      color: "#06b6d4"
    }
  ],
  /**
   * Datos con presupuestos de ejemplo
   * @type {Array<Budget>}
   */
  dummyBudget: [
    {
      id: generateId(),
      name: "Monthly Personal Budget",
      currency: "USD",
      items: [
        {
          id: generateId(),
          title: "Groceries",
          amount: 500,
          date: todayStr,
          notes: "Weekly shopping"
        },
        {
          id: generateId(),
          title: "Tech & Software",
          amount: 200,
          date: todayStr,
          notes: "Subscriptions and tools"
        },
        {
          id: generateId(),
          title: "Learning",
          amount: 100,
          date: todayStr,
          notes: "Books and courses"
        },
        {
          id: generateId(),
          title: "Entertainment",
          amount: 150,
          date: todayStr,
          notes: "Games and movies"
        }
      ],
      transactions: [
        {
          id: generateId(),
          itemId: null,
          amount: -45,
          description: "Weekly groceries",
          date: todayStr
        },
        {
          id: generateId(),
          itemId: null,
          amount: -15,
          description: "GitHub Pro subscription",
          date: todayStr
        }
      ]
    }
  ],
  /**
   * Datos con notas de ejemplo
   * @type {Array<Note>}
   */
  dummyNotes: [
    {
      id: generateId(),
      title: "Daily Programming Tips",
      bodyMarkdown: `# Daily Programming Tips

## Code Quality
- Write **clean, readable code** first
- Optimize only when necessary
- Use *meaningful variable names*

## Productivity
- Use the **Pomodoro Technique**
- Take regular breaks
- Stay hydrated 💧

## Learning
\`\`\`javascript
// Always be learning
const knowledge = practice + time;
\`\`\`

### Resources
- Documentation first
- Stack Overflow second
- Experiment always`,
      tags: ["programming", "tips"],
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      title: "Project Ideas",
      bodyMarkdown: `# Project Ideas 💡

## Web Apps
- Personal dashboard
- Habit tracker
- Budget manager

#
# Mobile Apps
- Fitness tracker
- Reading list app

**Next Steps:**
1. Research tech stack
2. Create wireframes
3. Build MVP`,
      tags: ["ideas", "projects"],
      updatedAt: Date.now() - 3600000
    },
    {
      id: generateId(),
      title: "Stoic Meditation Notes",
      bodyMarkdown: `# Stoic Philosophy

## Morning Meditation
*"The obstacle is the way"* - Marcus Aurelius

Focus on what you can control:
- Your thoughts
- Your actions
- Your responses

## Daily Practices
1. Morning journaling
2. Evening reflection
3. Mindful breathing`,
      tags: ["meditation", "stoic", "philosophy"],
      updatedAt: Date.now() - 86400000
    }
  ]
}

/**
 * Objeto principal de la aplicación.
 * Gestiona la navegación, el estado y las operaciones principales.
 * @type {object}
 * @namespace
 * @method init - Inicializa la aplicación.
 * @method navigateTo - Cambia la pantalla actual.
 * @property {Task[]} tasks - Lista de tareas.
 * @method toggleTask - Alterna el estado de una tarea.
 * @method toggleSubtask - Alterna el estado de una subtarea.
 * @property {Habit[]} habits - Lista de hábitos.
 * @method visitCounter - Cuenta las visitas y lanza confeti cada 10 visitas.
 * @property {Budget[]} budgets - Lista de presupuestos.
 * @method showCreateBudgetModal - Muestra el modal para crear un nuevo presupuesto.
 * @method showAddTransactionModal - Muestra el modal para agregar una nueva transacción.
 * @method addTransaction - Agrega una nueva transacción a un presupuesto.
 * @method showBudgetDetails - Muestra los detalles de un presupuesto.
 * @method showAddBudgetItemModal - Muestra el modal para agregar un nuevo ítem al presupuesto.
 * @method addBudgetItem - Agrega un nuevo ítem al presupuesto.
 * @method deleteBudget - Elimina un presupuesto por su ID.
 * @method deleteBudgetItem - Elimina un ítem del presupuesto.
 * @method createBudget - Crea un nuevo presupuesto a partir de un formulario.
 * @property {Note[]} notes - Lista de notas.
 * @method showModal - Muestra un modal con contenido HTML.
 * @method closeModal - Cierra el modal actual.
 * @method showToast - Muestra un mensaje emergente.
 * @method showUndoToast - Muestra un toast con opción de deshacer.
 * @method performUndo - Ejecuta la acción de deshacer.
 */
const app = {
  /**
   * Inicializa la app y navega a la pantalla principal
   * @returns {void}
   */
  init: function () {
    // Al ejecutar por primera vez se deben de crear los datos iniciales.
    this.loadTheme()
    store.init()
    store.load("tasks", "array")
    store.load("habits", "array")
    store.load("budgets", "array")
    store.load("notes", "array")
    this.visitCounter()
    this.navigateTo("home")
  },
  loadTheme: function () {
    const theme = localStorage.getItem("theme") || "light"
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    const themeToggleBtn = document.getElementById("theme-toggle")
    themeToggleBtn.checked = theme === "dark"
    localStorage.setItem("theme", theme)
  },
  toggleTheme: function () {
    const currentTheme = localStorage.getItem("theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", newTheme)
  },
  /**
   * Navega a la pantalla indicada y actualiza el estado visual
   * @param {string} screen - Pantalla destino
   * @returns {void}
   */
  navigateTo: function (screen) {
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
   * @type {Array<Task>}
   */
  tasks: [],
  /**
   * Funcionalidad de filtrado de tareas
   * @param {string} filter - Filtro seleccionado: "all", "today", "high", "completed"
   * @returns {void}
   */
  filterTasks(filter) {
    currentFilter = filter

    // Actualizar estilos de botones de filtro
    document.querySelectorAll(".task-filter-btn").forEach((btn) => {
      if (btn.dataset.filter === filter) {
        btn.classList.add("bg-xp-primary", "text-xp-darker")
        btn.classList.remove(
          "bg-gray-200",
          "dark:bg-xp-card",
          "text-gray-700",
          "dark:text-gray-300"
        )
      } else {
        btn.classList.remove("bg-xp-primary", "text-xp-darker")
        btn.classList.add(
          "bg-gray-200",
          "dark:bg-xp-card",
          "text-gray-700",
          "dark:text-gray-300"
        )
      }
    })

    tasks()
  },
  /**
   * Muestra el modal para crear una nueva tarea
   * @returns {void}
   */
  showCreateTaskModal() {
    const todayStr = formatDate(new Date())

    // Contenido del modal para crear una nueva tarea
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Create New Task</h3>
                <form onsubmit="app.createTask(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Title *</label>
                            <input type="text" name="title" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="e.g., Complete feature implementation">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Description</label>
                            <textarea name="description" rows="3"
                                      class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                      placeholder="Task details..."></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold mb-2">Due Date</label>
                                <input type="date" name="dueDate" value="${todayStr}"
                                       class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-2">Priority</label>
                                <select name="priority"
                                        class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
                            <input type="text" name="tags"
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="coding, important, review">
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.closeModal()"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        `

    app.showModal(modalContent)
  },
  /**
   * Agrega una nueva tarea basada en los datos del formulario
   * @param {Event} event - Evento del formulario
   * @returns {void}
   */
  createTask(event) {
    event.preventDefault()
    const formData = new FormData(event.target)

    // Crear el objeto de tarea
    const task = {
      id: generateId(),
      title: formData.get("title"),
      description: formData.get("description") || "",
      dueDate: formData.get("dueDate") || "",
      priority: formData.get("priority"),
      tags: formData.get("tags")
        ? formData
            .get("tags")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
      subtasks: [],
      done: false,
      order: app.tasks.length + 1
    }

    app.tasks.push(task)
    store.save(app.tasks, "tasks")
    app.closeModal()
    app.showToast("Task created! 📝", "success")
    tasks()
    if (this.currentScreen === "home") home()
  },
  /**
   * Muestra el modal para editar una tarea existente
   * @param {string} taskId - ID de la tarea a editar
   * @returns {void}
   */
  showEditTaskModal(taskId) {
    const task = app.tasks.find((t) => t.id === taskId)
    if (!task) return

    // Contenido del modal para editar la tarea
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Edit Task</h3>
                <form onsubmit="app.updateTask(event, '${taskId}')">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Title *</label>
                            <input type="text" name="title" required value="${escapeHtml(
                              task.title
                            )}"
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Description</label>
                            <textarea name="description" rows="3"
                                      class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">${escapeHtml(
                                        task.description
                                      )}</textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold mb-2">Due Date</label>
                                <input type="date" name="dueDate" value="${
                                  task.dueDate
                                }"
                                       class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-2">Priority</label>
                                <select name="priority"
                                        class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                                    <option value="low" ${
                                      task.priority === "low" ? "selected" : ""
                                    }>Low</option>
                                    <option value="medium" ${
                                      task.priority === "medium"
                                        ? "selected"
                                        : ""
                                    }>Medium</option>
                                    <option value="high" ${
                                      task.priority === "high" ? "selected" : ""
                                    }>High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
                            <input type="text" name="tags" value="${task.tags.join(
                              ", "
                            )}"
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Subtasks</label>
                            <div id="subtasks-list" class="space-y-2 mb-2">
                                ${task.subtasks
                                  .map(
                                    (st, idx) => `
                                    <div class="flex gap-2">
                                        <input type="text" value="${escapeHtml(
                                          st.text
                                        )}"
                                               data-subtask-id="${st.id}"
                                               class="subtask-input flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                                        <button type="button" onclick="this.parentElement.remove()"
                                                class="px-3 py-2 bg-xp-danger/20 text-xp-danger rounded-lg hover:bg-xp-danger/30">✕</button>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                            <button type="button" onclick="app.addSubtaskInput()"
                                    class="text-sm px-3 py-2 bg-xp-primary/20 text-xp-primary rounded-lg hover:bg-xp-primary/30">
                                + Add Subtask
                            </button>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.closeModal()"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Update Task
                        </button>
                    </div>
                </form>
            </div>
        `

    app.showModal(modalContent)
  },
  /**
   * Agrega un nuevo campo de entrada para subtareas en el formulario de edición de tareas
   * @return {void}
   */
  addSubtaskInput() {
    const list = document.getElementById("subtasks-list")
    const div = document.createElement("div")
    div.className = "flex gap-2"
    // Agregar el nuevo campo de entrada para la subtarea
    div.innerHTML = `
            <input type="text" placeholder="Subtask..."
                   class="subtask-input flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
            <button type="button" onclick="this.parentElement.remove()"
                    class="px-3 py-2 bg-xp-danger/20 text-xp-danger rounded-lg hover:bg-xp-danger/30">✕</button>
        `
    list.appendChild(div)
  },
  /**
   * Función para actualizar una tarea existente
   *
   * Esta función recupera los datos del formulario (título, descripción, etc.),
   * los aplica a la tarea correspondiente identificada por `taskId`,
   * guarda los cambios en el almacenamiento local y actualiza la interfaz.
   *
   * @param {Event} event - El evento `submit` del formulario HTML.
   * @param {string} taskId - El identificador único de la tarea a actualizar.
   * @return {void}
   */
  updateTask(event, taskId) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const task = app.tasks.find((t) => t.id === taskId)

    if (task) {
      // Actualizar campos de la tarea
      task.title = formData.get("title")
      task.description = formData.get("description") || ""
      task.dueDate = formData.get("dueDate") || ""
      task.priority = formData.get("priority")
      task.tags = formData.get("tags")
        ? formData
            .get("tags")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : []

      // Actualizar subtareas
      const subtaskInputs = document.querySelectorAll(".subtask-input")
      task.subtasks = Array.from(subtaskInputs)
        .map((input) => ({
          id: input.dataset.subtaskId || generateId(),
          text: input.value,
          done:
            task.subtasks.find((st) => st.id === input.dataset.subtaskId)
              ?.done || false
        }))
        .filter((st) => st.text.trim())

      store.save(app.tasks, "tasks")
      app.closeModal()
      app.showToast("Task updated! ✓", "success")
      tasks()
    }
  },
  /**
   * Función para eliminar una tarea por su ID
   * @param {string} taskId - ID de la tarea a eliminar
   * @return {void}
   */
  deleteTask(taskId) {
    const index = app.tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      const deleted = app.tasks.splice(index, 1)[0]
      store.save(app.tasks, "tasks")
      tasks()
      // Mostrar opción de deshacer
      app.showUndoToast(`Deleted "${deleted.title}"`, () => {
        app.tasks.splice(index, 0, deleted)
        store.save(app.tasks, "tasks")
        tasks()
      })
    }
  },
  /**
   * Alterna el estado de una tarea
   * @param {string} taskId - ID de la tarea a alternar
   * @returns {void}
   */
  toggleTask: function (taskId) {
    const task = app.tasks.find((t) => t.id === taskId)
    if (task) {
      task.done = !task.done
      store.save(app.tasks, "tasks")
      app.showToast(
        task.done ? "Task completed! +15 XP 🎉" : "Task reopened",
        "success"
      )
      render()
    }
  },
  /**
   * Alterna el estado de una subtarea
   * @param {string} taskId - ID de la tarea
   * @param {string} subtaskId - ID de la subtarea a alternar
   * @returns {void}
   */
  toggleSubtask(taskId, subtaskId) {
    const task = app.tasks.find((t) => t.id === taskId)
    if (task && task.subtasks) {
      const subtask = task.subtasks.find((st) => st.id === subtaskId)
      if (subtask) {
        subtask.done = !subtask.done
        store.save(app.tasks, "tasks")
        tasks()
      }
    }
  },
  /**
   * Estado inicial de los hábitos
   * @type {Array<Habit>}
   */
  habits: [],
  /**
   * Crea un hábito a partir de una plantilla predefinida
   * @param {number} templateIndex - Índice de la plantilla a usar
   * @returns {void}
   */
  createHabitFromTemplate(templateIndex) {
    const templates = [
      {
        title: "🌅 Wake without snooze",
        description: "Wake up at target time without hitting snooze",
        color: "#00ff88"
      },
      {
        title: "💧 Hydrate (500ml water)",
        description: "Drink 500ml water with lemon immediately after waking",
        color: "#0099ff"
      },
      {
        title: "🧘 Stoic meditation (10 min)",
        description: "Morning meditation and journaling",
        color: "#9333ea"
      },
      {
        title: "🏃 Mobility routine",
        description: "15-20 minutes of stretching and calisthenics",
        color: "#f59e0b"
      },
      {
        title: "⭐ Define 3 MITs",
        description: "Plan the 3 most important tasks during breakfast",
        color: "#00ff88"
      },
      {
        title: "🎯 Complete first deep work block",
        description: "60-minute focused work session",
        color: "#ef4444"
      },
      {
        title: "📚 Learning block (30-45 min)",
        description: "Dedicated time for learning new skills",
        color: "#8b5cf6"
      },
      {
        title: "📝 End of day review",
        description: "Review accomplishments and plan tomorrow",
        color: "#10b981"
      },
      {
        title: "🌙 Digital sunset (6 PM)",
        description: "Disconnect from screens by 6 PM",
        color: "#f97316"
      },
      {
        title: "😴 Sleep prep by 9 PM",
        description: "Begin sleep routine, target sleep by 11 PM",
        color: "#06b6d4"
      }
    ]

    const template = templates[templateIndex]

    const habit = {
      id: generateId(),
      title: template.title,
      description: template.description,
      schedule: "daily",
      dailyRecords: {},
      streak: 0,
      color: template.color
    }

    app.habits.push(habit)
    store.save(app.habits, "habits")
    // Google Analytics event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "habit_create_template",
        habit_id: habit.id,
        habit_title: habit.title,
        template_index: templateIndex
      })
    }
    app.closeModal()
    app.showToast("Habit added! 🎯", "success")
    habits()
  },
  /**
   * Crea un hábito personalizado a partir de un formulario
   * @param {Event} event - Evento del formulario
   * @returns {void}
   */
  createCustomHabit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)

    const habit = {
      id: generateId(),
      title: formData.get("title"),
      description: formData.get("description") || "",
      schedule: "daily",
      dailyRecords: {},
      streak: 0,
      color: "#00ff88"
    }

    app.habits.push(habit)
    store.save(app.habits, "habits")
    // Google Analytics event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "habit_create_custom",
        habit_id: habit.id,
        habit_title: habit.title
      })
    }
    app.closeModal()
    app.showToast("Custom habit created! 🎯", "success")
    habits()
  },
  /**
   * Muestra el modal para agregar un nuevo hábito
   * @returns {void}
   */
  showHabitTemplatesModal() {
    const templates = [
      {
        title: "🌅 Wake without snooze",
        description: "Wake up at target time without hitting snooze"
      },
      {
        title: "💧 Hydrate (500ml water)",
        description: "Drink 500ml water with lemon immediately after waking"
      },
      {
        title: "🧘 Stoic meditation (10 min)",
        description: "Morning meditation and journaling"
      },
      {
        title: "🏃 Mobility routine",
        description: "15-20 minutes of stretching and calisthenics"
      },
      {
        title: "⭐ Define 3 MITs",
        description: "Plan the 3 most important tasks during breakfast"
      },
      {
        title: "🎯 Complete first deep work block",
        description: "60-minute focused work session"
      },
      {
        title: "📚 Learning block (30-45 min)",
        description: "Dedicated time for learning new skills"
      },
      {
        title: "📝 End of day review",
        description: "Review accomplishments and plan tomorrow"
      },
      {
        title: "🌙 Digital sunset (6 PM)",
        description: "Disconnect from screens by 6 PM"
      },
      {
        title: "😴 Sleep prep by 9 PM",
        description: "Begin sleep routine, target sleep by 11 PM"
      }
    ]

    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Add Habit</h3>

                <div class="mb-6">
                    <h4 class="font-semibold mb-3">Programmer Routine Templates</h4>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${templates
                          .map(
                            (template, idx) => `
                            <button onclick="app.createHabitFromTemplate(${idx})"
                                    class="w-full text-left p-4 bg-gray-50 dark:bg-xp-darker rounded-lg hover:bg-xp-primary/10 transition-colors">
                                <div class="font-semibold">${escapeHtml(
                                  template.title
                                )}</div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(
                                  template.description
                                )}</div>
                            </button>
                        `
                          )
                          .join("")}
                    </div>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="font-semibold mb-3">Or create custom habit</h4>
                    <form onsubmit="app.createCustomHabit(event)">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold mb-2">Title *</label>
                                <input type="text" name="title" required
                                       class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                       placeholder="e.g., Morning run">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-2">Description</label>
                                <input type="text" name="description"
                                       class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                       placeholder="Brief description...">
                            </div>
                        </div>
                        <div class="flex gap-3 mt-6">
                            <button type="button" onclick="app.closeModal()"
                                    class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                    class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                                Create Habit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `

    app.showModal(modalContent)
  },
  /**
   * Elimina un hábito por su ID
   * @param {string} habitId - ID del hábito a eliminar
   * @returns {void}
   */
  deleteHabit(habitId) {
    const index = app.habits.findIndex((h) => h.id === habitId)
    if (index !== -1) {
      const deleted = app.habits.splice(index, 1)[0]
      store.save(app.habits, "habits")
      habits()
      // Google Analytics event
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "habit_delete",
          habit_id: habitId,
          habit_title: deleted.title
        })
      }
      app.showUndoToast(`Deleted "${deleted.title}"`, () => {
        app.habits.splice(index, 0, deleted)
        store.save(app.habits, "habits")
        habits()
      })
    }
  },
  /**
   * Alterna el estado de un hábito para hoy
   * @param {string} habitId - ID del hábito a alternar
   * @returns {void}
   */
  toggleHabit(habitId) {
    const habit = app.habits.find((h) => h.id === habitId)
    if (!habit) return

    const todayStr = formatDate(new Date())
    const wasDone = habit.dailyRecords[todayStr]

    habit.dailyRecords[todayStr] = !wasDone

    if (!wasDone) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = formatDate(yesterday)

      if (habit.dailyRecords[yesterdayStr] || habit.streak === 0) {
        habit.streak = (habit.streak || 0) + 1
      } else {
        habit.streak = 1
      }
    } else {
      habit.streak = Math.max(0, habit.streak - 1)
    }

    store.save(app.habits, "habits")
    app.showToast(
      wasDone ? "Habit unchecked" : "Habit completed! +10 XP 🎉",
      "success"
    )

    // Google Analytics event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "habit_toggle",
        habit_id: habitId,
        habit_title: habit.title,
        status: habit.dailyRecords[todayStr] ? "completed" : "unchecked"
      })
    }

    const totalHabits = app.habits.length
    const completedHabitsToday = app.habits.filter(
      (h) => h.dailyRecords[todayStr]
    ).length

    console.debug(
      `Habits completed today: ${completedHabitsToday} / ${totalHabits}`
    )

    if (totalHabits === completedHabitsToday && totalHabits > 0) {
      launchConfetti()
    }

    habits()
    if (currentScreen === "home") home()
  },
  /**
   * Cuenta de visitas y lanzamiento de confeti cada 10 visitas
   * @returns {void}
   */
  visitCounter: function () {
    store.loadCounter()
    document.getElementById("hit-counter").textContent = visitCount
    if (visitCount % 10 === 0) {
      // Lanzar confeti cada 10 visitas
      launchConfetti()
    }
  },
  /**
   * Estado inicial de los presupuestos
   * @type {Array<Budget>}
   */
  budgets: [],
  /**
   * Muestra el modal para crear un nuevo presupuesto
   * @returns {void}
   */
  showCreateBudgetModal() {
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Create New Budget</h3>
                <form onsubmit="app.createBudget(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Budget Name</label>
                            <input type="text" name="name" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="e.g., Monthly Personal Budget">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Currency</label>
                            <select name="currency"
                                    class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.closeModal()"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Create Budget
                        </button>
                    </div>
                </form>
            </div>
        `

    app.showModal(modalContent)
  },
  /**
   * Crea un nuevo presupuesto a partir del formulario
   * @param {*} event - Evento del formulario
   * @returns {void}
   */
  createBudget(event) {
    event.preventDefault()
    const formData = new FormData(event.target)

    const budget = {
      id: generateId(),
      name: formData.get("name"),
      currency: formData.get("currency"),
      items: [],
      transactions: []
    }

    app.budgets.push(budget)
    store.save(app.budgets, "budgets")
    this.closeModal()
    this.showToast("Budget created successfully! 💰", "success")
    budgets()
  },
  /**
   * Muestra el modal para agregar una nueva transacción
   * @param {number} budgetId - ID del presupuesto al que se agrega la transacción
   * @returns {void}
   */
  showAddTransactionModal(budgetId) {
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Add Transaction</h3>
                <form onsubmit="app.addTransaction(event, '${budgetId}')">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Description</label>
                            <input type="text" name="description" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="e.g., Weekly groceries">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Amount (negative for expenses)</label>
                            <input type="number" step="0.01" name="amount" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="-50.00">
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.closeModal()"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Add Transaction
                        </button>
                    </div>
                </form>
            </div>
        `

    this.showModal(modalContent)
  },
  /**
   * Agrega una nueva transacción al presupuesto
   * @param {*} event - Evento del formulario
   * @param {number} budgetId - ID del presupuesto al que se agrega la transacción
   * @returns {void}
   */
  addTransaction(event, budgetId) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const budget = app.budgets.find((b) => b.id === budgetId)

    if (budget) {
      const transaction = {
        id: generateId(),
        itemId: null,
        amount: parseFloat(formData.get("amount")),
        description: formData.get("description"),
        date: formatDate(new Date())
      }

      budget.transactions.push(transaction)
      store.save(app.budgets, "budgets")
      this.closeModal()
      this.showToast("Transaction added! 💸", "success")
      budgets()
      if (this.currentScreen === "home") home()
    }
  },
  /**
   * Muestra los detalles de un presupuesto
   * @param {number} budgetId - ID del presupuesto
   * @returns {void}
   */
  showBudgetDetails(budgetId) {
    const budget = app.budgets.find((b) => b.id === budgetId)
    if (!budget) return

    const modalContent = `
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-bold">${escapeHtml(
                      budget.name
                    )}</h3>
                    <button onclick="app.deleteBudget('${budgetId}')"
                            class="px-4 py-2 bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors">
                        Delete
                    </button>
                </div>

                <div class="mb-6">
                    <h4 class="font-bold mb-3 flex items-center justify-between">
                        <span>Budget Items</span>
                        <button onclick="app.showAddBudgetItemModal('${budgetId}')"
                                class="text-sm px-3 py-1 bg-xp-primary text-xp-darker rounded-lg">
                            + Add Item
                        </button>
                    </h4>
                    <div class="space-y-2">
                        ${budget.items
                          .map(
                            (item) => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
                                <div>
                                    <div class="font-semibold">${escapeHtml(
                                      item.title
                                    )}</div>
                                    ${
                                      item.notes
                                        ? `<div class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(
                                            item.notes
                                          )}</div>`
                                        : ""
                                    }
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-xp-primary">$${item.amount.toFixed(
                                      2
                                    )}</div>
                                    <button onclick="app.deleteBudgetItem('${budgetId}', '${
                              item.id
                            }')"
                                            class="text-xs text-xp-danger hover:underline">Delete</button>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                        ${
                          budget.items.length === 0
                            ? '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No items yet</div>'
                            : ""
                        }
                    </div>
                </div>

                <div>
                    <h4 class="font-bold mb-3">Transactions</h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                        ${budget.transactions
                          .map(
                            (t) => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
                                <div>
                                    <div class="font-semibold">${escapeHtml(
                                      t.description
                                    )}</div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">${
                                      t.date
                                    }</div>
                                </div>
                                <div class="font-bold ${
                                  t.amount < 0
                                    ? "text-xp-danger"
                                    : "text-xp-primary"
                                }">
                                    ${t.amount < 0 ? "-" : "+"}$${Math.abs(
                              t.amount
                            ).toFixed(2)}
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                        ${
                          budget.transactions.length === 0
                            ? '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No transactions yet</div>'
                            : ""
                        }
                    </div>
                </div>
            </div>
        `

    this.showModal(modalContent)
  },
  /**
   * Muestra el modal para agregar un nuevo ítem al presupuesto
   * @param {number} budgetId - ID del presupuesto
   * @returns {void}
   */
  showAddBudgetItemModal(budgetId) {
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Add Budget Item</h3>
                <form onsubmit="app.addBudgetItem(event, '${budgetId}')">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Category/Title</label>
                            <input type="text" name="title" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="e.g., Groceries">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Amount</label>
                            <input type="number" step="0.01" name="amount" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="0.00">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Notes (optional)</label>
                            <textarea name="notes" rows="2"
                                      class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                      placeholder="Additional notes..."></textarea>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.showBudgetDetails('${budgetId}')"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Back
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Add Item
                        </button>
                    </div>
                </form>
            </div>
        `

    this.showModal(modalContent)
  },
  /**
   * Agrega un nuevo ítem al presupuesto
   * @param {*} event - Evento del formulario
   * @param {number} budgetId - ID del presupuesto
   * @returns {void}
   */
  addBudgetItem(event, budgetId) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const budget = app.budgets.find((b) => b.id === budgetId)

    if (budget) {
      const item = {
        id: generateId(),
        title: formData.get("title"),
        amount: parseFloat(formData.get("amount")),
        date: formatDate(new Date()),
        notes: formData.get("notes") || ""
      }

      budget.items.push(item)
      store.save(app.budgets, "budgets")
      this.showToast("Budget item added! 📝", "success")
      this.showBudgetDetails(budgetId)
      budgets()
    }
  },
  /**
   * Elimina un presupuesto
   * @param {number} budgetId - ID del presupuesto
   * @returns {void}
   */
  deleteBudget(budgetId) {
    if (
      confirm(
        "Are you sure you want to delete this budget? This action cannot be undone."
      )
    ) {
      const index = app.budgets.findIndex((b) => b.id === budgetId)
      if (index !== -1) {
        app.budgets.splice(index, 1)
        store.save(app.budgets, "budgets")
        this.closeModal()
        this.showToast("Budget deleted", "success")
        budgets()
      }
    }
  },
  /**
   * Elimina un ítem de un presupuesto
   * @param {number} budgetId - ID del presupuesto
   * @param {number} itemId - ID del ítem
   * @returns {void}
   */
  deleteBudgetItem(budgetId, itemId) {
    const budget = app.budgets.find((b) => b.id === budgetId)
    if (budget) {
      const index = budget.items.findIndex((i) => i.id === itemId)
      if (index !== -1) {
        const deleted = budget.items.splice(index, 1)[0]
        store.save(app.budgets, "budgets")
        this.showUndoToast(`Deleted ${deleted.title}`, () => {
          budget.items.splice(index, 0, deleted)
          store.save(app.budgets, "budgets")
          this.showBudgetDetails(budgetId)
          budgets()
        })
        this.showBudgetDetails(budgetId)
        budgets()
      }
    }
  },
  /**
   * Estado inicial de las notas
   * @type {Array<Note>}
   */
  notes: [],
  /**
   * Busca notas que coincidan con la consulta
   * @param {string} query - Consulta de búsqueda
   * @returns {void}
   */
  searchNotes(query) {
    if (!query.trim()) {
      notes()
      return
    }

    // Filtrar notas que coincidan con el título, contenido o etiquetas
    const filtered = app.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.bodyMarkdown.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    )

    const notesHtml = filtered
      .map(
        (note) => `
            <div class="bg-white dark:bg-xp-card rounded-xl p-5 border-2 border-gray-200 dark:border-xp-primary/20 hover:border-xp-primary/40 transition-colors cursor-pointer"
                 onclick="app.showNoteModal('${note.id}')">
                <h4 class="font-bold text-lg mb-2">${escapeHtml(
                  note.title
                )}</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    ${escapeHtml(note.bodyMarkdown.substring(0, 100))}${
          note.bodyMarkdown.length > 100 ? "..." : ""
        }
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex gap-1 flex-wrap">
                        ${note.tags
                          .map(
                            (tag) =>
                              `<span class="text-xs px-2 py-1 bg-purple-500/20 text-purple-500 rounded">${tag}</span>`
                          )
                          .join("")}
                    </div>
                    <div class="text-xs text-gray-500">${getRelativeTime(
                      note.updatedAt
                    )}</div>
                </div>
            </div>
        `
      )
      .join("")

    document.getElementById("notes-list").innerHTML =
      notesHtml ||
      '<div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">No notes found</div>'
  },
  /**
   * Muestra el modal para crear una nueva nota
   * @returns {void}
   */
  showCreateNoteModal() {
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Create New Note</h3>
                <form onsubmit="app.createNote(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Title *</label>
                            <input type="text" name="title" required
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="Note title...">
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-sm font-semibold">Content (Markdown)</label>
                                <button type="button" onclick="app.toggleNotePreview()" id="preview-toggle-btn"
                                        class="text-xs px-3 py-1 bg-xp-secondary/20 text-xp-secondary rounded-lg hover:bg-xp-secondary/30">
                                    Preview
                                </button>
                            </div>
                            <textarea name="body" id="note-editor" rows="12"
                                      class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary font-mono text-sm"
                                      placeholder="# Write your note in markdown..."></textarea>
                            <div id="note-preview" class="hidden w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker min-h-[300px]">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
                            <input type="text" name="tags"
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
                                   placeholder="ideas, work, personal">
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.closeModal()"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Create Note
                        </button>
                    </div>
                </form>
            </div>
        `

    this.showModal(modalContent)
  },
  /**
   * Crea una nueva nota a partir del formulario
   * @param {Event} event - Evento del formulario
   * @returns {void}
   */
  createNote(event) {
    event.preventDefault()
    const formData = new FormData(event.target)

    const note = {
      id: generateId(),
      title: formData.get("title"),
      bodyMarkdown: formData.get("body") || "",
      tags: formData.get("tags")
        ? formData
            .get("tags")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
      updatedAt: Date.now()
    }

    app.notes.push(note)
    store.save(app.notes, "notes")
    this.closeModal()
    this.showToast("Note created! 📝", "success")
    notes()
  },
  /**
   * Muestra el modal para ver/editar una nota
   * @param {string} noteId - ID de la nota
   * @returns {void}
   */
  showNoteModal(noteId) {
    const note = app.notes.find((n) => n.id === noteId)
    if (!note) return

    const modalContent = `
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-bold">View/Edit Note</h3>
                    <button onclick="app.deleteNote('${noteId}')"
                            class="px-4 py-2 bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors">
                        Delete
                    </button>
                </div>
                <form onsubmit="app.updateNote(event, '${noteId}')">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Title *</label>
                            <input type="text" name="title" required value="${escapeHtml(
                              note.title
                            )}"
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-sm font-semibold">Content (Markdown)</label>
                                <button type="button" onclick="app.toggleNotePreview()" id="preview-toggle-btn"
                                        class="text-xs px-3 py-1 bg-xp-secondary/20 text-xp-secondary rounded-lg hover:bg-xp-secondary/30">
                                    Preview
                                </button>
                            </div>
                            <textarea name="body" id="note-editor" rows="12"
                                      class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary font-mono text-sm">${escapeHtml(
                                        note.bodyMarkdown
                                      )}</textarea>
                            <div id="note-preview" class="hidden w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker min-h-[300px] overflow-y-auto">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
                            <input type="text" name="tags" value="${note.tags.join(
                              ", "
                            )}"
                                   class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary">
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="app.closeModal()"
                                class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                            Close
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                            Update Note
                        </button>
                    </div>
                </form>
            </div>
        `

    this.showModal(modalContent)
  },
  /**
   * Alterna entre el modo editor y vista previa de la nota
   * @returns {void}
   */
  toggleNotePreview() {
    const editor = document.getElementById("note-editor")
    const preview = document.getElementById("note-preview")
    const toggleBtn = document.getElementById("preview-toggle-btn")

    if (editor.classList.contains("hidden")) {
      // Cambiar al modo editor
      editor.classList.remove("hidden")
      preview.classList.add("hidden")
      toggleBtn.textContent = "Preview"
    } else {
      // Cambiar al modo vista previa
      const markdown = editor.value
      preview.innerHTML = this.parseMarkdown(markdown)
      editor.classList.add("hidden")
      preview.classList.remove("hidden")
      toggleBtn.textContent = "Edit"
    }
  },
  /**
   * Actualiza una nota existente
   * @param {Event} event - Evento del formulario
   * @param {string} noteId - ID de la nota
   * @returns {void}
   */
  updateNote(event, noteId) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const note = app.notes.find((n) => n.id === noteId)
    if (note) {
      note.title = formData.get("title")
      note.bodyMarkdown = formData.get("body") || ""
      note.tags = formData.get("tags")
        ? formData
            .get("tags")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : []
      note.updatedAt = Date.now()

      store.save(app.notes, "notes")
      this.closeModal()
      this.showToast("Note updated! ✓", "success")
      notes()
    }
  },
  /**
   * Elimina una nota
   * @param {string} noteId - ID de la nota
   * @returns {void}
   */
  deleteNote(noteId) {
    const index = app.notes.findIndex((n) => n.id === noteId)
    if (index !== -1) {
      const deleted = app.notes.splice(index, 1)[0]
      store.save(app.notes, "notes")
      this.closeModal()
      notes()
      this.showUndoToast(`Deleted "${deleted.title}"`, () => {
        app.notes.splice(index, 0, deleted)
        store.save(app.notes, "notes")
        notes()
      })
    }
  },
  /**
   * Parsea markdown básico a HTML
   * @param {string} markdown - Texto en formato markdown
   * @returns {string} - Texto convertido a HTML
   */
  parseMarkdown(markdown) {
    let html = markdown

    // Bloques de código (debe ser antes del código en línea)
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-100 dark:bg-xp-darker p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">${escapeHtml(
        code.trim()
      )}</code></pre>`
    })

    // Encabezados
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>'
    )
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>'
    )
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>'
    )

    // Negrita
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    )

    // Cursiva
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // Código en línea
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 dark:bg-xp-darker px-2 py-1 rounded text-sm font-mono text-xp-primary">$1</code>'
    )

    // Listas desordenadas
    html = html.replace(/^\- (.*)$/gim, '<li class="ml-6">• $1</li>')
    html = html.replace(
      /(<li class="ml-6">[\s\S]*<\/li>)/g,
      '<ul class="my-3">$1</ul>'
    )

    // Horizontal rules
    html = html.replace(/^\s*---\s*$/gim, '<hr class="my-6 border-gray-300"/>')

    // Párrafos
    html = html
      .split("\n\n")
      .map((para) => {
        if (
          para.startsWith("<h") ||
          para.startsWith("<ul") ||
          para.startsWith("<pre")
        ) {
          return para
        }
        return `<p class="my-3 leading-relaxed">${para}</p>`
      })
      .join("\n")

    // Imágenes
    html = html.replace(
      /!\[([^\]]*)\]\((https?:\/\/[^\s)]+\.(?:jpe?g|png|webp|gif))\)/gi,
      '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full"/>'
    )

    // Enlaces
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" class="text-xp-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    // Espacios múltiples
    html = html.replace(/ {2,}/g, (match) => "&nbsp;".repeat(match.length))

    // Salto de lineas
    html = html.replace(/\n/g, "<br>")

    return html
  },
  /**
   * Muestra el modal con el contenido especificado
   * @param {string} contentHtml - Contenido HTML del modal
   * @returns {void}
   */
  showModal: function (contentHtml) {
    const backdrop = document.getElementById("modal-backdrop")
    const modalContent = document.getElementById("modal-content")
    modalContent.innerHTML = contentHtml
    backdrop.classList.remove("hidden")
  },
  /**
   * Cierra el modal actual
   * @returns {void}
   */
  closeModal: function () {
    const backdrop = document.getElementById("modal-backdrop")
    backdrop.classList.add("hidden")
  },
  /**
   * Muestra un mensaje emergente (toast)
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje: "info", "success", "error"
   * @returns {void}
   */
  showToast: function (message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `toast px-6 py-3 rounded-lg shadow-lg text-white ${
      type === "success"
        ? "bg-xp-primary text-xp-darker"
        : type === "error"
        ? "bg-xp-danger"
        : "bg-xp-secondary"
    }`
    toast.textContent = message

    const container = document.getElementById("toast-container")
    container.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = "0"
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  },
  /**
   * Muestra un mensaje emergente (toast) con opción de deshacer
   * @param {string} message - Mensaje a mostrar
   * @param {Function} undoCallback - Función a ejecutar al deshacer
   * @returns {void}
   */
  showUndoToast: function (message, undoCallback) {
    const undoToast = document.getElementById("undo-toast")
    const undoMessage = document.getElementById("undo-message")

    undoMessage.textContent = message
    undoToast.classList.remove("hidden")

    this.undoCallback = undoCallback

    setTimeout(() => {
      undoToast.classList.add("hidden")
      this.undoCallback = null
    }, 5000)
  },
  /**
   * Ejecuta la acción de deshacer
   * @returns {void}
   */
  performUndo: function () {
    if (this.undoCallback) {
      this.undoCallback()
      this.undoCallback = null
    }
    document.getElementById("undo-toast").classList.add("hidden")
  },
  /**
   * Exporta los datos actuales a un archivo JSON descargable
   * @returns {void}
   */
  exportData() {
    const data = {
      budgets: this.budgets,
      tasks: this.tasks,
      notes: this.notes,
      habits: this.habits
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `productivity-xp-backup-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    this.showToast("Data exported successfully! 📥", "success")
    launchConfetti()
  },
  /**
   * Muestra el modal para importar datos desde un archivo JSON
   * @returns {void}
   */
  showImportModal() {
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Import Data</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    Upload a previously exported JSON file to restore your data. This will replace your current data.
                </p>
                <input type="file" id="import-file-input" accept=".json"
                       class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker mb-4">
                <div class="flex gap-3">
                    <button onclick="app.closeModal()"
                            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors">
                        Cancel
                    </button>
                    <button onclick="app.importData()"
                            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors">
                        Import
                    </button>
                </div>
            </div>
        `

    this.showModal(modalContent)
  },
  /**
   * Importa datos desde un archivo JSON seleccionado
   * @returns {void}
   */
  importData() {
    const fileInput = document.getElementById("import-file-input")
    const file = fileInput.files[0]

    if (!file) {
      this.showToast("Please select a file", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)

        if (
          !imported.budgets ||
          !imported.tasks ||
          !imported.notes ||
          !imported.habits
        ) {
          throw new Error("Invalid data format")
        }

        console.log({ imported })

        this.state = imported
        store.save(this.state.budgets, "budgets")
        store.save(this.state.tasks, "tasks")
        store.save(this.state.notes, "notes")
        store.save(this.state.habits, "habits")
        this.closeModal()
        this.showToast("Data imported successfully! 📤", "success")
        // TODO: Borrar cache de PWA para recargar los datos
        launchConfetti()
        render()
      } catch (err) {
        this.showToast("Failed to import data. Invalid file format.", "error")
        console.error("Import error:", err)
      }
    }

    reader.readAsText(file)
  },
  /**
   * Restaura los datos de demostración, reemplazando los datos actuales
   * @returns {void}
   */
  resetToDemo() {
    if (
      confirm(
        "This will replace all your current data with demo data. Are you sure?"
      )
    ) {
      const budgets = store.dummyBudget
      store.save(budgets, "budgets")
      const tasks = store.dummyTasks
      store.save(tasks, "tasks")
      const notes = store.dummyNotes
      store.save(notes, "notes")
      const habits = store.dummyHabits
      store.save(habits, "habits")
      this.showToast("Demo data restored! 🔄", "success")
      // TODO: Borrar cache de PWA para recargar los datos
      render()
    }
  },
  /**
   * Elimina todos los datos del usuario de forma permanente
   * @returns {void}
   */
  clearAllData() {
    if (
      confirm(
        "This will permanently delete all your data. This action cannot be undone. Are you sure?"
      )
    ) {
      this.budgets = []
      store.save(this.budgets, "budgets")
      this.tasks = []
      store.save(this.tasks, "tasks")
      this.notes = []
      store.save(this.notes, "notes")
      this.habits = []
      store.save(this.habits, "habits")
      this.showToast("All data cleared", "success")
      render()
    }
  }
}

const I18n = {
  currentLanguage: "es", // Idioma por defecto
  messages: {}, // Almacenará los mensajes cargados

  async init(defaultLang = "es") {
    // Detectar idioma del navegador si no hay uno guardado
    const savedLang = localStorage.getItem("userLanguage")
    this.currentLanguage =
      savedLang || navigator.language.split("-")[0] || defaultLang
        ? defaultLang
        : "en"
    // Asegurar que el idioma detectado esté disponible
    if (!["es", "en"].includes(this.currentLanguage)) {
      this.currentLanguage = defaultLang
    }
    console.log(`Idioma seleccionado: ${this.currentLanguage}`)
    await this.loadMessages(this.currentLanguage)
    this.applyTranslations() // Aplicar traducciones al HTML inicial
  },

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
      // Cargar mensajes en el idioma por defecto si falla
      if (lang !== "es") {
        // Asumiendo 'es' como fallback
        const response = await fetch(`/assets/locales/es.json`)
        this.messages = await response.json()
      }
    }
  },

  setLanguage(lang) {
    if (["es", "en"].includes(lang)) {
      this.currentLanguage = lang
      localStorage.setItem("userLanguage", lang)
      this.loadMessages(lang).then(() => {
        this.applyTranslations()
        // Opcional: Volver a renderizar la pantalla actual si es necesario
        app.init()
      })
    }
  },

  t(key, params = {}) {
    // Obtiene el mensaje traducido por clave
    // Soporta placeholders básicos: {nombre} -> params.nombre
    let message = key.split(".").reduce((obj, k) => obj?.[k], this.messages)
    if (message === undefined) {
      console.warn(`Translation key not found: ${key}`)
      return key // Devolver la clave si no se encuentra la traducción
    }
    if (params && typeof params === "object") {
      Object.keys(params).forEach((param) => {
        message = message.replace(new RegExp(`{${param}}`, "g"), params[param])
      })
    }
    return message
  },

  applyTranslations() {
    // Aplica traducciones a elementos con data-i18n
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n")
      const translation = this.t(key)
      // Soporta data-i18n-attr para traducir atributos como placeholder
      const attr = element.getAttribute("data-i18n-attr") || "textContent"
      if (attr === "textContent") {
        element.textContent = translation
      } else {
        element.setAttribute(attr, translation)
      }
    })
    // Actualizar el lang del <html> para SEO y accesibilidad
    document.getElementById("html-root").lang = this.currentLanguage
  }
}

/**
 * Inicializa el idioma de la aplicación
 * @event window load - Se ejecuta cuando la página ha cargado completamente
 */
window.addEventListener("load", () => {
  I18n.init().then(() => {
    app.init()
  })
  document
    .getElementById("language-selector")
    .addEventListener("change", function () {
      I18n.setLanguage(this.value)
    })
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          console.log("ServiceWorker registrado:", registration)
        })
        .catch(function (error) {
          console.log("ServiceWorker error:", error)
        })
    })
  }
})
