/**
 * Pruebas para modelos de presupuesto
 */
import { beforeEach, describe, expect, it } from "vitest"
import { Budget, Transaction } from "../assets/js/modules/budgets/models.js"

describe("Budget Models", () => {
  describe("Transaction", () => {
    it("debería crear una transacción con valores predeterminados", () => {
      const t = new Transaction({ description: "Test", amount: 50 })
      expect(t.description).toBe("Test")
      expect(t.amount).toBe(50)
      expect(t.id).toBeDefined()
      expect(t.date).toBeDefined()
    })

    it("debería identificar transacciones de gastos", () => {
      const expense = new Transaction({ description: "Test", amount: -50 })
      const income = new Transaction({ description: "Test", amount: 50 })
      expect(expense.isExpense()).toBe(true)
      expect(income.isExpense()).toBe(false)
    })

    it("debería devolver el monto absoluto", () => {
      const t = new Transaction({ description: "Test", amount: -75.5 })
      expect(t.getAbsoluteAmount()).toBe(75.5)
    })

    it("debería convertir a JSON y de vuelta", () => {
      const t = new Transaction({ description: "Test", amount: 50 })
      const json = t.toJSON()
      const restored = Transaction.fromJSON(json)
      expect(restored.description).toBe(t.description)
      expect(restored.amount).toBe(t.amount)
    })

    it("debería rechazar negativos en savings", () => {
      const errors = Transaction.validate(
        { description: "Test", amount: -50 },
        "savings"
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("positive")
    })

    it("debería rechazar positivos en spending", () => {
      const errors = Transaction.validate(
        { description: "Test", amount: 50 },
        "spending"
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("negative")
    })

    it("debería aceptar positivos en savings", () => {
      const errors = Transaction.validate(
        { description: "Test", amount: 50 },
        "savings"
      )
      expect(errors.length).toBe(0)
    })

    it("debería aceptar negativos en spending", () => {
      const errors = Transaction.validate(
        { description: "Test", amount: -50 },
        "spending"
      )
      expect(errors.length).toBe(0)
    })
  })

  describe("Budget - savings", () => {
    let budget

    beforeEach(() => {
      budget = new Budget({
        name: "Xbox",
        currency: "MXN",
        type: "savings",
        goalAmount: 11000
      })
    })

    it("debería crear un presupuesto de ahorro", () => {
      expect(budget.type).toBe("savings")
      expect(budget.goalAmount).toBe(11000)
      expect(budget.initialAmount).toBe(0)
    })

    it("debería acumular depósitos en getBalance()", () => {
      budget.addTransaction({ description: "Depósito", amount: 4500 })
      expect(budget.getBalance()).toBe(4500)
    })

    it("debería calcular progreso correcto", () => {
      expect(budget.getProgress()).toBe(0)
      budget.addTransaction({ description: "Depósito", amount: 5500 })
      expect(budget.getProgress()).toBe(50)
    })

    it("debería limitar progreso a 100%", () => {
      budget.addTransaction({ description: "Depósito", amount: 15000 })
      expect(budget.getProgress()).toBe(100)
    })

    it("debería detectar meta alcanzada", () => {
      expect(budget.isGoalReached()).toBe(false)
      budget.addTransaction({ description: "Depósito", amount: 11000 })
      expect(budget.isGoalReached()).toBe(true)
    })

    it("debería devolver estado correcto", () => {
      expect(budget.getStatus()).toBe("danger")
      budget.addTransaction({ description: "Depósito", amount: 5000 })
      expect(budget.getStatus()).toBe("warning")
      budget.addTransaction({ description: "Depósito", amount: 3500 })
      expect(budget.getStatus()).toBe("safe")
      budget.addTransaction({ description: "Depósito", amount: 2500 })
      expect(budget.getStatus()).toBe("reached")
    })
  })

  describe("Budget - spending", () => {
    let budget

    beforeEach(() => {
      budget = new Budget({
        name: "Efectivo",
        currency: "MXN",
        type: "spending",
        initialAmount: 5000
      })
    })

    it("debería crear un presupuesto de gasto", () => {
      expect(budget.type).toBe("spending")
      expect(budget.initialAmount).toBe(5000)
      expect(budget.goalAmount).toBe(0)
    })

    it("debería restar egresos del saldo", () => {
      budget.addTransaction({ description: "Comida", amount: -1200 })
      expect(budget.getBalance()).toBe(3800)
    })

    it("debería calcular porcentaje restante", () => {
      expect(budget.getProgress()).toBe(100)
      budget.addTransaction({ description: "Comida", amount: -1200 })
      expect(budget.getProgress()).toBe(76)
    })

    it("debería detectar cuando se agota", () => {
      expect(budget.isExhausted()).toBe(false)
      budget.addTransaction({ description: "Gasto", amount: -5000 })
      expect(budget.isExhausted()).toBe(true)
    })

    it("debería devolver estado correcto", () => {
      expect(budget.getStatus()).toBe("safe")
      budget.addTransaction({ description: "Gasto", amount: -3750 })
      expect(budget.getStatus()).toBe("warning")
      budget.addTransaction({ description: "Gasto", amount: -750 })
      expect(budget.getStatus()).toBe("danger")
    })
  })

  describe("Budget.validate()", () => {
    it("debería rechazar GBP", () => {
      const errors = Budget.validate({
        name: "Test",
        currency: "GBP",
        type: "spending",
        initialAmount: 100
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("MXN, USD or EUR")
    })

    it("debería aceptar MXN, USD y EUR", () => {
      for (const currency of ["MXN", "USD", "EUR"]) {
        const errors = Budget.validate({
          name: "Test",
          currency,
          type: "spending",
          initialAmount: 100
        })
        expect(errors.length).toBe(0)
      }
    })

    it("debería rechazar savings sin goalAmount", () => {
      const errors = Budget.validate({
        name: "Test",
        currency: "MXN",
        type: "savings",
        goalAmount: 0
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("goal amount")
    })

    it("debería rechazar spending sin initialAmount", () => {
      const errors = Budget.validate({
        name: "Test",
        currency: "MXN",
        type: "spending",
        initialAmount: 0
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("initial amount")
    })

    it("debería rechazar nombre vacío", () => {
      const errors = Budget.validate({
        name: "",
        currency: "MXN",
        type: "spending",
        initialAmount: 100
      })
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe("Budget - serialización", () => {
    it("debería convertir a JSON y de vuelta", () => {
      const budget = new Budget({
        name: "Test",
        currency: "MXN",
        type: "savings",
        goalAmount: 10000
      })
      budget.addTransaction({ description: "Depósito", amount: 5000 })
      const json = budget.toJSON()
      const restored = Budget.fromJSON(json)
      expect(restored.name).toBe("Test")
      expect(restored.type).toBe("savings")
      expect(restored.goalAmount).toBe(10000)
      expect(restored.transactions.length).toBe(1)
    })
  })
})
