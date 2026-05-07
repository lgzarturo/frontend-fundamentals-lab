import { Budget, Transaction } from "./models.js"
import {
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
      this.container.innerHTML = emptyBudgetsTemplate(this.i18n)
      return
    }

    const totals = this.getTotals()
    const overviewHtml = budgetOverviewTemplate(totals, this.i18n)
    const cardsHtml = this.budgets
      .map(budget => budgetCardTemplate(budget, this.i18n))
      .join("")

    this.container.innerHTML = `
      ${overviewHtml}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        ${cardsHtml}
      </div>
    `
  }

  createBudget(data) {
    const errors = Budget.validate(data)
    if (errors.length) throw new Error(errors.join(", "))

    const budget = new Budget({
      name: data.name,
      currency: data.currency,
      type: data.type,
      goalAmount: data.type === "savings" ? data.goalAmount : 0,
      initialAmount: data.type === "spending" ? data.initialAmount : 0
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

  addTransaction(budgetId, transactionData) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget) throw new Error(`Budget not found: ${budgetId}`)

    const errors = Transaction.validate(transactionData, budget.type)
    if (errors.length) throw new Error(errors.join(", "))

    const transaction = new Transaction(transactionData)
    budget.transactions.push(transaction)
    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:transactionAdded", { budget, transaction })
    return transaction
  }

  removeTransaction(budgetId, transactionId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget) throw new Error(`Budget not found: ${budgetId}`)

    const result = budget.removeTransaction(transactionId)
    if (!result) throw new Error(`Transaction not found: ${transactionId}`)

    this._saveBudgets()
    this.render()
    this.eventBus.emit("budget:transactionRemoved", {
      budget,
      transaction: result.removed
    })
    return result.removed
  }

  getTotals() {
    return this.budgets.reduce(
      (acc, budget) => {
        if (budget.type === "savings") {
          acc.saved += budget.getBalance()
          acc.savingsGoal += budget.goalAmount
        } else {
          acc.available += budget.getBalance()
          acc.initialTotal += budget.initialAmount
        }
        return acc
      },
      { saved: 0, savingsGoal: 0, available: 0, initialTotal: 0 }
    )
  }

  showCreateModal() {
    if (!this.modalContainer) return
    this.modalContainer.innerHTML = createBudgetModalTemplate(this.i18n)
    this._showModal()

    const form = document.getElementById("create-budget-form")
    const typeInputs = form.querySelectorAll('input[name="type"]')
    const syncTypeFields = type => {
      const isSavings = type === "savings"
      const goalGroup = document.getElementById("goal-amount-group")
      const initialGroup = document.getElementById("initial-amount-group")
      const goalInput = goalGroup?.querySelector("input")
      const initialInput = initialGroup?.querySelector("input")

      goalGroup?.classList.toggle("hidden", !isSavings)
      initialGroup?.classList.toggle("hidden", isSavings)
      if (goalInput) goalInput.required = isSavings
      if (initialInput) initialInput.required = !isSavings
    }

    typeInputs.forEach(input => {
      input.addEventListener("change", () => {
        syncTypeFields(input.value)
      })
    })
    syncTypeFields(form.querySelector('input[name="type"]:checked')?.value)

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      const type = formData.get("type")
      this.createBudget({
        name: formData.get("name"),
        currency: formData.get("currency"),
        type,
        goalAmount: type === "savings" ? formData.get("goalAmount") : 0,
        initialAmount: type === "spending" ? formData.get("initialAmount") : 0
      })
      this._closeModal()
    })
  }

  showDetailsModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || !this.modalContainer) return

    this.modalContainer.innerHTML = budgetDetailsModalTemplate(
      budget,
      this.i18n
    )
    this._showModal()
  }

  showAddTransactionModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || !this.modalContainer) return

    this.modalContainer.innerHTML = addTransactionModalTemplate(
      budget,
      this.i18n
    )
    this._showModal()

    const form = document.getElementById("add-transaction-form")
    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      const rawAmount = parseFloat(formData.get("amount"))
      if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
        throw new Error("Amount must be greater than 0")
      }
      const amount =
        budget.type === "spending" ? -Math.abs(rawAmount) : Math.abs(rawAmount)
      this.addTransaction(budgetId, {
        amount,
        description: formData.get("description")?.trim(),
        date: formData.get("date")
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
                this.i18n?.getMessage("budgets.confirmDelete") ||
                  "Delete this budget?"
              )
            ) {
              this.deleteBudget(budgetId)
            }
            break
          case "add-transaction":
            this.showAddTransactionModal(budgetId)
            break
        }
      })
    }
  }

  _showModal() {
    const modal = document.getElementById("modal")
    if (modal) {
      modal.classList.remove("hidden")
      modal.querySelectorAll('[data-action="close-modal"]').forEach(button => {
        button.addEventListener("click", () => this._closeModal(), {
          once: true
        })
      })
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
