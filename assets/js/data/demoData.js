/**
 * Datos de demostración para pruebas y funcionalidad de reinicio
 */

import { generatePastRecords, getTodayString } from "../utils/date.js"
import { generateId } from "../utils/id.js"

const todayStr = getTodayString()

export const demoData = {
  budgets: [
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
  tasks: [
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
        { id: generateId(), text: "Review yesterday progress", done: false },
        { id: generateId(), text: "Work on main feature", done: false },
        { id: generateId(), text: "Commit and push changes", done: false }
      ],
      done: false,
      order: 2
    }
  ],
  habits: [
    {
      id: generateId(),
      title: "Wake without snooze",
      description: "Wake up at target time without hitting snooze",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.8),
      streak: 5,
      color: "#00ff88"
    },
    {
      id: generateId(),
      title: "Hydrate (500ml water)",
      description: "Drink 500ml water with lemon immediately after waking",
      schedule: "daily",
      dailyRecords: generatePastRecords(7, 0.9),
      streak: 7,
      color: "#0099ff"
    }
  ],
  notes: [
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
- Stay hydrated`,
      tags: ["programming", "tips"],
      updatedAt: Date.now()
    }
  ],
  settings: {
    theme: "dark",
    currency: "MXN",
    firstDayOfWeek: 1,
    notificationsEnabled: false
  },
  version: "2.0.0"
}
