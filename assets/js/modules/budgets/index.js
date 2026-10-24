import { Budget, Transaction, investmentToCsv } from "./models.js"
import {
  addTransactionModalTemplate,
  budgetCardTemplate,
  budgetDetailsModalTemplate,
  budgetOverviewTemplate,
  createBudgetModalTemplate,
  emptyBudgetsTemplate,
  investmentDetailsModalTemplate,
  investmentPrintTemplate
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
      initialAmount: data.type === "spending" ? data.initialAmount : 0,
      initialPrincipal: data.type === "investing" ? data.initialPrincipal : 0,
      monthlyContribution:
        data.type === "investing" ? data.monthlyContribution : 0,
      annualRate: data.type === "investing" ? data.annualRate : 0
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
        } else if (budget.type === "spending") {
          acc.available += budget.getBalance()
          acc.initialTotal += budget.initialAmount
        }
        return acc
      },
      { saved: 0, savingsGoal: 0, available: 0, initialTotal: 0 }
    )
  }

  downloadCsv(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || budget.type !== "investing") {
      throw new Error(`Investment budget not found: ${budgetId}`)
    }
    const csv = investmentToCsv(budget.getSimulation())
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `inversion-${budget.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  downloadPdf(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || budget.type !== "investing") {
      throw new Error(`Investment budget not found: ${budgetId}`)
    }
    const doc = investmentPrintTemplate(
      budget,
      budget.getSimulation(),
      this.i18n
    )
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.setAttribute("title", "investment-print")
    document.body.appendChild(iframe)
    iframe.contentDocument.open()
    iframe.contentDocument.write(doc)
    iframe.contentDocument.close()
    iframe.contentWindow.focus()
    iframe.contentWindow.print?.()
    iframe.contentWindow.onafterprint = () => iframe.remove()
    setTimeout(() => iframe.remove(), 60000)
  }

  showCreateModal() {
    if (!this.modalContainer) return
    this.eventBus.emit("modal:open", {
      contentHtml: createBudgetModalTemplate(this.i18n)
    })

    const form = document.getElementById("create-budget-form")
    const typeInputs = form.querySelectorAll('input[name="type"]')
    const syncTypeFields = type => {
      const isSavings = type === "savings"
      const isInvesting = type === "investing"
      const goalGroup = document.getElementById("goal-amount-group")
      const initialGroup = document.getElementById("initial-amount-group")
      const investingGroup = document.getElementById("investing-fields-group")
      const goalInput = goalGroup?.querySelector("input")
      const initialInput = initialGroup?.querySelector("input")

      goalGroup?.classList.toggle("hidden", !isSavings)
      initialGroup?.classList.toggle("hidden", isSavings || isInvesting)
      investingGroup?.classList.toggle("hidden", !isInvesting)
      if (goalInput) goalInput.required = isSavings
      if (initialInput) initialInput.required = !isSavings && !isInvesting
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
        initialAmount: type === "spending" ? formData.get("initialAmount") : 0,
        initialPrincipal:
          type === "investing" ? formData.get("initialPrincipal") : 0,
        monthlyContribution:
          type === "investing" ? formData.get("monthlyContribution") : 0,
        annualRate: type === "investing" ? formData.get("annualRate") : 0
      })
      this.eventBus.emit("modal:close")
    })
  }

  showDetailsModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || !this.modalContainer) return

    this.eventBus.emit("modal:open", {
      contentHtml:
        budget.type === "investing"
          ? investmentDetailsModalTemplate(budget, this.i18n)
          : budgetDetailsModalTemplate(budget, this.i18n)
    })
  }

  showAddTransactionModal(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId)
    if (!budget || !this.modalContainer) return
    if (budget.type === "investing") return

    this.eventBus.emit("modal:open", {
      contentHtml: addTransactionModalTemplate(budget, this.i18n)
    })

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
      this.eventBus.emit("modal:close")
    })
  }

  /**
   * Recarga los datos desde el almacenamiento y re-renderiza
   * Útil tras importar/limpiar datos sin duplicar listeners
   */
  reload() {
    this._loadBudgets()
    this.render()
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
          case "view-details":
            this.showDetailsModal(budgetId)
            break
          case "delete-budget":
            if (
              confirm(
                this.i18n?.getMessage("ui.common.confirmDelete") ||
                  "Delete this budget?"
              )
            ) {
              this.deleteBudget(budgetId)
            }
            break
          case "add-transaction":
            this.showAddTransactionModal(budgetId)
            break
          case "download-csv":
            this.downloadCsv(budgetId)
            break
        }
      })
    }

    if (this.modalContainer) {
      this.modalContainer.addEventListener("click", e => {
        const downloadTarget =
          e.target.closest('[data-action="download-csv"]') ||
          e.target.closest('[data-action="download-pdf"]')
        if (downloadTarget) {
          const budgetId = downloadTarget.dataset.budgetId
          if (downloadTarget.dataset.action === "download-csv") {
            this.downloadCsv(budgetId)
          } else {
            this.downloadPdf(budgetId)
          }
          return
        }

        const target = e.target.closest('[data-action="delete-budget"]')
        if (!target) return

        const budgetId = target.dataset.budgetId
        if (
          confirm(
            this.i18n?.getMessage("ui.common.confirmDelete") ||
              "Delete this budget?"
          )
        ) {
          this.deleteBudget(budgetId)
          this.eventBus.emit("modal:close")
        }
      })
    }
  }
}
