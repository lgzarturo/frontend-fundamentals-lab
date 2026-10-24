/**
 * Pruebas para modelos de presupuesto
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  Budget,
  Transaction,
  investmentToCsv,
  simulateInvestment
} from "../assets/js/modules/budgets/models.js"
import { BudgetsModule } from "../assets/js/modules/budgets/index.js"
import {
  budgetCardTemplate,
  createBudgetModalTemplate,
  investmentChartTemplate,
  investmentDetailsModalTemplate
} from "../assets/js/modules/budgets/templates.js"

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

    it("debería migrar presupuestos legacy con items a spending", () => {
      const restored = Budget.fromJSON({
        name: "Legacy",
        currency: "GBP",
        items: [{ amount: 500 }, { amount: 250 }],
        transactions: [{ description: "Gasto", amount: -100 }]
      })

      expect(restored.type).toBe("spending")
      expect(restored.currency).toBe("MXN")
      expect(restored.initialAmount).toBe(750)
      expect(restored.getBalance()).toBe(650)
      expect(restored.toJSON()).not.toHaveProperty("items")
    })
  })
})

describe("Investing (BC-009)", () => {
  const closeTo = (actual, expected) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.01)
  }

  const mockStorage = () => {
    const store = {}
    return {
      get: vi.fn(key => store[key] ?? null),
      set: vi.fn((key, val) => {
        store[key] = val
      })
    }
  }

  const mockEventBus = () => {
    const listeners = {}
    return {
      emit: vi.fn((event, payload) => {
        ;(listeners[event] || []).forEach(fn => fn(payload))
      }),
      on(event, fn) {
        listeners[event] = listeners[event] || []
        listeners[event].push(fn)
      }
    }
  }

  afterEach(() => {
    document.body.innerHTML = ""
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe("FR-001 validación", () => {
    it("debería aceptar inversiones válidas incluyendo ceros", () => {
      expect(
        Budget.validate({
          name: "Retiro",
          currency: "MXN",
          type: "investing",
          initialPrincipal: 10000,
          monthlyContribution: 1000,
          annualRate: 8
        })
      ).toEqual([])
      expect(
        Budget.validate({
          name: "Desde cero",
          currency: "MXN",
          type: "investing",
          initialPrincipal: 0,
          monthlyContribution: 500,
          annualRate: 3
        })
      ).toEqual([])
    })

    it("debería rechazar tasa fuera de 3-10 con mensaje", () => {
      for (const rate of [2.9, 10.1, "x", undefined]) {
        const errors = Budget.validate({
          name: "T",
          currency: "MXN",
          type: "investing",
          initialPrincipal: 100,
          monthlyContribution: 100,
          annualRate: rate
        })
        expect(errors.join(" ")).toContain("between 3 and 10")
      }
      expect(
        Budget.validate({
          name: "T",
          currency: "MXN",
          type: "investing",
          initialPrincipal: 100,
          monthlyContribution: 100,
          annualRate: 10
        })
      ).toEqual([])
    })

    it("debería rechazar montos negativos o inválidos", () => {
      expect(
        Budget.validate({
          name: "T",
          currency: "MXN",
          type: "investing",
          initialPrincipal: -1,
          monthlyContribution: 0,
          annualRate: 5
        }).length
      ).toBeGreaterThan(0)
      expect(
        Budget.validate({
          name: "T",
          currency: "MXN",
          type: "investing",
          initialPrincipal: 0,
          monthlyContribution: -5,
          annualRate: 5
        }).length
      ).toBeGreaterThan(0)
    })

    it("debería rechazar transacciones en investing", () => {
      expect(
        Transaction.validate(
          { description: "X", amount: 100 },
          "investing"
        ).join(" ")
      ).toContain("do not support transactions")
    })
  })

  describe("FR-002 matemática (vectores oráculo ±0.01)", () => {
    it("caso 10000 + 1000/mes al 8%", () => {
      const rows = simulateInvestment({
        principal: 10000,
        monthly: 1000,
        annualRate: 8
      })
      expect(rows).toHaveLength(21)
      const expected = {
        0: [10000.0, 0.0, 10000.0],
        5: [70000.0, 18375.31, 88375.31],
        10: [130000.0, 75142.44, 205142.44],
        15: [190000.0, 189107.44, 379107.44],
        20: [250000.0, 388288.44, 638288.44]
      }
      for (const [year, [c, i, b]] of Object.entries(expected)) {
        const row = rows[Number(year)]
        closeTo(row.contributed, c)
        closeTo(row.interest, i)
        closeTo(row.balance, b)
      }
    })

    it("caso 0 + 500/mes al 3%", () => {
      const rows = simulateInvestment({
        principal: 0,
        monthly: 500,
        annualRate: 3
      })
      closeTo(rows[5].balance, 32323.36)
      closeTo(rows[10].balance, 69870.71)
      closeTo(rows[20].balance, 164151.0)
      closeTo(rows[20].interest, 44151.0)
    })

    it("caso 50000 sin aportes al 10%", () => {
      const rows = simulateInvestment({
        principal: 50000,
        monthly: 0,
        annualRate: 10
      })
      closeTo(rows[5].balance, 82265.45)
      closeTo(rows[20].balance, 366403.68)
      expect(rows[20].contributed).toBe(50000)
    })

    it("caso todo cero debería dar filas en cero", () => {
      const rows = simulateInvestment({
        principal: 0,
        monthly: 0,
        annualRate: 5
      })
      expect(rows).toHaveLength(21)
      for (const row of rows) {
        expect(row.contributed).toBe(0)
        expect(row.interest).toBe(0)
        expect(row.balance).toBe(0)
      }
    })

    it("Budget.getSimulation debería exponer filas solo en investing", () => {
      const inv = new Budget({
        name: "I",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 100,
        monthlyContribution: 10,
        annualRate: 5
      })
      expect(inv.getSimulation()).toHaveLength(21)
      const sav = new Budget({
        name: "S",
        currency: "MXN",
        type: "savings",
        goalAmount: 100
      })
      expect(sav.getSimulation()).toEqual([])
    })
  })

  describe("FR-001/FR-005 modelo y módulo", () => {
    it("createBudget debería persistir campos de inversión", () => {
      const module = new BudgetsModule(mockStorage(), mockEventBus(), null)
      const budget = module.createBudget({
        name: "Retiro",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 10000,
        monthlyContribution: 1000,
        annualRate: 8
      })
      expect(budget.initialPrincipal).toBe(10000)
      expect(budget.monthlyContribution).toBe(1000)
      expect(budget.annualRate).toBe(8)
      const restored = Budget.fromJSON(budget.toJSON())
      expect(restored.initialPrincipal).toBe(10000)
      expect(restored.annualRate).toBe(8)
    })

    it("savings/spending no deberían serializar campos de inversión", () => {
      const sav = new Budget({
        name: "S",
        currency: "MXN",
        type: "savings",
        goalAmount: 100
      })
      expect(sav.toJSON()).not.toHaveProperty("initialPrincipal")
      expect(sav.toJSON()).not.toHaveProperty("annualRate")
    })

    it("getTotals debería excluir investing", () => {
      const module = new BudgetsModule(mockStorage(), mockEventBus(), null)
      module.createBudget({
        name: "Gasto",
        currency: "MXN",
        type: "spending",
        initialAmount: 5000
      })
      module.createBudget({
        name: "Inv",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 999999,
        monthlyContribution: 9999,
        annualRate: 10
      })
      expect(module.getTotals()).toEqual({
        saved: 0,
        savingsGoal: 0,
        available: 5000,
        initialTotal: 5000
      })
    })

    it("addTransaction en investing debería lanzar", () => {
      const module = new BudgetsModule(mockStorage(), mockEventBus(), null)
      const budget = module.createBudget({
        name: "Inv",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 100,
        monthlyContribution: 10,
        annualRate: 5
      })
      expect(() =>
        module.addTransaction(budget.id, { description: "X", amount: 10 })
      ).toThrow()
    })
  })

  describe("FR-003 vista", () => {
    it("el chart debería graficar balance vs aportado con 21 puntos", () => {
      const rows = simulateInvestment({
        principal: 10000,
        monthly: 1000,
        annualRate: 8
      })
      const svg = investmentChartTemplate(rows, null)
      expect(svg).toContain("<svg")
      expect(svg).toContain('stroke="#0acc71"')
      expect(svg).toContain('stroke="#007acc"')
      const balanceLine = svg.match(
        /<polyline points="([^"]+)" fill="none" stroke="#0acc71"/
      )[1]
      expect(balanceLine.trim().split(" ")).toHaveLength(21)
      expect(svg).toContain("Balance")
      expect(svg).toContain("Aportado")
      expect(svg).toContain(">20a<")
    })

    it("la tarjeta investing debería mostrar proyección y CSV sin egresos", () => {
      const budget = new Budget({
        name: "Retiro",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 10000,
        monthlyContribution: 1000,
        annualRate: 8
      })
      const card = budgetCardTemplate(budget, null)
      expect(card).toContain("📈")
      expect(card).toContain("$638288.44 MXN")
      expect(card).toContain('data-action="download-csv"')
      expect(card).not.toContain('data-action="add-transaction"')
    })

    it("el modal de detalles debería traer hitos, gráfica y tabla", () => {
      const budget = new Budget({
        name: "Retiro",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 10000,
        monthlyContribution: 1000,
        annualRate: 8
      })
      const modal = investmentDetailsModalTemplate(budget, null)
      expect(modal).toContain("<svg")
      expect(modal).toContain("$88375.31 MXN")
      expect(modal).toContain("$638288.44 MXN")
      expect((modal.match(/<tr[\s>]/g) || []).length).toBe(22)
      expect(modal).toContain('data-action="download-csv"')
      expect(modal).toContain('data-action="download-pdf"')
    })

    it("el modal de crear debería ofrecer tipo inversión con sus campos", () => {
      const modal = createBudgetModalTemplate(null)
      expect(modal).toContain('value="investing"')
      expect(modal).toContain('name="initialPrincipal"')
      expect(modal).toContain('name="monthlyContribution"')
      expect(modal).toContain('name="annualRate"')
    })
  })

  describe("FR-004 descargas", () => {
    it("CSV debería replicar las filas de la tabla", () => {
      const rows = simulateInvestment({
        principal: 10000,
        monthly: 1000,
        annualRate: 8
      })
      const csv = investmentToCsv(rows)
      const lines = csv.split("\n")
      expect(lines[0]).toBe("year,contributed,interest,balance")
      expect(lines).toHaveLength(22)
      expect(lines[1]).toBe("0,10000.00,0.00,10000.00")
      const last = lines[21].split(",").map(Number)
      closeTo(last[1], 250000.0)
      closeTo(last[2], 388288.44)
      closeTo(last[3], 638288.44)
    })

    it("downloadCsv debería descargar el blob con nombre del presupuesto", () => {
      const module = new BudgetsModule(mockStorage(), mockEventBus(), null)
      const budget = module.createBudget({
        name: "Mi Retiro!",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 100,
        monthlyContribution: 10,
        annualRate: 5
      })
      URL.createObjectURL = vi.fn(() => "blob:csv")
      URL.revokeObjectURL = vi.fn()
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})

      module.downloadCsv(budget.id)

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      clickSpy.mockRestore()
    })

    it("downloadPdf debería imprimir gráfica + tabla en iframe oculto", () => {
      const module = new BudgetsModule(mockStorage(), mockEventBus(), null)
      const budget = module.createBudget({
        name: "Retiro",
        currency: "MXN",
        type: "investing",
        initialPrincipal: 10000,
        monthlyContribution: 1000,
        annualRate: 8
      })

      module.downloadPdf(budget.id)

      const iframe = document.querySelector('iframe[title="investment-print"]')
      expect(iframe).not.toBeNull()
      const docHtml = iframe.contentDocument.documentElement.innerHTML
      expect(docHtml).toContain("<svg")
      expect(docHtml).toContain("<table>")
      expect(docHtml).toContain("Retiro")
      expect(docHtml).toContain("638288.44")
      iframe.contentWindow.onafterprint()
      expect(document.querySelector('iframe[title="investment-print"]')).toBeNull()
    })
  })
})
