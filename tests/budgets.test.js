/**
 * Pruebas para modelos de presupuesto
 */
import { beforeEach, describe, expect, it } from "vitest"
import {
  Budget,
  BudgetItem,
  Transaction
} from "../assets/js/modules/budgets/models.js"

describe("Budget Models", () => {
  describe("BudgetItem", () => {
    it("debería crear un item de presupuesto con valores predeterminados", () => {
      const item = new BudgetItem({ title: "Test Item", amount: 100 })
      expect(item.title).toBe("Test Item")
      expect(item.amount).toBe(100)
      expect(item.id).toBeDefined()
      expect(item.date).toBeDefined()
    })

    it("debería validar los datos del item", () => {
      const errors = BudgetItem.validate({ title: "", amount: 0 })
      expect(errors.length).toBeGreaterThan(0)
    })

    it("debería convertir a JSON y de vuelta", () => {
      const item = new BudgetItem({ title: "Test", amount: 50 })
      const json = item.toJSON()
      const restored = BudgetItem.fromJSON(json)
      expect(restored.title).toBe(item.title)
      expect(restored.amount).toBe(item.amount)
    })
  })

  describe("Transaction", () => {
    it("debería identificar transacciones de gastos", () => {
      const expense = new Transaction({ description: "Test", amount: -50 })
      const income = new Transaction({ description: "Test", amount: 50 })
      expect(expense.isExpense()).toBe(true)
      expect(income.isExpense()).toBe(false)
    })

    it("debería devolver el monto absoluto", () => {
      const transaction = new Transaction({
        description: "Test",
        amount: -75.5
      })
      expect(transaction.getAbsoluteAmount()).toBe(75.5)
    })
  })

  describe("Budget", () => {
    let budget

    beforeEach(() => {
      budget = new Budget({ name: "Test Budget", currency: "USD" })
    })

    it("debería calcular el total asignado", () => {
      budget.addItem({ title: "Item 1", amount: 100 })
      budget.addItem({ title: "Item 2", amount: 200 })
      expect(budget.getTotalAllocated()).toBe(300)
    })

    it("debería calcular el total gastado", () => {
      budget.addTransaction({ description: "Expense", amount: -50 })
      budget.addTransaction({ description: "Expense 2", amount: -25 })
      expect(budget.getTotalSpent()).toBe(75)
    })

    it("debería calcular el restante correctamente", () => {
      budget.addItem({ title: "Item", amount: 500 })
      budget.addTransaction({ description: "Expense", amount: -100 })
      expect(budget.getRemaining()).toBe(400)
    })

    it("debería devolver el estado correcto según el uso", () => {
      budget.addItem({ title: "Item", amount: 100 })
      budget.addTransaction({ description: "Expense", amount: -50 })
      expect(budget.getStatus()).toBe("safe")

      budget.addTransaction({ description: "Expense", amount: -30 })
      expect(budget.getStatus()).toBe("warning")
    })

    it("debería eliminar items correctamente", () => {
      const item = budget.addItem({ title: "Item", amount: 100 })
      const result = budget.removeItem(item.id)
      expect(result).not.toBeNull()
      expect(budget.items.length).toBe(0)
    })

    it("debería validar los datos del presupuesto", () => {
      const errors = Budget.validate({ name: "", currency: "INVALID" })
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
