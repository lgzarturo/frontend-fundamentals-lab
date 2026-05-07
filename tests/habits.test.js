import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Habit } from '../assets/js/modules/habits/models.js'
import { HabitsModule } from '../assets/js/modules/habits/index.js'
import { formatDate, getTodayString } from '../assets/js/utils/date.js'

// ─── helpers ──────────────────────────────────────────────────────────────────

function dateOffset(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return formatDate(d)
}

const mockStorage = () => ({
  data: {},
  get(k) { return this.data[k] ?? null },
  set(k, v) { this.data[k] = v },
  remove(k) { delete this.data[k] }
})

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

// ─── Habit model ──────────────────────────────────────────────────────────────

describe('Habit', () => {
  describe('constructor defaults', () => {
    it('debería tener valores por defecto correctos', () => {
      const h = new Habit()
      expect(h.id).toBeDefined()
      expect(h.title).toBe('')
      expect(h.description).toBe('')
      expect(h.schedule).toBe('daily')
      expect(h.dailyRecords).toEqual({})
      expect(h.streak).toBe(0)
      expect(h.color).toBe('#00ff88')
      expect(h.createdAt).toBeDefined()
    })

    it('debería usar los datos del constructor cuando se proveen', () => {
      const h = new Habit({ title: 'Leer', color: '#ff0000', streak: 5 })
      expect(h.title).toBe('Leer')
      expect(h.color).toBe('#ff0000')
      expect(h.streak).toBe(5)
    })
  })

  describe('isCompletedToday()', () => {
    it('debería devolver false cuando no hay registros', () => {
      const h = new Habit({ title: 'Test' })
      expect(h.isCompletedToday()).toBe(false)
    })

    it('debería devolver true cuando el día de hoy está marcado', () => {
      const h = new Habit({ title: 'Test', dailyRecords: { [getTodayString()]: true } })
      expect(h.isCompletedToday()).toBe(true)
    })
  })

  describe('toggle()', () => {
    it('debería marcar el día cuando no estaba marcado', () => {
      const h = new Habit({ title: 'Test' })
      const result = h.toggle()
      expect(result).toBe(true)
      expect(h.isCompletedToday()).toBe(true)
    })

    it('debería desmarcar el día cuando ya estaba marcado', () => {
      const today = getTodayString()
      const h = new Habit({ title: 'Test', dailyRecords: { [today]: true } })
      const result = h.toggle()
      expect(result).toBe(false)
      expect(h.isCompletedToday()).toBe(false)
    })

    it('debería aceptar una fecha específica', () => {
      const h = new Habit({ title: 'Test' })
      const yesterday = dateOffset(1)
      h.toggle(yesterday)
      expect(h.isCompletedOn(yesterday)).toBe(true)
    })
  })

  describe('_recalculateStreak()', () => {
    it('debería calcular racha con días consecutivos', () => {
      const records = {
        [dateOffset(0)]: true,
        [dateOffset(1)]: true,
        [dateOffset(2)]: true
      }
      const h = new Habit({ title: 'Test', dailyRecords: records })
      h._recalculateStreak()
      expect(h.streak).toBe(3)
    })

    it('debería cortar la racha cuando hay un día sin completar', () => {
      const records = {
        [dateOffset(0)]: true,
        // gap en día 1
        [dateOffset(2)]: true,
        [dateOffset(3)]: true
      }
      const h = new Habit({ title: 'Test', dailyRecords: records })
      h._recalculateStreak()
      expect(h.streak).toBe(1)
    })

    it('debería devolver 0 cuando hoy no está completado', () => {
      const records = {
        [dateOffset(1)]: true,
        [dateOffset(2)]: true
      }
      const h = new Habit({ title: 'Test', dailyRecords: records })
      h._recalculateStreak()
      expect(h.streak).toBe(0)
    })

    it('debería actualizar el streak al hacer toggle', () => {
      const h = new Habit({ title: 'Test' })
      h.toggle()
      expect(h.streak).toBe(1)
    })
  })

  describe('getCompletionRate()', () => {
    it('debería devolver 0% sin registros', () => {
      const h = new Habit({ title: 'Test' })
      expect(h.getCompletionRate(7)).toBe(0)
    })

    it('debería devolver ~100% con todos los días marcados', () => {
      const records = {}
      for (let i = 0; i < 7; i++) records[dateOffset(i)] = true
      const h = new Habit({ title: 'Test', dailyRecords: records })
      expect(h.getCompletionRate(7)).toBeCloseTo(100)
    })

    it('debería devolver 50% con la mitad de días marcados', () => {
      const records = {}
      for (let i = 0; i < 7; i++) {
        if (i % 2 === 0) records[dateOffset(i)] = true
      }
      const h = new Habit({ title: 'Test', dailyRecords: records })
      // 4 de 7 días ≈ 57%, ajustamos a 3 de 6 exacto
      const r3 = {}
      for (let i = 0; i < 6; i++) {
        r3[dateOffset(i)] = i % 2 === 0
      }
      const h2 = new Habit({ title: 'Test', dailyRecords: r3 })
      expect(h2.getCompletionRate(6)).toBeCloseTo(50)
    })
  })

  describe('getWeekRecords()', () => {
    it('debería retornar exactamente 7 elementos', () => {
      const h = new Habit({ title: 'Test' })
      const records = h.getWeekRecords()
      expect(records).toHaveLength(7)
    })

    it('debería retornar objetos con {date, completed}', () => {
      const h = new Habit({ title: 'Test' })
      const records = h.getWeekRecords()
      records.forEach(r => {
        expect(r).toHaveProperty('date')
        expect(r).toHaveProperty('completed')
        expect(typeof r.date).toBe('string')
        expect(typeof r.completed).toBe('boolean')
      })
    })

    it('debería marcar como completado el día que está en dailyRecords', () => {
      const today = getTodayString()
      const h = new Habit({ title: 'Test', dailyRecords: { [today]: true } })
      const records = h.getWeekRecords()
      const todayRecord = records.find(r => r.date === today)
      expect(todayRecord?.completed).toBe(true)
    })
  })

  describe('Habit.validate()', () => {
    it('debería requerir título', () => {
      const errors = Habit.validate({ title: '' })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Title')
    })

    it('debería rechazar schedule distinto de daily', () => {
      const errors = Habit.validate({ title: 'Test', schedule: 'weekly' })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('daily')
    })

    it('debería aceptar schedule daily', () => {
      const errors = Habit.validate({ title: 'Test', schedule: 'daily' })
      expect(errors).toHaveLength(0)
    })

    it('debería rechazar color vacío', () => {
      const errors = Habit.validate({ title: 'Test', color: '' })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('debería aceptar un hábito válido sin schedule explícito', () => {
      const errors = Habit.validate({ title: 'Leer' })
      expect(errors).toHaveLength(0)
    })
  })

  describe('serialización round-trip', () => {
    it('debería conservar dailyRecords y streak en toJSON → fromJSON', () => {
      const records = {
        [dateOffset(0)]: true,
        [dateOffset(1)]: true
      }
      const h = new Habit({ title: 'Test', dailyRecords: records })
      h._recalculateStreak()

      const restored = Habit.fromJSON(h.toJSON())
      expect(restored.title).toBe('Test')
      expect(restored.dailyRecords).toEqual(records)
      expect(restored.streak).toBe(h.streak)
    })

    it('debería preservar todos los campos', () => {
      const h = new Habit({
        title: 'Meditación',
        description: 'Desc',
        color: '#aabbcc',
        schedule: 'daily'
      })
      const restored = Habit.fromJSON(h.toJSON())
      expect(restored.title).toBe(h.title)
      expect(restored.description).toBe(h.description)
      expect(restored.color).toBe(h.color)
      expect(restored.schedule).toBe(h.schedule)
      expect(restored.id).toBe(h.id)
      expect(restored.createdAt).toBe(h.createdAt)
    })
  })
})

// ─── HabitsModule ─────────────────────────────────────────────────────────────

describe('HabitsModule', () => {
  let storage
  let bus
  let module

  beforeEach(() => {
    storage = mockStorage()
    bus = mockEventBus()
    module = new HabitsModule(storage, bus, null)
    // sin DOM: container queda null y render() es no-op
    module.container = null
    module.modalContainer = null
  })

  it('debería arrancar vacío', () => {
    module._loadHabits()
    expect(module.habits).toHaveLength(0)
  })

  it('debería crear un hábito y emitir habit:created', () => {
    const h = module.createHabit({ title: 'Leer' })
    expect(h.title).toBe('Leer')
    expect(module.habits).toHaveLength(1)
    expect(bus.emit).toHaveBeenCalledWith('habit:created', h)
  })

  it('debería lanzar error si el título está vacío', () => {
    expect(() => module.createHabit({ title: '' })).toThrow()
  })

  it('debería eliminar un hábito y emitir habit:deleted', () => {
    const h = module.createHabit({ title: 'Correr' })
    module.deleteHabit(h.id)
    expect(module.habits).toHaveLength(0)
    expect(bus.emit).toHaveBeenCalledWith('habit:deleted', h)
  })

  it('debería lanzar error al eliminar id inexistente', () => {
    expect(() => module.deleteHabit('nope')).toThrow()
  })

  it('debería togglear un hábito y emitir habit:toggled', () => {
    const h = module.createHabit({ title: 'Meditar' })
    module.toggleHabit(h.id)
    expect(h.isCompletedToday()).toBe(true)
    expect(bus.emit).toHaveBeenCalledWith('habit:toggled', expect.objectContaining({ habit: h }))
  })

  it('debería emitir habit:allCompleted cuando todos están completados', () => {
    const h = module.createHabit({ title: 'Solo hábito' })
    module.toggleHabit(h.id)
    expect(bus.emit).toHaveBeenCalledWith('habit:allCompleted', module.habits)
  })

  it('NO debería emitir habit:allCompleted si alguno queda pendiente', () => {
    module.createHabit({ title: 'A' })
    const b = module.createHabit({ title: 'B' })
    module.toggleHabit(b.id)
    const allCompletedCalls = bus.emit.mock.calls.filter(([e]) => e === 'habit:allCompleted')
    expect(allCompletedCalls).toHaveLength(0)
  })

  it('debería persistir y recuperar hábitos', () => {
    module.createHabit({ title: 'Persistir' })
    const module2 = new HabitsModule(storage, mockEventBus(), null)
    module2.container = null
    module2._loadHabits()
    expect(module2.habits).toHaveLength(1)
    expect(module2.habits[0].title).toBe('Persistir')
  })

  it('getMaxStreak() debería devolver 0 sin hábitos', () => {
    expect(module.getMaxStreak()).toBe(0)
  })

  it('getMaxStreak() debería retornar el streak máximo', () => {
    const h1 = module.createHabit({ title: 'A' })
    h1.streak = 5
    const h2 = module.createHabit({ title: 'B' })
    h2.streak = 12
    expect(module.getMaxStreak()).toBe(12)
  })

  it('getTodayCompletionRate() debería devolver 0% sin hábitos', () => {
    expect(module.getTodayCompletionRate()).toBe(0)
  })

  it('getTodayCompletionRate() debería devolver 50% con la mitad completada', () => {
    const h1 = module.createHabit({ title: 'A' })
    module.createHabit({ title: 'B' })
    module.toggleHabit(h1.id)
    expect(module.getTodayCompletionRate()).toBe(50)
  })
})
