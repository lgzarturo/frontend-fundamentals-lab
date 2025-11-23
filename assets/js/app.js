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
 * Genera un identificador único basado en la fecha actual y un valor aleatorio.
 * Útil para asignar IDs a los elementos.
 * @returns {string} ID único generado.
 * @example
 * const id = generateId(); // "kz7v1w8xg2"
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Genera registros de éxito/fracaso para los últimos días
 * @param {number} days - Número de días hacia atrás para generar registros
 * @param {number} successRate - Tasa de éxito (0 a 1)
 * @returns {object} Objeto con fechas como claves y resultados booleanos como valores
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
 * @returns {string[]} Array con las fechas de los últimos 7 días
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

/**
 * Renderiza la pantalla de inicio con las tareas MIT (Most Important Tasks)
 * Filtra, ordena y muestra las 3 tareas más importantes no completadas
 */
function home() {
  const todayStr = formatDate(new Date())
  const maxStreak = Math.max(...app.habits.map((h) => h.streak || 0), 0)

  document.getElementById("home-habits-streak").textContent = maxStreak

  const mits = app.tasks
    .filter((t) => !t.done && (t.priority === "high" || t.dueDate === todayStr))
    .sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1
      if (b.priority === "high" && a.priority !== "high") return 1
      return 0
    })
    .slice(0, 3)

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

  document.getElementById("home-mits-list").innerHTML = mitsHtml

  // Renderizar los hábitos en el inicio
  const habitsHtml = app.habits
    .map((habit) => {
      const isDone = habit.dailyRecords[todayStr]
      return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
                    <div class="flex items-center gap-3 flex-1">
                        <button onclick="toggleHabit('${habit.id}')"
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
}

/**
 * Renderiza la pantalla de presupuestos
 */
function budgets() {
  console.log("Renderizando la pantalla de presupuestos")
}

// Controlador de filtro actual
let currentFilter = "all"

/**
 * Renderiza la lista de tareas con filtros y ordenamiento
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
                                <button onclick="showEditTaskModal('${
                                  task.id
                                }')"
                                        class="text-sm px-3 py-1 bg-xp-secondary/20 hover:bg-xp-secondary/30 rounded transition-colors">
                                    Edit
                                </button>
                                <button onclick="deleteTask('${task.id}')"
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
 * Funcionalidad de filtrado de tareas
 * @param {string} filter Filtro seleccionado: "all", "today", "high", "completed"
 */
function filterTasks(filter) {
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
}

/**
 * Muestra el modal para crear una nueva tarea
 */
function showCreateTaskModal() {
  const todayStr = formatDate(new Date())

  // Contenido del modal para crear una nueva tarea
  const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Create New Task</h3>
                <form onsubmit="createTask(event)">
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
}

/**
 * Agrega una nueva tarea basada en los datos del formulario
 * @param {Event} e Evento del formulario
 */
function createTask(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

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
}

/**
 * Muestra el modal para editar una tarea existente
 * @param {string} taskId ID de la tarea a editar
 * @returns
 */
function showEditTaskModal(taskId) {
  const task = app.tasks.find((t) => t.id === taskId)
  if (!task) return

  // Contenido del modal para editar la tarea
  const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Edit Task</h3>
                <form onsubmit="updateTask(event, '${taskId}')">
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
                            <button type="button" onclick="addSubtaskInput()"
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
}

/**
 * Agrega un nuevo campo de entrada para subtareas en el formulario de edición de tareas
 */
function addSubtaskInput() {
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
}

/**
 * Función para actualizar una tarea existente
 * @param {Event} e Evento del formulario
 * @param {string} taskId ID de la tarea a actualizar
 */
function updateTask(e, taskId) {
  e.preventDefault()
  const formData = new FormData(e.target)
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
        id: input.dataset.subtaskId || this.generateId(),
        text: input.value,
        done:
          task.subtasks.find((st) => st.id === input.dataset.subtaskId)?.done ||
          false
      }))
      .filter((st) => st.text.trim())

    store.save(app.tasks, "tasks")
    app.closeModal()
    app.showToast("Task updated! ✓", "success")
    tasks()
  }
}

/**
 * Función para eliminar una tarea por su ID
 * @param {string} taskId ID de la tarea a eliminar
 */
function deleteTask(taskId) {
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
}

/**
 * Renderiza la pantalla de hábitos
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
                        <button onclick="deleteHabit('${habit.id}')"
                                class="px-3 py-1 text-xs bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors">
                            Delete
                        </button>
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <button onclick="toggleHabit('${habit.id}')"
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
 * Crea un hábito a partir de una plantilla predefinida
 * @param {number} templateIndex Índice de la plantilla a usar
 */
function createHabitFromTemplate(templateIndex) {
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
}

/**
 * Crea un hábito personalizado a partir de un formulario
 * @param {Event} e Evento del formulario
 */
function createCustomHabit(e) {
  e.preventDefault()
  const formData = new FormData(e.target)

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
}

/**
 * Muestra el modal para agregar un nuevo hábito
 */
function showHabitTemplatesModal() {
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
                            <button onclick="createHabitFromTemplate(${idx})"
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
                    <form onsubmit="createCustomHabit(event)">
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
}

/**
 * Elimina un hábito por su ID
 * @param {string} habitId ID del hábito a eliminar
 */
function deleteHabit(habitId) {
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
}

/**
 * Alterna el estado de un hábito para hoy
 * @param {string} habitId ID del hábito a alternar
 * @returns
 */
function toggleHabit(habitId) {
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

  console.log(
    `Habits completed today: ${completedHabitsToday} / ${totalHabits}`
  )

  if (totalHabits === completedHabitsToday && totalHabits > 0) {
    launchConfetti()
  }

  habits()
  if (currentScreen === "home") home()
}

/**
 * Renderiza la pantalla actual según el estado
 */
function render() {
  console.log("Renderizando la pantalla:", currentScreen)
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
 * Objeto para gestionar el almacenamiento local (localStorage)
 * @type {object}
 * @namespace
 * @method init Inicializa el almacenamiento con datos de ejemplo si no existen
 * @method save Guarda datos en el localStorage
 * @method load Carga datos desde el localStorage
 * @method loadCounter Carga y actualiza el contador de visitas
 * @property {Array<Task>} dummyTasks Datos con tareas de ejemplo
 * @property {Array<Habit>} dummyHabits Datos con hábitos de ejemplo
 */
const store = {
  /**
   * Inicializa el almacenamiento con datos de ejemplo si no existen
   * @param {string} namespace Espacio de nombres para el localStorage
   * */
  init: function () {
    if (!localStorage.getItem("tasks")) {
      this.save(this.dummyTasks, "tasks")
    }
    if (!localStorage.getItem("habits")) {
      this.save(this.dummyHabits, "habits")
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
          // Asignar los datos cargados a la aplicación según el espacio de nombres
          switch (namespace) {
            case "tasks":
              app.tasks = JSON.parse(data)
              break
            case "habits":
              app.habits = JSON.parse(data)
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
   */
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
  ],
  /**
   * Datos con hábitos de ejemplo
   * @type {Array<object>}
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
  ]
}

/**
 * Objeto principal de la aplicación.
 * Gestiona la navegación, el estado y las operaciones principales.
 * @type {object}
 * @namespace
 * @property {Task[]} tasks - Lista de tareas.
 * @property {Habit[]} habits - Lista de hábitos.
 * @method init Inicializa la aplicación.
 * @method navigateTo Cambia la pantalla actual.
 * @method toggleTask Alterna el estado de una tarea.
 * @method showModal Muestra un modal con contenido HTML.
 * @method closeModal Cierra el modal actual.
 * @method showToast Muestra un mensaje emergente.
 * @method showUndoToast Muestra un toast con opción de deshacer.
 * @method performUndo Ejecuta la acción de deshacer.
 */
const app = {
  /** Inicializa la app y navega a la pantalla principal */
  init: function () {
    // Al ejecutar por primera vez se deben de crear los datos iniciales.
    store.init()
    store.load("tasks", "array")
    store.load("habits", "array")
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
  habits: [],
  /**
   * Cuenta de visitas y lanzamiento de confeti cada 10 visitas
   * @return {void}
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
   * Muestra el modal para crear un nuevo presupuesto
   * @return {void}
   */
  showCreateBudgetModal() {
    const modalContent = `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4">Create New Budget</h3>
                <form onsubmit="app.showToast('Aún no esta implementado', 'error'); app.closeModal(); return false;">
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
   * Muestra el modal con el contenido especificado
   * @param {string} contentHtml
   */
  showModal: function (contentHtml) {
    const backdrop = document.getElementById("modal-backdrop")
    const modalContent = document.getElementById("modal-content")
    modalContent.innerHTML = contentHtml
    backdrop.classList.remove("hidden")
  },
  /**
   * Cierra el modal actual
   */
  closeModal: function () {
    const backdrop = document.getElementById("modal-backdrop")
    backdrop.classList.add("hidden")
  },
  /**
   * Muestra un mensaje emergente (toast)
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje: "info", "success", "error"
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
   * @return {void}
   */
  performUndo: function () {
    if (this.undoCallback) {
      this.undoCallback()
      this.undoCallback = null
    }
    document.getElementById("undo-toast").classList.add("hidden")
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
