/**
 * Budget Item class - Representa una categoría/item del presupuesto
 */

import { formatDate } from "../../utils/date.js"
import { generateId } from "../../utils/id.js"

export class BudgetItem {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ""
    this.amount = parseFloat(data.amount) || 0
    this.date = data.date || formatDate(new Date())
    this.notes = data.notes || ""
  }

  /**
   * Convierte a objeto plano para almacenamiento
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      amount: this.amount,
      date: this.date,
      notes: this.notes
    }
  }

  /**
   * Crea a partir de un objeto plano
   */
  static fromJSON(data) {
    return new BudgetItem(data)
  }

  /**
   * Valida los datos del item
   */
  static validate(data) {
    const errors = []
    if (!data.title?.trim()) {
      errors.push("Title is required")
    }
    if (isNaN(data.amount) || data.amount <= 0) {
      errors.push("Amount must be greater than 0")
    }
    return errors
  }
}

/**
 * Transaction class - Representa una transacción financiera
 */
export class Transaction {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.itemId = data.itemId || null
    this.amount = parseFloat(data.amount) || 0
    this.description = data.description || ""
    this.date = data.date || formatDate(new Date())
  }

  /**
   * Verifica si la transacción es un gasto
   */
  isExpense() {
    return this.amount < 0
  }

  /**
   * Verifica si la transacción es un ingreso
   */
  isIncome() {
    return this.amount > 0
  }

  /**
   * Obtiene el monto absoluto
   */
  getAbsoluteAmount() {
    return Math.abs(this.amount)
  }

  /**
   * Convierte a objeto plano para almacenamiento
   */
  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      amount: this.amount,
      description: this.description,
      date: this.date
    }
  }

  /**
   * Crea a partir de un objeto plano
   */
  static fromJSON(data) {
    return new Transaction(data)
  }

  /**
   * Valida los datos de la transacción
   */
  static validate(data) {
    const errors = []
    if (!data.description?.trim()) {
      errors.push("Description is required")
    }
    if (isNaN(data.amount) || data.amount === 0) {
      errors.push("Amount cannot be zero")
    }
    return errors
  }
}

/**
 * Budget class - Representa un presupuesto completo
 */
export class Budget {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.name = data.name || "New Budget"
    this.currency = data.currency || "USD"
    this.items = (data.items || []).map(i =>
      i instanceof BudgetItem ? i : BudgetItem.fromJSON(i)
    )
    this.transactions = (data.transactions || []).map(t =>
      t instanceof Transaction ? t : Transaction.fromJSON(t)
    )
  }

  /**
   * Obtiene el monto total asignado de los items
   */
  getTotalAllocated() {
    return this.items.reduce((sum, item) => sum + item.amount, 0)
  }

  /**
   * Obtiene el monto total gastado
   */
  getTotalSpent() {
    return this.transactions
      .filter(t => t.isExpense())
      .reduce((sum, t) => sum + t.getAbsoluteAmount(), 0)
  }

  /**
   * Obtiene el ingreso total
   */
  getTotalIncome() {
    return this.transactions
      .filter(t => t.isIncome())
      .reduce((sum, t) => sum + t.amount, 0)
  }

  /**
   * Obtiene el monto restante
   */
  getRemaining() {
    return this.getTotalAllocated() - this.getTotalSpent()
  }

  /**
   * Obtiene el porcentaje utilizado
   */
  getUsagePercentage() {
    const allocated = this.getTotalAllocated()
    if (allocated === 0) return 0
    return (this.getTotalSpent() / allocated) * 100
  }

  /**
   * Obtiene el estado basado en el uso
   * @returns {string} 'safe', 'warning', 'danger'
   */
  getStatus() {
    const percentage = this.getUsagePercentage()
    if (percentage > 90) return "danger"
    if (percentage > 70) return "warning"
    return "safe"
  }

  /**
   * Agrega un nuevo item
   */
  addItem(itemData) {
    const item =
      itemData instanceof BudgetItem ? itemData : new BudgetItem(itemData)
    this.items.push(item)
    return item
  }

  /**
   * Remueve un item
   */
  removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId)
    if (index !== -1) {
      const removed = this.items.splice(index, 1)[0]
      return { removed, index }
    }
    return null
  }

  /**
   * Agrega una transacción
   */
  addTransaction(transactionData) {
    const transaction =
      transactionData instanceof Transaction
        ? transactionData
        : new Transaction(transactionData)
    this.transactions.push(transaction)
    return transaction
  }

  /**
   * Remueve una transacción
   */
  removeTransaction(transactionId) {
    const index = this.transactions.findIndex(t => t.id === transactionId)
    if (index !== -1) {
      const removed = this.transactions.splice(index, 1)[0]
      return { removed, index }
    }
    return null
  }

  /**
   * Obtiene las transacciones de un item
   */
  getTransactionsForItem(itemId) {
    return this.transactions.filter(t => t.itemId === itemId)
  }

  /**
   * Convierte a objeto plano para almacenamiento
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      currency: this.currency,
      items: this.items.map(i => i.toJSON()),
      transactions: this.transactions.map(t => t.toJSON())
    }
  }

  /**
   * Crea a partir de un objeto plano
   */
  static fromJSON(data) {
    return new Budget(data)
  }

  /**
   * Valida los datos del presupuesto
   */
  static validate(data) {
    const errors = []
    if (!data.name?.trim()) {
      errors.push("Budget name is required")
    }
    if (!["USD", "EUR", "GBP", "MXN"].includes(data.currency)) {
      errors.push("Invalid currency")
    }
    return errors
  }
}
