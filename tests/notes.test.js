import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Note } from '../assets/js/modules/notes/models.js'
import { NotesModule } from '../assets/js/modules/notes/index.js'

describe('Note Model', () => {
  describe('constructor defaults', () => {
    it('debería generar id si no se provee', () => {
      const note = new Note({ title: 'Test' })
      expect(note.id).toBeDefined()
      expect(typeof note.id).toBe('string')
    })

    it('debería inicializar con valores vacíos por defecto', () => {
      const note = new Note()
      expect(note.title).toBe('')
      expect(note.bodyMarkdown).toBe('')
      expect(note.tags).toEqual([])
    })

    it('debería copiar el array de tags, no referenciarlo', () => {
      const tags = ['a', 'b']
      const note = new Note({ title: 'T', tags })
      note.tags.push('c')
      expect(tags).toHaveLength(2)
    })

    it('debería asignar createdAt y updatedAt como timestamps', () => {
      const before = Date.now()
      const note = new Note({ title: 'Test' })
      const after = Date.now()
      expect(note.createdAt).toBeGreaterThanOrEqual(before)
      expect(note.createdAt).toBeLessThanOrEqual(after)
      expect(note.updatedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe('getPreview()', () => {
    it('debería eliminar caracteres markdown', () => {
      const note = new Note({ title: 'T', bodyMarkdown: '# Título **negrita** _cursiva_ `code` [link]' })
      const preview = note.getPreview()
      expect(preview).not.toMatch(/[#*_`[\]]/)
    })

    it('debería truncar a 100 caracteres por defecto', () => {
      const longBody = 'a'.repeat(150)
      const note = new Note({ title: 'T', bodyMarkdown: longBody })
      expect(note.getPreview()).toHaveLength(103) // 100 + '...'
    })

    it('debería respetar maxLength custom', () => {
      const note = new Note({ title: 'T', bodyMarkdown: 'a'.repeat(50) })
      const preview = note.getPreview(20)
      expect(preview).toHaveLength(23) // 20 + '...'
    })

    it('no debería agregar puntos si el texto cabe', () => {
      const note = new Note({ title: 'T', bodyMarkdown: 'corto' })
      expect(note.getPreview()).toBe('corto')
    })
  })

  describe('matchesSearch()', () => {
    let note

    beforeEach(() => {
      note = new Note({
        title: 'Mi Reunión',
        bodyMarkdown: 'Notas de la reunión de trabajo',
        tags: ['trabajo', 'reunión']
      })
    })

    it('debería encontrar por título', () => {
      expect(note.matchesSearch('reunión')).toBe(true)
    })

    it('debería encontrar por body', () => {
      expect(note.matchesSearch('trabajo')).toBe(true)
    })

    it('debería encontrar por tag', () => {
      expect(note.matchesSearch('reunión')).toBe(true)
    })

    it('debería ser case insensitive', () => {
      expect(note.matchesSearch('MI REUNIÓN')).toBe(true)
      expect(note.matchesSearch('TRABAJO')).toBe(true)
    })

    it('debería retornar false cuando no hay match', () => {
      expect(note.matchesSearch('vacaciones')).toBe(false)
    })

    it('debería retornar true con query vacía', () => {
      expect(note.matchesSearch('')).toBe(true)
    })
  })

  describe('touch()', () => {
    it('debería actualizar updatedAt', () => {
      const note = new Note({ title: 'T', updatedAt: 1000 })
      const before = Date.now()
      note.touch()
      expect(note.updatedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe('Note.validate()', () => {
    it('debería requerir título', () => {
      const errors = Note.validate({ title: '' })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Title')
    })

    it('debería rechazar título con solo espacios', () => {
      const errors = Note.validate({ title: '   ' })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('debería aceptar nota válida', () => {
      const errors = Note.validate({ title: 'Válida' })
      expect(errors).toHaveLength(0)
    })
  })

  describe('serialización round-trip', () => {
    it('debería conservar todos los campos via toJSON → fromJSON', () => {
      const original = new Note({
        title: 'Test',
        bodyMarkdown: '## Hola\nMundo',
        tags: ['uno', 'dos'],
        createdAt: 1000000,
        updatedAt: 2000000
      })
      const json = original.toJSON()
      const restored = Note.fromJSON(json)

      expect(restored.id).toBe(original.id)
      expect(restored.title).toBe(original.title)
      expect(restored.bodyMarkdown).toBe(original.bodyMarkdown)
      expect(restored.tags).toEqual(original.tags)
      expect(restored.createdAt).toBe(original.createdAt)
      expect(restored.updatedAt).toBe(original.updatedAt)
    })

    it('toJSON debería retornar un objeto plano', () => {
      const note = new Note({ title: 'Test', tags: ['a'] })
      const json = note.toJSON()
      expect(json).not.toBeInstanceOf(Note)
      expect(Array.isArray(json.tags)).toBe(true)
    })
  })
})

describe('NotesModule', () => {
  let storage, eventBus, module

  beforeEach(() => {
    const store = {}
    storage = {
      get: vi.fn(key => store[key] || null),
      set: vi.fn((key, val) => { store[key] = val })
    }
    const listeners = {}
    eventBus = {
      on: vi.fn((event, cb) => {
        listeners[event] = listeners[event] || []
        listeners[event].push(cb)
      }),
      emit: vi.fn((event, data) => {
        (listeners[event] || []).forEach(cb => cb(data))
      })
    }
    module = new NotesModule(storage, eventBus, null)
    // init sin DOM: solo carga notas
    module.notes = []
    module.container = null
    module.modalContainer = null
  })

  describe('createNote()', () => {
    it('debería crear una nota y emitir note:created', () => {
      const note = module.createNote({ title: 'Mi nota', bodyMarkdown: '# Hola', tags: ['x'] })
      expect(note).toBeInstanceOf(Note)
      expect(note.title).toBe('Mi nota')
      expect(eventBus.emit).toHaveBeenCalledWith('note:created', note)
    })

    it('debería persistir en storage', () => {
      module.createNote({ title: 'Test' })
      expect(storage.set).toHaveBeenCalledWith('notes', expect.any(Array))
    })

    it('debería lanzar error si falta título', () => {
      expect(() => module.createNote({ title: '' })).toThrow()
    })

    it('debería agregar la nota al inicio de la lista', () => {
      module.createNote({ title: 'Primera' })
      module.createNote({ title: 'Segunda' })
      expect(module.notes[0].title).toBe('Segunda')
    })
  })

  describe('deleteNote()', () => {
    it('debería eliminar la nota y emitir note:deleted', () => {
      const note = module.createNote({ title: 'Para borrar' })
      module.deleteNote(note.id)
      expect(module.notes).toHaveLength(0)
      expect(eventBus.emit).toHaveBeenCalledWith('note:deleted', note)
    })

    it('debería lanzar error si la nota no existe', () => {
      expect(() => module.deleteNote('id-falso')).toThrow()
    })
  })

  describe('searchNotes()', () => {
    beforeEach(() => {
      module.createNote({ title: 'React hooks', bodyMarkdown: 'Uso de useState', tags: ['frontend'] })
      module.createNote({ title: 'Node.js tips', bodyMarkdown: 'Express middleware', tags: ['backend'] })
      module.createNote({ title: 'CSS Grid', bodyMarkdown: 'Layout moderno', tags: ['frontend', 'css'] })
    })

    it('debería filtrar por título', () => {
      const results = module.searchNotes('react')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('React hooks')
    })

    it('debería filtrar por body', () => {
      const results = module.searchNotes('middleware')
      expect(results).toHaveLength(1)
    })

    it('debería filtrar por tag', () => {
      const results = module.searchNotes('frontend')
      expect(results).toHaveLength(2)
    })

    it('debería ser case insensitive', () => {
      expect(module.searchNotes('CSS')).toHaveLength(1)
    })

    it("debería retornar todas las notas con query vacía", () => {
      expect(module.searchNotes("")).toHaveLength(3)
    })
  })

  describe("getAllTags()", () => {
    it("debería retornar todas las etiquetas únicas ordenadas", () => {
      module.createNote({ title: "N1", tags: ["zebra", "apple"] })
      module.createNote({ title: "N2", tags: ["apple", "banana"] })
      expect(module.getAllTags()).toEqual(["apple", "banana", "zebra"])
    })

    it("debería incluir etiquetas de tareas almacenadas si existen", () => {
      storage.get = vi.fn(key => {
        if (key === "tasks") return [{ tags: ["tarea-tag"] }]
        return null
      })
      module.createNote({ title: "N1", tags: ["nota-tag"] })
      expect(module.getAllTags()).toEqual(["nota-tag", "tarea-tag"])
    })
  })

  describe("Modales con TagInput", () => {
    let modalRoot

    beforeEach(() => {
      modalRoot = document.createElement("div")
      modalRoot.id = "modal-content"
      document.body.appendChild(modalRoot)
      module.modalContainer = modalRoot
      eventBus.on("modal:open", ({ contentHtml }) => {
        modalRoot.innerHTML = contentHtml
      })
    })

    it("showCreateModal debería inicializar TagInput y procesar etiquetas", () => {
      module.showCreateModal()
      const widget = modalRoot.querySelector(".tag-input-widget")
      expect(widget).not.toBeNull()

      const input = modalRoot.querySelector(".tag-text-input")
      input.value = "nueva-tag"
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))

      const form = modalRoot.querySelector("#create-note-form")
      form.querySelector('input[name="title"]').value = "Nota creada"
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))

      expect(module.notes[0].title).toBe("Nota creada")
      expect(module.notes[0].tags).toContain("nueva-tag")
    })

    it("showEditModal debería cargar las etiquetas existentes en TagInput", () => {
      const note = module.createNote({ title: "Original", tags: ["existente"] })
      module.showEditModal(note.id)

      const chip = modalRoot.querySelector('.tag-chip[data-tag="existente"]')
      expect(chip).not.toBeNull()

      const form = modalRoot.querySelector("#edit-note-form")
      form.querySelector('input[name="title"]').value = "Nota modificada"
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))

      expect(module.notes[0].title).toBe("Nota modificada")
      expect(module.notes[0].tags).toEqual(["existente"])
    })
  })
})
