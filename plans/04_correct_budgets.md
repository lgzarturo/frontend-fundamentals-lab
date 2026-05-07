# Plan 04 — Rediseño del módulo de Presupuestos

## Contexto

El módulo actual tiene dos problemas fundamentales:

**1. Inconsistencia interna entre archivos:**

- `models.js` define `BudgetItem.amount` (campo único)
- `index.js` referencia `item.planned` e `item.actual` (campos inexistentes)
- `Budget.validate()` acepta GBP, que no es moneda del proyecto
- `createBudget()` exige `period` y `startDate`, pero `Budget` constructor no
  los persiste

**2. Concepto de presupuesto ambiguo:** El sistema no distingue entre dos
intenciones de uso completamente distintas:

|                | Ahorro                               | Gasto                                   |
| -------------- | ------------------------------------ | --------------------------------------- |
| Pregunta       | ¿Cuánto llevo ahorrado para mi meta? | ¿Cuánto me queda del dinero disponible? |
| Estado inicial | $0                                   | Monto ya disponible                     |
| Transacciones  | Depósitos positivos (acumulan)       | Egresos negativos (consumen)            |
| Métrica clave  | Progreso hacia la meta               | Saldo restante                          |
| Ejemplo        | Xbox $11,000 MXN, llevo $4,500       | Efectivo $5,000 MXN, gasté $1,200       |

---

## Tipos de presupuesto

### `savings` — Presupuesto de ahorro

El usuario define una **meta** (monto objetivo). Empieza en cero y registra
depósitos o ingresos para avanzar hacia esa meta.

- Campo requerido: `goalAmount` (el techo al que quiere llegar)
- Transacciones: solo montos **positivos** (depósitos)
- Métrica: `progreso = totalDepositado / goalAmount`
- Estado "alcanzado" cuando `totalDepositado >= goalAmount`

**Ejemplo UX:**

```
Xbox Series X — MXN
Meta: $11,000  |  Ahorrado: $4,500  |  Faltan: $6,500
[████████░░░░░░░░░░░░] 40.9%
```

### `spending` — Presupuesto de gasto

El usuario define un **monto inicial disponible**. Registra egresos que van
reduciendo ese saldo hasta llegar a cero.

- Campo requerido: `initialAmount` (lo que tiene disponible)
- Transacciones: solo montos **negativos** (egresos)
- Métrica: `saldo = initialAmount + sumaTransacciones`
- Estado "agotado" cuando `saldo <= 0`

**Ejemplo UX:**

```
Efectivo disponible — MXN
Inicial: $5,000  |  Gastado: $1,200  |  Disponible: $3,800
[██████████████░░░░░░] 76% restante
```

---

## Monedas soportadas

Solo tres: `MXN`, `USD`, `EUR`. Eliminar `GBP` de la validación.

---

## Cambios requeridos

### `assets/js/modules/budgets/models.js`

#### `Budget` — campos nuevos

```javascript
class Budget {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.name = data.name || ''
    this.currency = data.currency || 'MXN'
    this.type = data.type || 'spending'        // 'savings' | 'spending'
    this.goalAmount = parseFloat(data.goalAmount) || 0    // solo savings
    this.initialAmount = parseFloat(data.initialAmount) || 0 // solo spending
    this.transactions = (data.transactions || []).map(...)
    // Eliminar: this.items — no se necesita en ninguno de los dos tipos
  }
}
```

#### `Budget` — métodos nuevos / modificados

```javascript
// Reemplaza getTotalAllocated() y getRemaining()
getBalance() {
  const sum = this.transactions.reduce((acc, t) => acc + t.amount, 0)
  if (this.type === 'spending') return this.initialAmount + sum
  return sum // savings: total depositado
}

getProgress() {
  if (this.type === 'savings') {
    if (this.goalAmount === 0) return 0
    return Math.min((this.getBalance() / this.goalAmount) * 100, 100)
  }
  // spending: porcentaje restante respecto al inicial
  if (this.initialAmount === 0) return 0
  return Math.max((this.getBalance() / this.initialAmount) * 100, 0)
}

isGoalReached() {
  return this.type === 'savings' && this.getBalance() >= this.goalAmount
}

isExhausted() {
  return this.type === 'spending' && this.getBalance() <= 0
}

getStatus() {
  const pct = this.getProgress()
  if (this.type === 'savings') {
    if (pct >= 100) return 'reached'
    if (pct >= 75) return 'safe'
    if (pct >= 40) return 'warning'
    return 'danger'
  }
  // spending: status inverso (más alto = más seguro)
  if (pct <= 10) return 'danger'
  if (pct <= 30) return 'warning'
  return 'safe'
}
```

#### `Budget.validate()` — corrección de monedas

```javascript
static validate(data) {
  const errors = []
  if (!data.name?.trim()) errors.push('Budget name is required')
  if (!['MXN', 'USD', 'EUR'].includes(data.currency)) {
    errors.push('Currency must be MXN, USD or EUR')
  }
  if (!['savings', 'spending'].includes(data.type)) {
    errors.push('Type must be savings or spending')
  }
  if (data.type === 'savings' && !(parseFloat(data.goalAmount) > 0)) {
    errors.push('Savings budget requires a goal amount greater than 0')
  }
  if (data.type === 'spending' && !(parseFloat(data.initialAmount) > 0)) {
    errors.push('Spending budget requires an initial amount greater than 0')
  }
  return errors
}
```

#### `Transaction.validate()` — validación por tipo de presupuesto

```javascript
static validate(data, budgetType) {
  const errors = []
  if (!data.description?.trim()) errors.push('Description is required')
  if (isNaN(data.amount) || data.amount === 0) {
    errors.push('Amount cannot be zero')
  }
  if (budgetType === 'savings' && data.amount < 0) {
    errors.push('Savings transactions must be positive (deposits)')
  }
  if (budgetType === 'spending' && data.amount > 0) {
    errors.push('Spending transactions must be negative (expenses)')
  }
  return errors
}
```

#### Eliminar `BudgetItem`

No encaja en ninguno de los dos tipos. Eliminar la clase y todos sus usos. Si en
el futuro se necesitan categorías, se plantea en un plan separado.

---

### `assets/js/modules/budgets/index.js`

#### `createBudget()` — firma corregida

```javascript
createBudget(data) {
  const errors = Budget.validate(data)
  if (errors.length) throw new Error(errors.join(', '))

  const budget = new Budget({
    name: data.name,
    currency: data.currency,
    type: data.type,
    goalAmount: data.type === 'savings' ? data.goalAmount : 0,
    initialAmount: data.type === 'spending' ? data.initialAmount : 0
  })

  this.budgets.push(budget)
  this._saveBudgets()
  this.render()
  this.eventBus.emit('budget:created', budget)
  return budget
}
```

#### `addTransaction()` — validación por tipo

```javascript
addTransaction(budgetId, transactionData) {
  const budget = this.budgets.find(b => b.id === budgetId)
  if (!budget) throw new Error(`Budget not found: ${budgetId}`)

  const errors = Transaction.validate(transactionData, budget.type)
  if (errors.length) throw new Error(errors.join(', '))

  const transaction = new Transaction(transactionData)
  budget.transactions.push(transaction)
  this._saveBudgets()
  this.render()
  this.eventBus.emit('budget:transactionAdded', { budget, transaction })
  return transaction
}
```

#### Eliminar: `addItem()`, `removeItem()`, `showAddItemModal()`

---

### `assets/js/modules/budgets/templates.js`

#### Modal de creación — selector de tipo

El modal debe incluir un selector visual claro antes del formulario:

```
[ 🎯 Ahorro ]     [ 💸 Gasto ]
  Quiero llegar     Tengo dinero
  a una meta        disponible
```

Al seleccionar el tipo, el formulario cambia:

- **Ahorro** → campo "Monto objetivo (meta)"
- **Gasto** → campo "Monto inicial disponible"

Ambos comparten: nombre, moneda (select con MXN/USD/EUR).

#### Cards de presupuesto — diferenciadas por tipo

**Card savings:**

```
🎯 Xbox Series X                     [Eliminar]
   Meta: $11,000 MXN
   Ahorrado: $4,500 | Faltan: $6,500
   [████████░░░░░░░░░░░░] 40.9%
                           [+ Depósito]
```

**Card spending:**

```
💸 Efectivo disponible               [Eliminar]
   Inicial: $5,000 MXN
   Disponible: $3,800 | Gastado: $1,200
   [██████████████░░░░░░] 76%
                           [+ Egreso]
```

#### Modal de transacción — diferenciado por tipo

- **Ahorro**: título "Agregar depósito", monto siempre positivo (sin signo)
- **Gasto**: título "Registrar egreso", monto siempre positivo en UI (se guarda
  como negativo internamente)

---

### `assets/js/modules/budgets/index.js` — `getTotals()`

Recalcular con la nueva lógica:

```javascript
getTotals() {
  return this.budgets.reduce(
    (acc, budget) => {
      if (budget.type === 'savings') {
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
```

---

## Tests a actualizar / agregar

Archivo: `tests/budgets.test.js`

Casos necesarios:

- `Budget savings`: getBalance() acumula depósitos
- `Budget savings`: getProgress() = 0% sin transacciones, 100% al alcanzar meta
- `Budget savings`: isGoalReached() true cuando balance >= goalAmount
- `Budget spending`: getBalance() = initialAmount - egresos
- `Budget spending`: isExhausted() true cuando balance <= 0
- `Transaction.validate()` rechaza negativos en savings
- `Transaction.validate()` rechaza positivos en spending
- `Budget.validate()` rechaza GBP y acepta solo MXN/USD/EUR
- `Budget.validate()` rechaza savings sin goalAmount
- `Budget.validate()` rechaza spending sin initialAmount

---

## Migración de datos existentes

El `StorageService` debe manejar presupuestos guardados en formato viejo (sin
campo `type`). Regla de migración:

```javascript
// En StorageService._migrateLegacyData() o en Budget.fromJSON()
if (!data.type) {
  data.type = "spending"
  data.initialAmount = data.items?.reduce((s, i) => s + (i.amount || 0), 0) || 0
  delete data.items
}
```

---

## Orden de implementación

1. Actualizar `models.js`: agregar `type`, `goalAmount`, `initialAmount`;
   eliminar `BudgetItem`; corregir `validate()`; agregar nuevos métodos de
   cálculo.
2. Actualizar `tests/budgets.test.js`: todos los casos nuevos deben pasar.
3. Actualizar `index.js`: `createBudget()`, `addTransaction()`, `getTotals()`;
   eliminar métodos de items.
4. Actualizar `templates.js`: modal de creación con selector de tipo, cards
   diferenciadas, modal de transacción por tipo.
5. Agregar migración en `StorageService` para datos existentes.
6. Actualizar claves i18n en `assets/locales/es.json` y
   `assets/locales/en.json`.
