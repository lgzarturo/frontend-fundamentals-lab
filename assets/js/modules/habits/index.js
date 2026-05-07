import { Habit } from './models.js'
import {
  emptyHabitsTemplate,
  habitCardTemplate,
  habitListTemplate,
  habitTemplatesModalTemplate
} from './templates.js'

export class HabitsModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.habits = []
    this.container = null
    this.modalContainer = null
  }

  init() {
    this._loadHabits()
    this.container = document.getElementById('habits-list')
    this.modalContainer = document.getElementById('modal-content')
    this._bindEvents()
  }

  render() {
    if (!this.container) return
    this.container.innerHTML = habitListTemplate(this.habits, this.i18n)
  }

  createHabit(data) {
    const errors = Habit.validate(data)
    if (errors.length) throw new Error(errors.join(', '))

    const habit = new Habit({
      title: data.title,
      description: data.description,
      schedule: data.schedule || 'daily',
      color: data.color || '#00ff88'
    })

    this.habits.push(habit)
    this._saveHabits()
    this.render()
    this.eventBus.emit('habit:created', habit)
    return habit
  }

  createFromTemplate(templateData) {
    return this.createHabit(templateData)
  }

  deleteHabit(habitId) {
    const index = this.habits.findIndex(h => h.id === habitId)
    if (index === -1) throw new Error(`Habit not found: ${habitId}`)

    const deleted = this.habits.splice(index, 1)[0]
    this._saveHabits()
    this.render()
    this.eventBus.emit('habit:deleted', deleted)
    return deleted
  }

  toggleHabit(habitId, dateStr) {
    const habit = this.habits.find(h => h.id === habitId)
    if (!habit) throw new Error(`Habit not found: ${habitId}`)

    const completed = habit.toggle(dateStr)
    this._saveHabits()
    this.render()
    this.eventBus.emit('habit:toggled', { habit, completed })

    const allDone = this.habits.every(h => h.isCompletedToday())
    if (allDone && this.habits.length > 0) {
      this.eventBus.emit('habit:allCompleted', this.habits)
    }

    return completed
  }

  getMaxStreak() {
    if (this.habits.length === 0) return 0
    return Math.max(...this.habits.map(h => h.streak))
  }

  getTodayCompletionRate() {
    if (this.habits.length === 0) return 0
    const completed = this.habits.filter(h => h.isCompletedToday()).length
    return (completed / this.habits.length) * 100
  }

  showTemplatesModal() {
    if (!this.modalContainer) return
    this.modalContainer.innerHTML = habitTemplatesModalTemplate(this.i18n)
    this._showModal()

    const form = document.getElementById('create-habit-form')
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        const formData = new FormData(form)
        this.createHabit({
          title: formData.get('title'),
          description: formData.get('description'),
          color: formData.get('color') || '#00ff88'
        })
        this._closeModal()
      })
    }

    // template clicks are handled via event delegation on modalContainer
    this.modalContainer.addEventListener('click', e => {
      const card = e.target.closest('[data-action="use-template"]')
      if (!card) return
      const title = card.dataset.title
      const description = card.dataset.description
      const color = card.dataset.color
      this.createFromTemplate({ title, description, color })
      this._closeModal()
    })
  }

  _loadHabits() {
    const data = this.storage.get('habits')
    if (data && Array.isArray(data)) {
      this.habits = data.map(h => Habit.fromJSON(h))
    }
  }

  _saveHabits() {
    this.storage.set('habits', this.habits.map(h => h.toJSON()))
  }

  _bindEvents() {
    this.eventBus.on('habit:create', () => this.showTemplatesModal())
    this.eventBus.on('habit:delete', habitId => this.deleteHabit(habitId))
    this.eventBus.on('habit:toggle', ({ habitId, dateStr }) =>
      this.toggleHabit(habitId, dateStr)
    )

    if (this.container) {
      this.container.addEventListener('click', e => {
        const target = e.target.closest('[data-action]')
        if (!target) return

        const action = target.dataset.action
        const habitId = target.dataset.habitId

        switch (action) {
          case 'toggle-habit':
            this.toggleHabit(habitId)
            break
          case 'delete-habit':
            if (confirm(this.i18n?.getMessage('habits.confirmDelete') || 'Delete this habit?')) {
              this.deleteHabit(habitId)
            }
            break
          case 'create-habit':
            this.showTemplatesModal()
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
