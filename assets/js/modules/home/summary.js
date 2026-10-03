import { Budget } from "../budgets/models.js"
import { Habit } from "../habits/models.js"

const P = "app.screens.home.summary."

const plural = (name, n) => `${P}${name}.${n === 1 ? "one" : "other"}`

function summarizeTasks(tasks, today) {
  const pending = tasks.filter(t => !t.done)
  const dueToday = pending.filter(t => t.dueDate === today).length
  if (dueToday) return { key: plural("tasksToday", dueToday), params: { n: dueToday } }
  if (pending.length) {
    return { key: plural("tasksPending", pending.length), params: { n: pending.length } }
  }
  return { key: P + "tasksNone", params: {} }
}

function summarizeBudgets(budgets) {
  const goals = budgets
    .map(b => Budget.fromJSON(b))
    .filter(b => b.type === "savings" && b.goalAmount > 0)
  if (!goals.length) return { key: P + "budgetNone", params: {} }
  const top = goals.reduce((a, b) => (b.getProgress() > a.getProgress() ? b : a))
  return {
    key: P + "budgetProgress",
    params: { name: top.name, percent: Math.round(top.getProgress()) }
  }
}

function summarizeHabits(habits) {
  if (!habits.length) return { key: P + "habitsNone", params: {} }
  const done = habits.map(h => Habit.fromJSON(h)).filter(h => h.isCompletedToday()).length
  return { key: plural("habitsToday", habits.length), params: { done, total: habits.length } }
}

export function buildSummary({ tasks, habits, budgets, usage, today }) {
  return [
    summarizeTasks(tasks, today),
    summarizeBudgets(budgets),
    summarizeHabits(habits),
    {
      key: P + "usage",
      params: { visits: usage?.visits || 0, interactions: usage?.interactions || 0 }
    }
  ]
}
