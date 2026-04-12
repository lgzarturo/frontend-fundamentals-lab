# Arquitectura Modular - Frontend Fundamentals Lab

## Resumen de Cambios

Este documento describe la nueva arquitectura modular implementada para
reemplazar el archivo `app.js` monolítico de 3,489 líneas.

## Estructura de Carpetas

```
assets/js/
├── core/                   # Núcleo de la aplicación
│   ├── app.js             # Clase DOSApp principal (orquestación)
│   └── eventBus.js        # Sistema de eventos para comunicación
│
├── modules/               # Módulos de funcionalidad
│   ├── budgets/           # Módulo de presupuestos (prioritario)
│   │   ├── index.js       # Clase BudgetsModule
│   │   ├── models.js      # Clases Budget, BudgetItem, Transaction
│   │   └── templates.js   # Templates HTML con tagged literals
│   ├── tasks/             # TODO: Módulo de tareas
│   ├── habits/            # TODO: Módulo de hábitos
│   ├── notes/             # TODO: Módulo de notas
│   └── home/              # TODO: Dashboard/MITS
│
├── services/              # Servicios compartidos
│   └── storage.js         # Servicio de almacenamiento (localStorage)
│
├── utils/                 # Utilidades
│   ├── id.js              # Generación de IDs
│   ├── date.js            # Formateo de fechas
│   └── html.js            # Escape HTML y helpers DOM
│
└── data/
    └── demoData.js        # Datos de demostración
```

## Características Implementadas

### 1. Clases ES6

- **Budget**: Gestiona presupuestos completos
- **BudgetItem**: Items/categorías de presupuesto
- **Transaction**: Transacciones financieras
- **BudgetsModule**: Módulo principal de presupuestos
- **StorageService**: Servicio de persistencia
- **EventBus**: Comunicación entre módulos
- **DOSApp**: Orquestador principal

### 2. Tagged Template Literals

Los templates HTML ahora usan tagged templates para escapado automático:

```javascript
import { html } from "./templates.js"

const template = html`
  <div class="budget-card">
    <h3>${budget.name}</h3>
    <!-- Escapado automático -->
  </div>
`
```

### 3. Migración de Datos

El `StorageService` migra automáticamente datos de formatos anteriores:

- `dos-app-data-v1` → `dos-app-data-v2`
- Claves separadas (`tasks`, `habits`, etc.) → Estructura unificada

### 4. Tests con Vitest

Configuración completa de testing:

- 28 tests pasando
- Cobertura de modelos, servicios y utilidades
- Mock de localStorage para tests

## API del Módulo Budgets

### Crear Presupuesto

```javascript
const budget = budgetsModule.createBudget({
  name: "Monthly Budget",
  currency: "USD"
})
```

### Agregar Item

```javascript
budgetsModule.addItem(budgetId, {
  title: "Groceries",
  amount: 500,
  notes: "Weekly shopping"
})
```

### Agregar Transacción

```javascript
budgetsModule.addTransaction(budgetId, {
  description: "Weekly groceries",
  amount: -45 // Negativo = gasto
})
```

### Obtener Totales

```javascript
const totals = budgetsModule.getTotals()
// { allocated: 1000, spent: 450, remaining: 550 }
```

## Eventos del EventBus

### Emitidos por BudgetsModule

- `budget:created` - Nuevo presupuesto creado
- `budget:deleted` - Presupuesto eliminado
- `budget:itemAdded` - Item agregado
- `budget:itemRemoved` - Item eliminado
- `budget:transactionAdded` - Transacción agregada

### Consumidos

- `toast:show` - Mostrar notificación
- `modal:close` - Cerrar modal

## Próximos Pasos

1. **Migrar módulo Tasks**: Similar estructura a Budgets
2. **Migrar módulo Habits**: Con lógica de rachas
3. **Migrar módulo Notes**: Con parser Markdown
4. **Actualizar index.html**: Cargar módulos ES6
5. **Agregar más tests**: Cobertura completa

## Comandos

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Cobertura
npm run test:coverage
```

## Compatibilidad

- ✅ Mantiene compatibilidad con datos existentes
- ✅ Usa ES6 modules nativos
- ✅ Sin bundler requerido (para desarrollo)
- ✅ Tests con Vitest + jsdom
