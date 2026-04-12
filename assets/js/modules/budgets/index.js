import { Budget, BudgetItem, Transaction } from "./models.js"
import {
  addBudgetItemModalTemplate,
  addTransactionModalTemplate,
  budgetCardTemplate,
  budgetDetailsModalTemplate,
  budgetOverviewTemplate,
  createBudgetModalTemplate,
  emptyBudgetsTemplate
} from "./templates.js"

export class BudgetsModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.budgets = []
    this.container = null
    this.modalContainer = null
  }

  init() {
    this._loadBudgets()
    this.container = document.getElementById("budgets-list")
    this.modalContainer = document.getElementById("modal-content")
    this._bindEvents()
  }

  render() {
    if (!this.container) return

    if (this.budgets.length === 0) {
      this.container.innerHTML = emptyBudgetsTemplate()
      return
    }

    const totals = this.getTotals()
    const overviewHtml = budgetOverviewTemplate(totals)
    const cardsHtml = this.budgets
      .map(budget => budgetCardTemplate(budget))
      .join("")

    this.container.innerHTML = `
      ${overviewHtml}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        ${cardsHtml}
      </div>
    `
  }

  createBudget(data) {
    if (!data.name || !data.period || !data.startDate) {
      throw new Error(
        "Invalid budget data: name, period, and startDate are required"
      )
    }

    const budget = new Budget({
      name: data.name,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      currency: data.currency || "USD"
    })

    this.budgets.push(budget)
    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:created", budget)
    return budget
  }

  deleteBudget(budgetId) {
    const index = this.budgets.findIndex(b => b.id === budgetId)
    if (index === -1) {
      throw new Error(`Budget not found: ${budgetId}`)
    }

    const deleted = this.budgets.splice(index, 1)[0]
    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:deleted", deleted)
    return deleted
  }

  addItem(budgetId, itemData) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget) {
      throw new Error(`Budget not found: ${budgetId}`)
    }

    if (!itemData.name || itemData.planned === undefined) {
      throw new Error("Invalid item data: name and planned are required")
    }

    const item = new BudgetItem({
      name: itemData.name,
      planned: itemData.planned,
      category: itemData.category || "other"
    })

    budget.items.push(item)
    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:itemAdded", { budget, item })
    return item
  }

  removeItem(budgetId, itemId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget) {
      throw new Error(`Budget not found: ${budgetId}`)
    }

    const index = budget.items.findIndex(i => i.id === itemId)
    if (index === -1) {
      throw new Error(`Item not found: ${itemId}`)
    }

    const deleted = budget.items.splice(index, 1)[0]
    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:itemRemoved", { budget, item: deleted })
    return deleted
  }

  addTransaction(budgetId, transactionData) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget) {
      throw new Error(`Budget not found: ${budgetId}`)
    }

    if (!transactionData.amount || !transactionData.description) {
      throw new Error(
        "Invalid transaction data: amount and description are required"
      )
    }

    const transaction = new Transaction({
      amount: transactionData.amount,
      description: transactionData.description,
      date: transactionData.date || new Date().toISOString().split("T")[0],
      itemId: transactionData.itemId || null
    })

    budget.transactions.push(transaction)

    if (transaction.itemId) {
      const item = budget.items.find(i => i.id === transaction.itemId)
      if (item) {
        item.actual += transaction.amount
      }
    }

    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:transactionAdded", { budget, transaction })
    return transaction
  }

  getTotals() {
    return this.budgets.reduce(
      (totals, budget) => {
        const budgetPlanned = budget.items.reduce(
          (sum, item) => sum + item.planned,
          0
        )
        const budgetActual = budget.items.reduce(
          (sum, item) => sum + item.actual,
          0
        )

        totals.planned += budgetPlanned
        totals.actual += budgetActual
        totals.remaining += budgetPlanned - budgetActual

        return totals
      },
      { planned: 0, actual: 0, remaining: 0 }
    )
  }

  showCreateModal() {
    if (!this.modalContainer) return
    this.modalContainer.innerHTML = createBudgetModalTemplate()
    this._showModal()

    const form = document.getElementById("create-budget-form")
    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      this.createBudget({
        name: formData.get("name"),
        period: formData.get("period"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        currency: formData.get("currency")
      })
      this._closeModal()
    })
  }

  showDetailsModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || !this.modalContainer) return

    this.modalContainer.innerHTML = budgetDetailsModalTemplate(budget)
    this._showModal()
  }

  showAddTransactionModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || !this.modalContainer) return

    this.modalContainer.innerHTML = addTransactionModalTemplate(budget)
    this._showModal()

    const form = document.getElementById("add-transaction-form")
    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      this.addTransaction(budgetId, {
        amount: parseFloat(formData.get("amount")),
        description: formData.get("description"),
        date: formData.get("date"),
        itemId: formData.get("itemId") || null
      })
      this._closeModal()
    })
  }

  showAddItemModal(budgetId) {
    if (!this.modalContainer) return
    this.modalContainer.innerHTML = addBudgetItemModalTemplate(budgetId)
    this._showModal()

    const form = document.getElementById("add-item-form")
    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      this.addItem(budgetId, {
        name: formData.get("name"),
        planned: parseFloat(formData.get("planned")),
        category: formData.get("category")
      })
      this._closeModal()
    })
  }

  _loadBudgets() {
    const data = this.storage.get("budgets")
    if (data && Array.isArray(data)) {
      this.budgets = data.map(b => Budget.fromJSON(b))
    }
  }

  _saveBudgets() {
    this.storage.set(
      "budgets",
      this.budgets.map(b => b.toJSON())
    )
  }

  _bindEvents() {
    this.eventBus.on("budget:create", () => this.showCreateModal())
    this.eventBus.on("budget:showDetails", budgetId =>
      this.showDetailsModal(budgetId)
    )
    this.eventBus.on("budget:showAddTransaction", budgetId =>
      this.showAddTransactionModal(budgetId)
    )
    this.eventBus.on("budget:showAddItem", budgetId =>
      this.showAddItemModal(budgetId)
    )

    if (this.container) {
      this.container.addEventListener("click", e => {
        const target = e.target.closest("[data-action]")
        if (!target) return

        const action = target.dataset.action
        const budgetId = target.dataset.budgetId

        switch (action) {
          case "create-budget":
            this.showCreateModal()
            break
          case "view-budget":
            this.showDetailsModal(budgetId)
            break
          case "delete-budget":
            if (
              confirm(
                this.i18n.getMessage("budgets.confirmDelete") ||
                  "Delete this budget?"
              )
            ) {
              this.deleteBudget(budgetId)
            }
            break
          case "add-transaction":
            this.showAddTransactionModal(budgetId)
            break
          case "add-item":
            this.showAddItemModal(budgetId)
            break
        }
      })
    }
  }

  _showModal() {
    const modal = document.getElementById("modal")
    if (modal) {
      modal.classList.remove("hidden")
    }
  }

  _closeModal() {
    const modal = document.getElementById("modal")
    if (modal) {
      modal.classList.add("hidden")
    }
    if (this.modalContainer) {
      this.modalContainer.innerHTML = ""
    }
  }
}
