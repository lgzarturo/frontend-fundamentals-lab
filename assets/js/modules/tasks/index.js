import { Task } from './models.js'
import {
  taskListTemplate,
  createTaskModalTemplate,
  editTaskModalTemplate
} from './templates.js'

export class TasksModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.tasks = []
    this.container = null
    this.modalContainer = null
    this.activeFilter = 'all'
    this._undoStack = []
  }

  init() {
    this._loadTasks()
    this.container = document.getElementById('tasks-list')
    this.modalContainer = document.getElementById('modal-content')
    this._bindEvents()
  }

  render() {
    if (!this.container) return

    const filtered = this.getFilteredTasks(this.activeFilter)
    this.container.innerHTML = taskListTemplate(filtered, this.activeFilter, this.i18n)
  }

  createTask(data) {
    const errors = Task.validate(data)
    if (errors.length) throw new Error(errors.join(', '))

    const task = new Task({
      title: data.title,
      description: data.description || '',
      dueDate: data.dueDate || '',
      priority: data.priority || 'medium',
      tags: data.tags || [],
      order: this.tasks.length
    })

    this.tasks.push(task)
    this._saveTasks()
    this.render()
    this.eventBus.emit('task:created', task)
    return task
  }

  updateTask(taskId, data) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    const errors = Task.validate({ ...task, ...data })
    if (errors.length) throw new Error(errors.join(', '))

    Object.assign(task, data, { updatedAt: Date.now() })
    this._saveTasks()
    this.render()
    this.eventBus.emit('task:updated', task)
    return task
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index === -1) throw new Error(`Task not found: ${taskId}`)

    const deleted = this.tasks.splice(index, 1)[0]
    this._undoStack.push({ task: deleted, index })
    this._saveTasks()
    this.render()
    this.eventBus.emit('task:deleted', deleted)
    return deleted
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) throw new Error(`Task not found: ${taskId}`)

    task.toggle()
    this._saveTasks()
    this.render()
    this.eventBus.emit('task:toggled', task)
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

  getFilteredTasks(filter = 'all') {
    const today = new Date().toISOString().slice(0, 10)
    let result

    switch (filter) {
      case 'today':
        result = this.tasks.filter(t => t.dueDate === today)
        break
      case 'high':
        result = this.tasks.filter(t => t.priority === 'high' && !t.done)
        break
      case 'completed':
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

  showCreateModal() {
    if (!this.modalContainer) return
    this.modalContainer.innerHTML = createTaskModalTemplate(this.i18n)
    this._showModal()

    const form = document.getElementById('create-task-form')
    form.addEventListener('submit', e => {
      e.preventDefault()
      const formData = new FormData(form)
      const tagsRaw = formData.get('tags') || ''
      this.createTask({
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        priority: formData.get('priority'),
        tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      })
      this._closeModal()
    })
  }

  showEditModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task || !this.modalContainer) return

    this.modalContainer.innerHTML = editTaskModalTemplate(task, this.i18n)
    this._showModal()

    const form = document.getElementById('edit-task-form')
    form.addEventListener('submit', e => {
      e.preventDefault()
      const formData = new FormData(form)
      const tagsRaw = formData.get('tags') || ''
      this.updateTask(taskId, {
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        priority: formData.get('priority'),
        tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      })
      this._closeModal()
    })

    // subtask add
    const addSubtaskBtn = document.getElementById('add-subtask-btn')
    if (addSubtaskBtn) {
      addSubtaskBtn.addEventListener('click', () => {
        const input = document.getElementById('new-subtask-input')
        const text = input?.value.trim()
        if (!text) return
        task.addSubtask(text)
        this._saveTasks()
        input.value = ''
        this.showEditModal(taskId)
      })
    }

    // subtask toggle / remove delegation
    const subtaskList = document.getElementById('subtask-list')
    if (subtaskList) {
      subtaskList.addEventListener('click', e => {
        const toggleBtn = e.target.closest('[data-action="toggle-subtask"]')
        const removeBtn = e.target.closest('[data-action="remove-subtask"]')

        if (toggleBtn) {
          this.toggleSubtask(taskId, toggleBtn.dataset.subtaskId)
          this.showEditModal(taskId)
        }
        if (removeBtn) {
          task.removeSubtask(removeBtn.dataset.subtaskId)
          this._saveTasks()
          this.render()
          this.showEditModal(taskId)
        }
      })
    }
  }

  _loadTasks() {
    const data = this.storage.get('tasks')
    if (data && Array.isArray(data)) {
      this.tasks = data.map(t => Task.fromJSON(t))
    }
  }

  _saveTasks() {
    this.storage.set('tasks', this.tasks.map(t => t.toJSON()))
  }

  _bindEvents() {
    this.eventBus.on('task:create', () => this.showCreateModal())
    this.eventBus.on('task:update', taskId => this.showEditModal(taskId))
    this.eventBus.on('task:delete', taskId => this.deleteTask(taskId))
    this.eventBus.on('task:toggle', taskId => this.toggleTask(taskId))
    this.eventBus.on('task:reorder', orderedIds => this.reorderTasks(orderedIds))

    if (this.container) {
      this.container.addEventListener('click', e => {
        const target = e.target.closest('[data-action]')
        if (!target) return

        const action = target.dataset.action
        const taskId = target.dataset.taskId

        switch (action) {
          case 'create-task':
            this.showCreateModal()
            break
          case 'toggle-task':
            this.toggleTask(taskId)
            break
          case 'edit-task':
            this.showEditModal(taskId)
            break
          case 'delete-task':
            if (confirm(this.i18n?.getMessage('tasks.confirmDelete') || 'Delete this task?')) {
              this.deleteTask(taskId)
            }
            break
          case 'set-filter':
            this.activeFilter = target.dataset.filter || 'all'
            this.render()
            break
        }
      })
    }
  }

  _showModal() {
    const modal = document.getElementById('modal')
    if (modal) modal.classList.remove('hidden')
  }

  _closeModal() {
    const modal = document.getElementById('modal')
    if (modal) modal.classList.add('hidden')
    if (this.modalContainer) this.modalContainer.innerHTML = ''
  }
}
