import { getTodayString } from '../../utils/date.js'
import { generateId } from '../../utils/id.js'

export class Subtask {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.text = data.text || ''
    this.done = data.done ?? false
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      done: this.done
    }
  }

  static fromJSON(data) {
    return new Subtask(data)
  }
}

export class Task {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ''
    this.description = data.description || ''
    this.dueDate = data.dueDate || ''
    this.priority = data.priority || 'medium'
    this.tags = Array.isArray(data.tags) ? data.tags : []
    this.subtasks = (data.subtasks || []).map(s =>
      s instanceof Subtask ? s : Subtask.fromJSON(s)
    )
    this.done = data.done ?? false
    this.order = data.order ?? 0
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || Date.now()
  }

  isToday() {
    return this.dueDate === getTodayString()
  }

  isMIT() {
    return !this.done && (this.priority === 'high' || this.isToday())
  }

  getSubtaskProgress() {
    if (this.subtasks.length === 0) return 0
    const done = this.subtasks.filter(s => s.done).length
    return Math.round((done / this.subtasks.length) * 100)
  }

  toggle() {
    this.done = !this.done
    this.updatedAt = Date.now()
  }

  toggleSubtask(subtaskId) {
    const subtask = this.subtasks.find(s => s.id === subtaskId)
    if (subtask) {
      subtask.done = !subtask.done
      this.updatedAt = Date.now()
    }
  }

  addSubtask(text) {
    const subtask = new Subtask({ text })
    this.subtasks.push(subtask)
    this.updatedAt = Date.now()
    return subtask
  }

  removeSubtask(subtaskId) {
    const index = this.subtasks.findIndex(s => s.id === subtaskId)
    if (index !== -1) {
      const removed = this.subtasks.splice(index, 1)[0]
      this.updatedAt = Date.now()
      return removed
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      tags: this.tags,
      subtasks: this.subtasks.map(s => s.toJSON()),
      done: this.done,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static fromJSON(data) {
    return new Task(data)
  }

  static validate(data) {
    const errors = []
    if (!data.title?.trim()) {
      errors.push('Title is required')
    }
    if (!['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('Priority must be low, medium or high')
    }
    if (data.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)) {
      errors.push('Due date must be in YYYY-MM-DD format')
    }
    if (data.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)) {
      const parsed = new Date(data.dueDate)
      if (isNaN(parsed.getTime())) {
        errors.push('Due date is not a valid date')
      }
    }
    return errors
  }
}
