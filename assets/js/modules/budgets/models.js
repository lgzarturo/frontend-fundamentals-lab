/**
 * Budget Models - Modelos de presupuesto con soporte para ahorro y gasto
 */

import { formatDate } from "../../utils/date.js"
import { generateId } from "../../utils/id.js"

export const INVESTMENT_DEFAULT_YEARS = 20
export const INVESTMENT_MILESTONES = [0, 5, 10, 15, 20]
export const INVESTMENT_MIN_RATE = 3
export const INVESTMENT_MAX_RATE = 10

/**
 * Simula interés compuesto con capitalización mensual y aportaciones a fin
 * de mes. Devuelve una fila anual { year, contributed, interest, balance }.
 * @param {Object} options
 * @param {number} [options.principal=0] - Monto inicial
 * @param {number} [options.monthly=0] - Aportación mensual fija
 * @param {number} [options.annualRate=0] - Tasa anual en porcentaje
 * @param {number} [options.years=20] - Horizonte en años
 * @returns {Array<{year:number,contributed:number,interest:number,balance:number}>}
 */
export function simulateInvestment({
  principal = 0,
  monthly = 0,
  annualRate = 0,
  years = INVESTMENT_DEFAULT_YEARS
} = {}) {
  const rows = []
  const monthlyRate = annualRate / 100 / 12
  let balance = principal
  const pushRow = year => {
    const contributed = principal + monthly * 12 * year
    rows.push({ year, contributed, interest: balance - contributed, balance })
  }
  pushRow(0)
  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthly
    }
    pushRow(year)
  }
  return rows
}

/**
 * Serializa filas de simulación a CSV con 2 decimales.
 * @param {Array} rows - Filas de `simulateInvestment`
 * @returns {string} Contenido CSV
 */
export function investmentToCsv(rows) {
  const lines = ["year,contributed,interest,balance"]
  for (const row of rows || []) {
    lines.push(
      [
        row.year,
        row.contributed.toFixed(2),
        row.interest.toFixed(2),
        row.balance.toFixed(2)
      ].join(",")
    )
  }
  return lines.join("\n")
}

/**
 * Transaction class - Representa una transacción financiera
 */
export class Transaction {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.amount = parseFloat(data.amount) || 0
    this.description = data.description || ""
    this.date = data.date || formatDate(new Date())
  }

  isExpense() {
    return this.amount < 0
  }

  isIncome() {
    return this.amount > 0
  }

  getAbsoluteAmount() {
    return Math.abs(this.amount)
  }

  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      description: this.description,
      date: this.date
    }
  }

  static fromJSON(data) {
    return new Transaction(data)
  }

  static validate(data, budgetType) {
    const errors = []
    const amount = parseFloat(data.amount)
    if (!data.description?.trim()) {
      errors.push("Description is required")
    }
    if (!Number.isFinite(amount) || amount === 0) {
      errors.push("Amount cannot be zero")
    }
    if (budgetType === "savings" && amount < 0) {
      errors.push("Savings transactions must be positive (deposits)")
    }
    if (budgetType === "spending" && amount > 0) {
      errors.push("Spending transactions must be negative (expenses)")
    }
    if (budgetType === "investing") {
      errors.push("Investing budgets do not support transactions")
    }
    return errors
  }
}

/**
 * Budget class - Representa un presupuesto completo
 */
export class Budget {
  constructor(data = {}) {
    const normalized = Budget.normalizeData(data)
    this.id = data.id || generateId()
    this.name = normalized.name
    this.currency = normalized.currency
    this.type = normalized.type
    this.goalAmount = normalized.goalAmount
    this.initialAmount = normalized.initialAmount
    this.initialPrincipal = normalized.initialPrincipal || 0
    this.monthlyContribution = normalized.monthlyContribution || 0
    this.annualRate = normalized.annualRate || 0
    this.transactions = normalized.transactions.map(t =>
      t instanceof Transaction ? t : Transaction.fromJSON(t)
    )
  }

  getSimulation() {
    if (this.type !== "investing") return []
    return simulateInvestment({
      principal: this.initialPrincipal,
      monthly: this.monthlyContribution,
      annualRate: this.annualRate
    })
  }

  getBalance() {
    if (this.type === "investing") return this.initialPrincipal
    const sum = this.transactions.reduce((acc, t) => acc + t.amount, 0)
    if (this.type === "spending") return this.initialAmount + sum
    return sum
  }

  getProgress() {
    if (this.type === "investing") return 0
    if (this.type === "savings") {
      if (this.goalAmount === 0) return 0
      return Math.min((this.getBalance() / this.goalAmount) * 100, 100)
    }
    if (this.initialAmount === 0) return 0
    return Math.max((this.getBalance() / this.initialAmount) * 100, 0)
  }

  isGoalReached() {
    return this.type === "savings" && this.getBalance() >= this.goalAmount
  }

  isExhausted() {
    return this.type === "spending" && this.getBalance() <= 0
  }

  getStatus() {
    if (this.type === "investing") return "safe"
    const pct = this.getProgress()
    if (this.type === "savings") {
      if (pct >= 100) return "reached"
      if (pct >= 75) return "safe"
      if (pct >= 40) return "warning"
      return "danger"
    }
    if (pct <= 10) return "danger"
    if (pct <= 30) return "warning"
    return "safe"
  }

  addTransaction(transactionData) {
    const transaction =
      transactionData instanceof Transaction
        ? transactionData
        : new Transaction(transactionData)
    this.transactions.push(transaction)
    return transaction
  }

  removeTransaction(transactionId) {
    const index = this.transactions.findIndex(t => t.id === transactionId)
    if (index !== -1) {
      const removed = this.transactions.splice(index, 1)[0]
      return { removed, index }
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      currency: this.currency,
      type: this.type,
      goalAmount: this.goalAmount,
      initialAmount: this.initialAmount,
      ...(this.type === "investing"
        ? {
            initialPrincipal: this.initialPrincipal,
            monthlyContribution: this.monthlyContribution,
            annualRate: this.annualRate
          }
        : {}),
      transactions: this.transactions.map(t => t.toJSON())
    }
  }

  static fromJSON(data) {
    return new Budget(data)
  }

  static normalizeData(data = {}) {
    const transactions = Array.isArray(data.transactions)
      ? data.transactions
      : []

    if (
      data.type === "savings" ||
      data.type === "spending" ||
      data.type === "investing"
    ) {
      return {
        ...data,
        name: data.name || "",
        currency: ["MXN", "USD", "EUR"].includes(data.currency)
          ? data.currency
          : "MXN",
        goalAmount: parseFloat(data.goalAmount) || 0,
        initialAmount: parseFloat(data.initialAmount) || 0,
        initialPrincipal: parseFloat(data.initialPrincipal) || 0,
        monthlyContribution: parseFloat(data.monthlyContribution) || 0,
        annualRate: parseFloat(data.annualRate) || 0,
        transactions
      }
    }

    const initialAmount = Array.isArray(data.items)
      ? data.items.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0
        )
      : 0

    return {
      id: data.id,
      name: data.name || "",
      currency: ["MXN", "USD", "EUR"].includes(data.currency)
        ? data.currency
        : "MXN",
      type: "spending",
      goalAmount: 0,
      initialAmount,
      transactions
    }
  }

  static validate(data) {
    const errors = []
    if (!data.name?.trim()) {
      errors.push("Budget name is required")
    }
    if (!["MXN", "USD", "EUR"].includes(data.currency)) {
      errors.push("Currency must be MXN, USD or EUR")
    }
    if (!["savings", "spending", "investing"].includes(data.type)) {
      errors.push("Type must be savings, spending or investing")
    }
    if (data.type === "savings" && !(parseFloat(data.goalAmount) > 0)) {
      errors.push("Savings budget requires a goal amount greater than 0")
    }
    if (data.type === "spending" && !(parseFloat(data.initialAmount) > 0)) {
      errors.push("Spending budget requires an initial amount greater than 0")
    }
    if (data.type === "investing") {
      const principal = parseFloat(data.initialPrincipal)
      const monthly = parseFloat(data.monthlyContribution)
      const rate = parseFloat(data.annualRate)
      if (!Number.isFinite(principal) || principal < 0) {
        errors.push("Investment requires an initial amount of 0 or more")
      }
      if (!Number.isFinite(monthly) || monthly < 0) {
        errors.push("Investment requires a monthly contribution of 0 or more")
      }
      if (
        !Number.isFinite(rate) ||
        rate < INVESTMENT_MIN_RATE ||
        rate > INVESTMENT_MAX_RATE
      ) {
        errors.push(
          `Investment rate must be between ${INVESTMENT_MIN_RATE} and ${INVESTMENT_MAX_RATE}`
        )
      }
    }
    return errors
  }
}
