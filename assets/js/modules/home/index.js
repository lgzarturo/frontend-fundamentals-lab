import { getTodayString } from "../../utils/date.js"
import { VisitTracker } from "../../services/visitTracker.js"
import { buildSummary } from "./summary.js"
import {
  activityItemTemplate,
  emptyActivityTemplate,
  emptyHabitsTemplate,
  emptyMITsTemplate,
  habitItemTemplate,
  mitItemTemplate,
  summaryTemplate
} from "./templates.js"
import {
  getExpandedSubtaskIds,
  toggleSubtaskExpanded
} from "../../utils/subtasksStorage.js"

export class HomeModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.container = null
  }

  init() {
    this.container = document.getElementById("home-screen")
    const tracker = new VisitTracker()
    this.storage.setVisits(tracker.getState().totalVisits)
    this._bindEvents()
  }

  render() {
    const tasks = this.storage.get("tasks") || []
    const habits = this.storage.get("habits") || []
    const budgets = this.storage.get("budgets") || []
    const notes = this.storage.get("notes") || []

    const mits = this._getMITs(tasks)
    const todayHabits = this._getTodayHabits(habits)
    const maxStreak = this._getMaxStreak(habits)
    const taskStats = this._getTaskStats(tasks)
    const budgetStats = this._getBudgetStats(budgets)

    this._renderMITs(mits)
    this._renderHabits(todayHabits, maxStreak)
    this._renderStats(taskStats, budgetStats, notes.length)
    this._renderActivity(tasks, notes)
    this._renderSummary()
  }

  /**
   * Recarga los datos desde el almacenamiento y re-renderiza
   * Útil tras importar/limpiar datos sin duplicar listeners
   */
  reload() {
    this.render()
  }

  _getMITs(tasks, limit = 3) {
    const today = getTodayString()
    return tasks
      .filter(t => !t.done && (t.priority === "high" || t.dueDate === today))
      .slice(0, limit)
  }

  _getTodayHabits(habits) {
    return habits
  }

  _getMaxStreak(habits) {
    if (!habits.length) return 0
    return Math.max(...habits.map(h => h.streak || 0))
  }

  _getTaskStats(tasks) {
    const today = getTodayString()
    const done = tasks.filter(t => t.done).length
    const todayTasks = tasks.filter(t => t.dueDate === today)
    const todayDone = todayTasks.filter(t => t.done).length
    return { total: tasks.length, done, today: todayTasks.length, todayDone }
  }

  _getBudgetStats(budgets) {
    return budgets.reduce(
      (acc, b) => {
        if (b.type === "spending") {
          const balance =
            (b.initialAmount || 0) +
            (b.transactions || []).reduce((s, t) => s + t.amount, 0)
          acc.totalAvailable += balance
        } else {
          acc.totalGoal += b.goalAmount || 0
        }
        return acc
      },
      { totalAvailable: 0, totalGoal: 0 }
    )
  }

  _getRecentActivity(tasks, notes, limit = 5) {
    const taskItems = tasks.map(t => ({ ...t, type: "task" }))
    const noteItems = notes.map(n => ({ ...n, type: "note" }))
    return [...taskItems, ...noteItems]
      .sort(
        (a, b) =>
          (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      )
      .slice(0, limit)
  }

  _renderMITs(mits) {
    const el = document.getElementById("home-mits-list")
    if (!el) return
    const expandedIds = getExpandedSubtaskIds()
    el.innerHTML = mits.length
      ? mits
          .map(t => mitItemTemplate(t, expandedIds.has(t.id)))
          .join("")
      : emptyMITsTemplate()
  }

  _renderHabits(habits, maxStreak) {
    const listEl = document.getElementById("home-habits-list")
    const streakEl = document.getElementById("home-habits-streak")
    const today = getTodayString()

    if (listEl) {
      listEl.innerHTML = habits.length
        ? habits.map(h => habitItemTemplate(h, today)).join("")
        : emptyHabitsTemplate()
    }
    if (streakEl) streakEl.textContent = maxStreak
  }

  _renderStats(taskStats, budgetStats, notesCount) {
    const tasksDoneEl = document.getElementById("home-tasks-done")
    const budgetEl = document.getElementById("home-budget-remaining")
    const notesEl = document.getElementById("home-notes-count")

    if (tasksDoneEl)
      tasksDoneEl.textContent = `${taskStats.done}/${taskStats.total}`
    if (budgetEl)
      budgetEl.textContent = `$${budgetStats.totalAvailable.toFixed(2)}`
    if (notesEl) notesEl.textContent = notesCount
  }

  _renderActivity(tasks, notes) {
    const el = document.getElementById("home-recent-activity")
    if (!el) return
    const items = this._getRecentActivity(tasks, notes)
    el.innerHTML = items.length
      ? items.map(item => activityItemTemplate(item, this.i18n)).join("")
      : emptyActivityTemplate()
  }

  _renderSummary() {
    const el = document.getElementById("home-summary")
    if (!el) return
    this.storage.setVisits(new VisitTracker().getState().totalVisits)
    const entries = buildSummary({
      tasks: this.storage.get("tasks") || [],
      habits: this.storage.get("habits") || [],
      budgets: this.storage.get("budgets") || [],
      usage: this.storage.getUsage(),
      today: getTodayString()
    })
    el.innerHTML = summaryTemplate(
      entries.map(({ key, params }) => this.i18n.t(key, params))
    )
  }

  _countInteraction() {
    this.storage.incrementInteractions()
    this.render()
  }

  _bindEvents() {
    this.eventBus.on("task:created", () => this._countInteraction())
    this.eventBus.on("task:toggled", () => this._countInteraction())
    this.eventBus.on("task:updated", () => this._countInteraction())
    this.eventBus.on("task:subtask-toggled", () => this.render())
    this.eventBus.on("habit:toggled", () => this._countInteraction())
    this.eventBus.on("budget:created", () => this._countInteraction())
    this.eventBus.on("note:created", () => this._countInteraction())

    // Delegación para completar MITs, subtareas y hábitos desde la vista de inicio
    if (this.container) {
      this.container.addEventListener("click", e => {
        const target = e.target.closest("[data-action]")
        if (!target) return

        switch (target.dataset.action) {
          case "toggle-task":
            this.eventBus.emit("task:toggle", target.dataset.taskId)
            break
          case "toggle-subtask":
            this.eventBus.emit("task:toggle-subtask", {
              taskId: target.dataset.taskId,
              subtaskId: target.dataset.subtaskId
            })
            break
          case "toggle-subtasks-expand":
            toggleSubtaskExpanded(target.dataset.taskId)
            this.render()
            break
          case "toggle-habit":
            this.eventBus.emit("habit:toggle", {
              habitId: target.dataset.habitId
            })
            break
        }
      })
    }
  }
}
