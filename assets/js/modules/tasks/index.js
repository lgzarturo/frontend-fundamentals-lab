import { Task } from "./models.js"
import {
  taskListTemplate,
  createTaskModalTemplate,
  editTaskModalTemplate
} from "./templates.js"
import { TagInput } from "../../components/tagInput.js"

export class TasksModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.tasks = []
    this.container = null
    this.modalContainer = null
    this.activeFilter = "all"
  }

  init() {
    this._loadTasks()
    this.container = document.getElementById("tasks-list")
    this.modalContainer = document.getElementById("modal-content")
    this._bindEvents()
  }

  render() {
    if (!this.container) return

    const filtered = this.getFilteredTasks(this.activeFilter)
    this.container.innerHTML = taskListTemplate(
      filtered,
      this.activeFilter,
      this.i18n
    )
  }

  createTask(data) {
    const errors = Task.validate(data)
    if (errors.length) throw new Error(errors.join(", "))

    const task = new Task({
      title: data.title,
      description: data.description || "",
      dueDate: data.dueDate || "",
      priority: data.priority || "medium",
      tags: data.tags || [],
      order: this.tasks.length
    })

    this.tasks.push(task)
    this._saveTasks()
    this.render()
    this.eventBus.emit("task:created", task)
    return task
  }

  updateTask(taskId, data) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    const errors = Task.validate({ ...task, ...data })
    if (errors.length) throw new Error(errors.join(", "))

    Object.assign(task, data, { updatedAt: Date.now() })
    this._saveTasks()
    this.render()
    this.eventBus.emit("task:updated", task)
    return task
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index === -1) throw new Error(`Task not found: ${taskId}`)

    const deleted = this.tasks.splice(index, 1)[0]
    this._saveTasks()
    this.render()
    this.eventBus.emit("undo:show", {
      message: `${this.i18n?.getMessage("ui.common.deleted")} "${deleted.title}"`,
      undoCallback: () => {
        this.tasks.splice(index, 0, deleted)
        this._saveTasks()
        this.render()
      }
    })
    this.eventBus.emit("task:deleted", deleted)
    return deleted
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    task.toggle()
    this._saveTasks()
    this.render()
    this.eventBus.emit("task:toggled", task)
    return task
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    task.toggleSubtask(subtaskId)
    this._saveTasks()
    this.render()
    return task
  }

  reorderTasks(orderedIds) {
    orderedIds.forEach((id, index) => {
      const task = this.tasks.find(t => t.id === id)
      if (task) task.order = index
    })
    this._saveTasks()
    this.render()
  }

  getFilteredTasks(filter = "all") {
    const today = new Date().toISOString().slice(0, 10)
    let result

    switch (filter) {
      case "today":
        result = this.tasks.filter(t => t.dueDate === today)
        break
      case "high":
        result = this.tasks.filter(t => t.priority === "high" && !t.done)
        break
      case "completed":
        result = this.tasks.filter(t => t.done)
        break
      default:
        result = [...this.tasks]
    }

    return result.sort((a, b) => a.order - b.order)
  }

  getMITs(limit = 3) {
    return this.tasks
      .filter(t => t.isMIT())
      .sort((a, b) => a.order - b.order)
      .slice(0, limit)
  }

  getAllTags() {
    const tagsSet = new Set()
    this.tasks.forEach(task => {
      if (Array.isArray(task.tags)) {
        task.tags.forEach(t => t && tagsSet.add(t.trim()))
      }
    })
    try {
      const storedNotes = this.storage?.get("notes")
      if (Array.isArray(storedNotes)) {
        storedNotes.forEach(note => {
          if (Array.isArray(note.tags)) {
            note.tags.forEach(t => t && tagsSet.add(t.trim()))
          }
        })
      }
    } catch {
      // Ignora errores si no hay almacenamiento
    }
    return Array.from(tagsSet).sort()
  }

  showCreateModal() {
    if (!this.modalContainer) return
    this.eventBus.emit("modal:open", {
      contentHtml: createTaskModalTemplate(this.i18n)
    })

    const form = document.getElementById("create-task-form")
    const tagsContainer = document.getElementById("task-tags-input-container")
    let tagInputInstance = null

    if (tagsContainer) {
      tagInputInstance = new TagInput({
        container: tagsContainer,
        initialTags: [],
        availableTags: () => this.getAllTags(),
        name: "tags",
        i18n: this.i18n
      })
    }

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      const tags = tagInputInstance
        ? tagInputInstance.getTags()
        : (formData.get("tags") || "")
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)

      this.createTask({
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate"),
        priority: formData.get("priority"),
        tags
      })
      tagInputInstance?.destroy()
      this.eventBus.emit("modal:close")
    })
  }

  showEditModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task || !this.modalContainer) return

    this.eventBus.emit("modal:open", {
      contentHtml: editTaskModalTemplate(task, this.i18n)
    })

    const form = document.getElementById("edit-task-form")
    const tagsContainer = document.getElementById("task-tags-input-container")
    let tagInputInstance = null

    if (tagsContainer) {
      tagInputInstance = new TagInput({
        container: tagsContainer,
        initialTags: task.tags,
        availableTags: () => this.getAllTags(),
        name: "tags",
        i18n: this.i18n
      })
    }

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      const tags = tagInputInstance
        ? tagInputInstance.getTags()
        : (formData.get("tags") || "")
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)

      this.updateTask(taskId, {
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate"),
        priority: formData.get("priority"),
        tags
      })
      tagInputInstance?.destroy()
      this.eventBus.emit("modal:close")
    })

    // subtask add
    const addSubtaskBtn = document.getElementById("add-subtask-btn")
    if (addSubtaskBtn) {
      addSubtaskBtn.addEventListener("click", () => {
        const input = document.getElementById("new-subtask-input")
        const text = input?.value.trim()
        if (!text) return
        task.addSubtask(text)
        this._saveTasks()
        input.value = ""
        tagInputInstance?.destroy()
        this.showEditModal(taskId)
      })
    }

    // subtask toggle / remove delegation
    const subtaskList = document.getElementById("subtask-list")
    if (subtaskList) {
      subtaskList.addEventListener("click", e => {
        const toggleBtn = e.target.closest('[data-action="toggle-subtask"]')
        const removeBtn = e.target.closest('[data-action="remove-subtask"]')

        if (toggleBtn) {
          this.toggleSubtask(taskId, toggleBtn.dataset.subtaskId)
          tagInputInstance?.destroy()
          this.showEditModal(taskId)
        }
        if (removeBtn) {
          task.removeSubtask(removeBtn.dataset.subtaskId)
          this._saveTasks()
          this.render()
          tagInputInstance?.destroy()
          this.showEditModal(taskId)
        }
      })
    }
  }

  /**
   * Recarga los datos desde el almacenamiento y re-renderiza
   * Útil tras importar/limpiar datos sin duplicar listeners
   */
  reload() {
    this._loadTasks()
    this.render()
  }

  _loadTasks() {
    const data = this.storage.get("tasks")
    if (data && Array.isArray(data)) {
      this.tasks = data.map(t => Task.fromJSON(t))
    }
  }

  _saveTasks() {
    this.storage.set(
      "tasks",
      this.tasks.map(t => t.toJSON())
    )
  }

  _bindEvents() {
    this.eventBus.on("task:create", () => this.showCreateModal())
    this.eventBus.on("task:update", taskId => this.showEditModal(taskId))
    this.eventBus.on("task:delete", taskId => this.deleteTask(taskId))
    this.eventBus.on("task:toggle", taskId => this.toggleTask(taskId))
    this.eventBus.on("task:reorder", orderedIds =>
      this.reorderTasks(orderedIds)
    )

    if (this.container) {
      this._bindDragEvents()

      this.container.addEventListener("click", e => {
        const target = e.target.closest("[data-action]")
        if (!target) return

        const action = target.dataset.action
        const taskId = target.dataset.taskId

        switch (action) {
          case "create-task":
            this.showCreateModal()
            break
          case "toggle-task":
            this.toggleTask(taskId)
            break
          case "edit-task":
            this.showEditModal(taskId)
            break
          case "delete-task":
            if (
              confirm(
                this.i18n?.getMessage("ui.common.confirmDelete") ||
                  "Delete this task?"
              )
            ) {
              this.deleteTask(taskId)
            }
            break
          case "set-filter":
            this.activeFilter = target.dataset.filter || "all"
            this.render()
            break
        }
      })
    }
  }

  /**
   * Reordenamiento por drag & drop con delegación en el contenedor
   * @private
   */
  _bindDragEvents() {
    this.container.addEventListener("dragstart", e => {
      const item = e.target.closest("[data-task-id]")
      if (!item) return
      item.classList.add("dragging")
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/plain", item.dataset.taskId)
    })

    this.container.addEventListener("dragover", e => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      const dragging = this.container.querySelector(".dragging")
      if (!dragging) return
      const afterElement = this._getDragAfterElement(e.clientY)
      if (afterElement == null) {
        this.container.appendChild(dragging)
      } else {
        this.container.insertBefore(dragging, afterElement)
      }
    })

    this.container.addEventListener("drop", e => {
      e.preventDefault()
      const orderedIds = [
        ...this.container.querySelectorAll("[data-task-id]")
      ].map(el => el.dataset.taskId)
      this.reorderTasks(orderedIds)
    })

    this.container.addEventListener("dragend", e => {
      const item = e.target.closest("[data-task-id]")
      if (item) item.classList.remove("dragging")
    })
  }

  /**
   * Obtiene el elemento después del cual insertar la tarea arrastrada
   * @param {number} y - Posición Y del cursor
   * @returns {HTMLElement|null} Elemento de referencia o null si va al final
   * @private
   */
  _getDragAfterElement(y) {
    const draggableElements = [
      ...this.container.querySelectorAll("[data-task-id]:not(.dragging)")
    ]

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        }
        return closest
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element
  }
}
