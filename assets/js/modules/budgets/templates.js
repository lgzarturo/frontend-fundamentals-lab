/**
 * Budget Templates - Plantillas para la generación de HTML de presupuestos
 */

import { escapeHtml } from "../../utils/html.js"

export function html(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i]
    if (value === undefined || value === null) {
      return result + string
    }
    if (value && typeof value === "object" && value.__html !== undefined) {
      return result + string + value.__html
    }
    if (typeof value === "string") {
      return result + string + escapeHtml(value)
    }
    return result + string + String(value)
  }, "")
}

function raw(value) {
  return { __html: value }
}

const STATUS_COLORS = {
  safe: "bg-xp-primary",
  warning: "bg-xp-warning",
  danger: "bg-xp-danger",
  reached: "bg-green-500"
}

function money(amount, currency = "MXN") {
  return `$${(parseFloat(amount) || 0).toFixed(2)} ${currency}`
}

function getMessage(i18n, key, fallback) {
  return i18n?.getMessage(key) || fallback
}

export function budgetCardTemplate(budget, i18n) {
  const pct = budget.getProgress()
  const status = budget.getStatus()
  const isSavings = budget.type === "savings"

  const primaryLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.goal"
      : "app.screens.budgets.card.initial",
    isSavings ? "Meta" : "Inicial"
  )
  const primaryValue = isSavings ? budget.goalAmount : budget.initialAmount
  const secondaryLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.saved"
      : "app.screens.budgets.card.available",
    isSavings ? "Ahorrado" : "Disponible"
  )
  const secondaryValue = budget.getBalance()
  const tertiaryLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.remaining"
      : "app.screens.budgets.card.spent",
    isSavings ? "Faltan" : "Gastado"
  )
  const tertiaryValue = isSavings
    ? Math.max(budget.goalAmount - budget.getBalance(), 0)
    : budget.transactions.reduce((sum, transaction) => {
        return transaction.amount < 0
          ? sum + transaction.getAbsoluteAmount()
          : sum
      }, 0)

  const actionLabel = isSavings
    ? getMessage(
        i18n,
        "app.screens.budgets.overview.addDeposit",
        "+ Dep\u00F3sito"
      )
    : getMessage(i18n, "app.screens.budgets.overview.addExpense", "+ Egreso")
  const progressLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.completed"
      : "app.screens.budgets.card.remainingPct",
    isSavings ? "completado" : "restante"
  )

  return html`
    <div
      class="bg-white dark:bg-xp-card rounded-xl p-6 border-2 border-gray-200 dark:border-xp-primary/20"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">
          ${isSavings ? "\uD83C\uDFAF" : "\uD83D\uDCB8"} ${budget.name}
        </h3>
        <button
          data-action="delete-budget"
          data-budget-id="${budget.id}"
          class="px-3 py-2 bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors"
        >
          ${getMessage(i18n, "ui.common.delete", "Eliminar")}
        </button>
      </div>

      <div class="space-y-3 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">${primaryLabel}</span>
          <span class="font-semibold"
            >${money(primaryValue, budget.currency)}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400"
            >${secondaryLabel}</span
          >
          <span class="font-semibold text-xp-primary"
            >${money(secondaryValue, budget.currency)}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">${tertiaryLabel}</span>
          <span
            class="font-semibold ${
              isSavings ? "text-xp-warning" : "text-xp-danger"
            }"
            >${money(tertiaryValue, budget.currency)}</span
          >
        </div>
      </div>

      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span>${pct.toFixed(1)}% ${progressLabel}</span>
        </div>
        <div
          class="w-full h-2 bg-gray-200 dark:bg-xp-darker rounded-full overflow-hidden"
        >
          <div
            class="h-full ${STATUS_COLORS[status]} transition-all duration-300"
            style="width: ${Math.min(pct, 100)}%"
          ></div>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          data-action="view-details"
          data-budget-id="${budget.id}"
          class="flex-1 px-4 py-2 bg-xp-primary/20 text-xp-primary rounded-lg hover:bg-xp-primary/30 transition-colors"
        >
          ${getMessage(
            i18n,
            "app.screens.budgets.overview.viewDetails",
            "Ver Detalles"
          )}
        </button>
        <button
          data-action="add-transaction"
          data-budget-id="${budget.id}"
          class="flex-1 px-4 py-2 bg-xp-secondary/20 text-xp-secondary rounded-lg hover:bg-xp-secondary/30 transition-colors"
        >
          ${actionLabel}
        </button>
      </div>
    </div>
  `
}

export function emptyBudgetsTemplate(i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">💰</div>
      <h3 class="text-xl font-bold mb-2">
        ${getMessage(
          i18n,
          "app.screens.budgets.empty.title",
          "\u00A1No hay presupuestos a\u00FAn!"
        )}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        ${getMessage(
          i18n,
          "app.screens.budgets.empty.description",
          "Crea tu primer presupuesto para empezar a controlar tus finanzas."
        )}
      </p>
      <button
        data-action="create-budget"
        class="px-6 py-3 bg-xp-primary text-xp-darker font-bold rounded-lg hover:bg-xp-primary/80 transition-colors"
      >
        ${getMessage(
          i18n,
          "app.screens.budgets.empty.action",
          "Crear Presupuesto"
        )}
      </button>
    </div>
  `
}

export function budgetOverviewTemplate(totals, i18n) {
  return html`
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div
        class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          ${getMessage(
            i18n,
            "app.screens.budgets.overview.totalSaved",
            "Total Ahorrado"
          )}
        </div>
        <div class="text-2xl font-bold text-xp-primary">
          $${totals.saved.toFixed(2)}
        </div>
      </div>
      <div
        class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          ${getMessage(
            i18n,
            "app.screens.budgets.overview.totalAvailable",
            "Total Disponible"
          )}
        </div>
        <div class="text-2xl font-bold text-xp-secondary">
          $${totals.available.toFixed(2)}
        </div>
      </div>
      <div
        class="bg-white dark:bg-xp-card rounded-xl p-4 border-2 border-gray-200 dark:border-xp-primary/20"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          ${getMessage(
            i18n,
            "app.screens.budgets.overview.savingsGoals",
            "Metas de Ahorro"
          )}
        </div>
        <div class="text-2xl font-bold text-xp-primary">
          $${totals.savingsGoal.toFixed(2)}
        </div>
      </div>
    </div>
  `
}

export function createBudgetModalTemplate(i18n) {
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${getMessage(
          i18n,
          "app.screens.budgets.modals.create.title",
          "Crear Nuevo Presupuesto"
        )}
      </h3>
      <form id="create-budget-form">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${getMessage(
                i18n,
                "app.screens.budgets.modals.create.typeLabel",
                "Tipo de Presupuesto"
              )}
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="flex flex-col items-center p-4 border-2 border-gray-200 dark:border-xp-primary/20 rounded-xl cursor-pointer hover:border-xp-primary transition-colors has-[:checked]:border-xp-primary has-[:checked]:bg-xp-primary/10"
              >
                <input
                  type="radio"
                  name="type"
                  value="savings"
                  class="sr-only"
                />
                <span class="text-2xl mb-1">🎯</span>
                <span class="font-semibold text-sm"
                  >${getMessage(
                    i18n,
                    "app.screens.budgets.types.savings",
                    "Ahorro"
                  )}</span
                >
                <span class="text-xs text-gray-500 text-center"
                  >${getMessage(
                    i18n,
                    "app.screens.budgets.types.savingsHint",
                    "Quiero llegar a una meta"
                  )}</span
                >
              </label>
              <label
                class="flex flex-col items-center p-4 border-2 border-gray-200 dark:border-xp-primary/20 rounded-xl cursor-pointer hover:border-xp-primary transition-colors has-[:checked]:border-xp-primary has-[:checked]:bg-xp-primary/10"
              >
                <input
                  type="radio"
                  name="type"
                  value="spending"
                  class="sr-only"
                  checked
                />
                <span class="text-2xl mb-1">💸</span>
                <span class="font-semibold text-sm"
                  >${getMessage(
                    i18n,
                    "app.screens.budgets.types.spending",
                    "Gasto"
                  )}</span
                >
                <span class="text-xs text-gray-500 text-center"
                  >${getMessage(
                    i18n,
                    "app.screens.budgets.types.spendingHint",
                    "Tengo dinero disponible"
                  )}</span
                >
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${getMessage(
                i18n,
                "app.screens.budgets.modals.create.name",
                "Nombre"
              )}
            </label>
            <input
              type="text"
              name="name"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${getMessage(
                i18n,
                "app.screens.budgets.modals.create.namePlaceholder",
                "ej., Xbox Series X"
              )}"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              ${getMessage(
                i18n,
                "app.screens.budgets.modals.create.currency",
                "Moneda"
              )}
            </label>
            <select
              name="currency"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
            >
              <option value="MXN">MXN ($)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div id="goal-amount-group" class="hidden">
            <label class="block text-sm font-semibold mb-2">
              ${getMessage(
                i18n,
                "app.screens.budgets.modals.create.goalAmountLabel",
                "Monto Objetivo (meta)"
              )}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="goalAmount"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="11000"
            />
          </div>

          <div id="initial-amount-group">
            <label class="block text-sm font-semibold mb-2">
              ${getMessage(
                i18n,
                "app.screens.budgets.modals.create.initialAmountLabel",
                "Monto Inicial Disponible"
              )}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="initialAmount"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="5000"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${getMessage(
              i18n,
              "app.screens.budgets.modals.create.cancel",
              "Cancelar"
            )}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${getMessage(
              i18n,
              "app.screens.budgets.modals.create.create",
              "Crear"
            )}
          </button>
        </div>
      </form>
    </div>
  `
}

export function budgetDetailsModalTemplate(budget, i18n) {
  const isSavings = budget.type === "savings"
  const balance = budget.getBalance()
  const pct = budget.getProgress()
  const spent = budget.transactions.reduce((sum, transaction) => {
    return transaction.amount < 0 ? sum + transaction.getAbsoluteAmount() : sum
  }, 0)
  const remaining = Math.max(budget.goalAmount - balance, 0)

  const headerLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.goal"
      : "app.screens.budgets.card.initial",
    isSavings ? "Meta" : "Inicial"
  )
  const headerValue = isSavings ? budget.goalAmount : budget.initialAmount
  const balanceLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.saved"
      : "app.screens.budgets.card.available",
    isSavings ? "Ahorrado" : "Disponible"
  )
  const tertiaryLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.remaining"
      : "app.screens.budgets.card.spent",
    isSavings ? "Faltan" : "Gastado"
  )
  const progressLabel = getMessage(
    i18n,
    isSavings
      ? "app.screens.budgets.card.completed"
      : "app.screens.budgets.card.remainingPct",
    isSavings ? "completado" : "restante"
  )
  const transactionsHtml =
    budget.transactions.length === 0
      ? html`<div class="text-gray-500 dark:text-gray-400 text-center py-4">
          ${getMessage(
            i18n,
            "app.screens.budgets.details.noTransactions",
            "No hay transacciones a\u00FAn"
          )}
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
                  class="font-bold ${
                    t.isExpense() ? "text-xp-danger" : "text-xp-primary"
                  }"
                >
                  ${t.isExpense() ? "-" : "+"}${money(
                    t.getAbsoluteAmount(),
                    budget.currency
                  )}
                </div>
              </div>
            `
          )
          .join("")

  return html`
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold">
          ${isSavings ? "\uD83C\uDFAF" : "\uD83D\uDCB8"} ${budget.name}
        </h3>
        <button
          data-action="delete-budget"
          data-budget-id="${budget.id}"
          class="px-4 py-2 bg-xp-danger/20 hover:bg-xp-danger/30 text-xp-danger rounded-lg transition-colors"
        >
          ${getMessage(i18n, "ui.common.delete", "Eliminar")}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
          <div class="text-xs text-gray-500">${headerLabel}</div>
          <div class="font-bold">${money(headerValue, budget.currency)}</div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
          <div class="text-xs text-gray-500">${balanceLabel}</div>
          <div class="font-bold text-xp-primary">
            ${money(balance, budget.currency)}
          </div>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-xp-darker rounded-lg">
          <div class="text-xs text-gray-500">${tertiaryLabel}</div>
          <div
            class="font-bold ${
              isSavings ? "text-xp-warning" : "text-xp-danger"
            }"
          >
            ${money(isSavings ? remaining : spent, budget.currency)}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex justify-between text-sm mb-1">
          <span>${pct.toFixed(1)}% ${progressLabel}</span>
        </div>
        <div
          class="w-full h-3 bg-gray-200 dark:bg-xp-darker rounded-full overflow-hidden"
        >
          <div
            class="h-full ${
              STATUS_COLORS[budget.getStatus()]
            } transition-all duration-300"
            style="width: ${Math.min(pct, 100)}%"
          ></div>
        </div>
      </div>

      <div>
        <h4 class="font-bold mb-3">
          ${
            i18n?.getMessage("app.screens.budgets.details.transactionsTitle") ||
            "Transacciones"
          }
        </h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          ${raw(transactionsHtml)}
        </div>
      </div>
    </div>
  `
}

export function addTransactionModalTemplate(budget, i18n) {
  const isSavings = budget.type === "savings"
  const today = new Date().toISOString().slice(0, 10)
  const title = isSavings
    ? i18n?.getMessage("app.screens.budgets.modals.deposit.title") ||
      "Agregar Dep\u00F3sito"
    : i18n?.getMessage("app.screens.budgets.modals.expense.title") ||
      "Registrar Egreso"
  const amountLabel = isSavings
    ? i18n?.getMessage("app.screens.budgets.modals.deposit.amountLabel") ||
      "Monto del dep\u00F3sito"
    : i18n?.getMessage("app.screens.budgets.modals.expense.amountLabel") ||
      "Monto del egreso"
  const submitLabel = isSavings
    ? i18n?.getMessage("app.screens.budgets.modals.deposit.submit") ||
      "Agregar Dep\u00F3sito"
    : i18n?.getMessage("app.screens.budgets.modals.expense.submit") ||
      "Registrar Egreso"

  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">${title}</h3>
      <form id="add-transaction-form" data-budget-id="${budget.id}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${
                i18n?.getMessage(
                  "app.screens.budgets.modals.transaction.descriptionLabel"
                ) || "Descripci\u00F3n"
              }
            </label>
            <input
              type="text"
              name="description"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${
                i18n?.getMessage(
                  "app.screens.budgets.modals.transaction.descriptionPlaceholder"
                ) || "ej., Compras semanales"
              }"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2"
              >${amountLabel}</label
            >
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="0.00"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${
                i18n?.getMessage(
                  "app.screens.budgets.modals.transaction.dateLabel"
                ) || "Fecha"
              }
            </label>
            <input
              type="date"
              name="date"
              required
              value="${today}"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${getMessage(
              i18n,
              "app.screens.budgets.modals.create.cancel",
              "Cancelar"
            )}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${submitLabel}
          </button>
        </div>
      </form>
    </div>
  `
}
