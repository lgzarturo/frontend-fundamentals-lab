/**
 * Budget Templates - Plantillas de etiquetas para la generación de HTML
 */

import { escapeHtml } from "../../utils/html.js"

/**
 * Etiqueta de plantilla literal para cadenas HTML
 */
export function html(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i]
    if (value === undefined || value === null) {
      return result + string
    }
    if (typeof value === "string") {
      return result + string + escapeHtml(value)
    }
    return result + string + String(value)
  }, "")
}

/**
 * Plantilla de tarjeta de presupuesto
 */
export function budgetCardTemplate(budget, i18n) {
  const percentage = budget.getUsagePercentage()
  const status = budget.getStatus()
  const statusColors = {
    safe: "bg-xp-primary",
    warning: "bg-xp-warning",
    danger: "bg-xp-danger"
  }

  return html`
    <div
      class="bg-white dark:bg-xp-card rounded-xl p-6 border-2 border-gray-200 dark:border-xp-primary/20"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">${budget.name}</h3>
        <span class="text-sm text-gray-500">${budget.currency}</span>
      </div>

      <div class="space-y-3 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400"
            >${i18n?.getMessage("app.screens.budgets.overview.totalBudget") ||
            "Total Budget"}</span
          >
          <span class="font-semibold"
            >$${budget.getTotalAllocated().toFixed(2)}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400"
            >${i18n?.getMessage("app.screens.budgets.overview.totalSpent") ||
            "Total Spent"}</span
          >
          <span class="font-semibold text-xp-danger"
            >$${budget.getTotalSpent().toFixed(2)}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400"
            >${i18n?.getMessage("app.screens.budgets.overview.remaining") ||
            "Remaining"}</span
          >
          <span class="font-semibold text-xp-primary"
            >$${budget.getRemaining().toFixed(2)}</span
          >
        </div>
      </div>

      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span
            >${percentage.toFixed(1)}%
            ${i18n?.getMessage("app.screens.budgets.used") || "used"}</span
          >
        </div>
        <div
          class="w-full h-2 bg-gray-200 dark:bg-xp-darker rounded-full overflow-hidden"
        >
          <div
            class="h-full ${statusColors[status]} transition-all duration-300"
            style="width: ${Math.min(percentage, 100)}%"
          ></div>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          data-action="view-details"
          data-budget-id="${budget.id}"
          class="flex-1 px-4 py-2 bg-xp-primary/20 text-xp-primary rounded-lg hover:bg-xp-primary/30 transition-colors"
        >
          ${i18n?.getMessage("app.screens.budgets.overview.viewDetails") ||
          "View Details"}
        </button>
        <button
          data-action="add-transaction"
          data-budget-id="${budget.id}"
          class="flex-1 px-4 py-2 bg-xp-secondary/20 text-xp-secondary rounded-lg hover:bg-xp-secondary/30 transition-colors"
        >
          ${i18n?.getMessage("app.screens.budgets.overview.addTransaction") ||
          "Add Transaction"}
        </button>
      </div>
    </div>
  `
}

/**
 * Plantilla de estado vacío
 */
export function emptyBudgetsTemplate(i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">💰</div>
      <h3 class="text-xl font-bold mb-2">
        ${i18n?.getMessage("app.screens.budgets.empty.title") ||
        "No budgets yet"}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        ${i18n?.getMessage("app.screens.budgets.empty.description") ||
        "Create your first budget to start tracking your finances."}
      </p>
      <button
        data-action="create-budget"
        class="px-6 py-3 bg-xp-primary text-xp-darker font-bold rounded-lg hover:bg-xp-primary/80 transition-colors"
      >
        ${i18n?.getMessage("app.screens.budgets.empty.action") ||
        "Create Budget"}
      </button>
    </div>
  `
}

/**
 * Budget overview template
 */
export function budgetOverviewTemplate(budgets, i18n) {
  const totalAllocated = budgets.reduce(
    (sum, b) => sum + b.getTotalAllocated(),
    0
  )
  const totalSpent = budgets.reduce((sum, b) => sum + b.getTotalSpent(), 0)
  const totalRemaining = totalAllocated - totalSpent

  return html`
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div
        class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          ${i18n?.getMessage("app.screens.budgets.overview.totalBudget") ||
          "Total Budget"}
        </div>
        <div class="text-2xl font-bold text-xp-primary">
          $${totalAllocated.toFixed(2)}
        </div>
      </div>
      <div
        class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          ${i18n?.getMessage("app.screens.budgets.overview.totalSpent") ||
          "Total Spent"}
        </div>
        <div class="text-2xl font-bold text-xp-danger">
          $${totalSpent.toFixed(2)}
        </div>
      </div>
      <div
        class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          ${i18n?.getMessage("app.screens.budgets.overview.remaining") ||
          "Remaining"}
        </div>
        <div
          class="text-2xl font-bold ${totalRemaining >= 0
            ? "text-xp-primary"
            : "text-xp-danger"}"
        >
          $${totalRemaining.toFixed(2)}
        </div>
      </div>
    </div>
  `
}

/**
 * Create budget modal template
 */
export function createBudgetModalTemplate(i18n) {
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.budgets.modals.create.title") ||
        "Create New Budget"}
      </h3>
      <form id="create-budget-form">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.create.nameLabel"
              ) || "Budget Name"}</label
            >
            <input
              type="text"
              name="name"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage(
                "app.screens.budgets.modals.create.namePlaceholder"
              ) || "e.g., Monthly Personal Budget"}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.create.currencyLabel"
              ) || "Currency"}</label
            >
            <select
              name="currency"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MXN">MXN ($)</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("app.common.cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("app.common.create") || "Create"}
          </button>
        </div>
      </form>
    </div>
  `
}

/**
 * Budget details modal template
 */
export function budgetDetailsModalTemplate(budget, i18n) {
  return html`
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold">${budget.name}</h3>
        <button
          data-action="delete-budget"
          data-budget-id="${budget.id}"
          class="px-4 py-2 bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors"
        >
          ${i18n?.getMessage("app.common.delete") || "Delete"}
        </button>
      </div>

      <div class="mb-6">
        <h4 class="font-bold mb-3 flex items-center justify-between">
          <span
            >${i18n?.getMessage("app.screens.budgets.details.itemsTitle") ||
            "Budget Items"}</span
          >
          <button
            data-action="add-item"
            data-budget-id="${budget.id}"
            class="text-sm px-3 py-1 bg-xp-primary text-xp-darker rounded-lg"
          >
            +
            ${i18n?.getMessage("app.screens.budgets.details.addItem") ||
            "Add Item"}
          </button>
        </h4>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${budget.items.length === 0
            ? html`<div
                class="text-gray-500 dark:text-gray-400 text-center py-4"
              >
                ${i18n?.getMessage("app.screens.budgets.details.noItems") ||
                "No items yet"}
              </div>`
            : budget.items
                .map(
                  item => html`
                    <div
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg"
                    >
                      <div>
                        <div class="font-semibold">${item.title}</div>
                        ${item.notes
                          ? html`<div
                              class="text-sm text-gray-600 dark:text-gray-400"
                            >
                              ${item.notes}
                            </div>`
                          : ""}
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-xp-primary">
                          $${item.amount.toFixed(2)}
                        </div>
                        <button
                          data-action="delete-item"
                          data-budget-id="${budget.id}"
                          data-item-id="${item.id}"
                          class="text-xs text-xp-danger hover:underline"
                        >
                          ${i18n?.getMessage("app.common.delete") || "Delete"}
                        </button>
                      </div>
                    </div>
                  `
                )
                .join("")}
        </div>
      </div>

      <div>
        <h4 class="font-bold mb-3">
          ${i18n?.getMessage("app.screens.budgets.details.transactionsTitle") ||
          "Transactions"}
        </h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          ${budget.transactions.length === 0
            ? html`<div
                class="text-gray-500 dark:text-gray-400 text-center py-4"
              >
                ${i18n?.getMessage(
                  "app.screens.budgets.details.noTransactions"
                ) || "No transactions yet"}
              </div>`
            : budget.transactions
                .map(
                  t => html`
                    <div
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-xp-darker rounded-lg"
                    >
                      <div>
                        <div class="font-semibold">${t.description}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">
                          ${t.date}
                        </div>
                      </div>
                      <div
                        class="font-bold ${t.isExpense()
                          ? "text-xp-danger"
                          : "text-xp-primary"}"
                      >
                        ${t.isExpense() ? "-" : "+"}$${t
                          .getAbsoluteAmount()
                          .toFixed(2)}
                      </div>
                    </div>
                  `
                )
                .join("")}
        </div>
      </div>
    </div>
  `
}

/**
 * Add transaction modal template
 */
export function addTransactionModalTemplate(budgetId, i18n) {
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.budgets.modals.transaction.title") ||
        "Add Transaction"}
      </h3>
      <form id="add-transaction-form" data-budget-id="${budgetId}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.transaction.descriptionLabel"
              ) || "Description"}</label
            >
            <input
              type="text"
              name="description"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage(
                "app.screens.budgets.modals.transaction.descriptionPlaceholder"
              ) || "e.g., Weekly groceries"}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.transaction.amountLabel"
              ) || "Amount (negative for expenses)"}</label
            >
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="-50.00"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("app.common.cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("app.common.add") || "Add"}
          </button>
        </div>
      </form>
    </div>
  `
}

/**
 * Add budget item modal template
 */
export function addBudgetItemModalTemplate(budgetId, i18n) {
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.budgets.modals.item.title") ||
        "Add Budget Item"}
      </h3>
      <form id="add-budget-item-form" data-budget-id="${budgetId}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.item.categoryLabel"
              ) || "Category/Title"}</label
            >
            <input
              type="text"
              name="title"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage(
                "app.screens.budgets.modals.item.categoryPlaceholder"
              ) || "e.g., Groceries"}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.item.amountLabel"
              ) || "Amount"}</label
            >
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="0.00"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${i18n?.getMessage(
                "app.screens.budgets.modals.item.notesLabel"
              ) || "Notes (optional)"}</label
            >
            <textarea
              name="notes"
              rows="2"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage(
                "app.screens.budgets.modals.item.notesPlaceholder"
              ) || "Additional notes..."}"
            ></textarea>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("app.common.cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("app.common.add") || "Add"}
          </button>
        </div>
      </form>
    </div>
  `
}
