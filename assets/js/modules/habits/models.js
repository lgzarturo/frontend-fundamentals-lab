import { formatDate, getLastNDays, getTodayString } from "../../utils/date.js"
import { generateId } from "../../utils/id.js"

export class Habit {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ""
    this.description = data.description || ""
    this.schedule = data.schedule || "daily"
    this.dailyRecords = data.dailyRecords || {}
    this.streak = data.streak || 0
    this.color = data.color || "#00ff88"
    this.createdAt = data.createdAt || Date.now()
  }

  isCompletedOn(dateStr) {
    return this.dailyRecords[dateStr] === true
  }

  isCompletedToday() {
    return this.isCompletedOn(getTodayString())
  }

  toggle(dateStr = getTodayString()) {
    this.dailyRecords[dateStr] = !this.dailyRecords[dateStr]
    this._recalculateStreak()
    return this.dailyRecords[dateStr]
  }

  _recalculateStreak() {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      if (this.dailyRecords[dateStr]) streak++
      else break
    }
    this.streak = streak
  }

  getCompletionRate(days = 30) {
    const dates = getLastNDays(days)
    const completed = dates.filter(d => this.dailyRecords[d] === true).length
    return dates.length === 0 ? 0 : (completed / dates.length) * 100
  }

  getWeekRecords() {
    return getLastNDays(7).map(date => ({
      date,
      completed: this.dailyRecords[date] === true
    }))
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      schedule: this.schedule,
      dailyRecords: { ...this.dailyRecords },
      streak: this.streak,
      color: this.color,
      createdAt: this.createdAt
    }
  }

  static fromJSON(data) {
    return new Habit(data)
  }

  static validate(data) {
    const errors = []
    if (!data.title?.trim()) {
      errors.push("Title is required")
    }
    if (data.schedule && data.schedule !== "daily") {
      errors.push("Schedule must be daily")
    }
    if (
      data.color !== undefined &&
      (typeof data.color !== "string" || !data.color.trim())
    ) {
      errors.push("Color must be a non-empty string")
    }
    return errors
  }
}
