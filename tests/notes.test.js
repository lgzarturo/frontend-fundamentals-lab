import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Note } from "../assets/js/modules/notes/models.js"
import { NotesModule } from "../assets/js/modules/notes/index.js"
import { parseMarkdown } from "../assets/js/modules/notes/templates.js"

describe("Note Model", () => {
  describe("constructor defaults", () => {
    it("debería generar id si no se provee", () => {
      const note = new Note({ title: "Test" })
      expect(note.id).toBeDefined()
      expect(typeof note.id).toBe("string")
    })

    it("debería inicializar con valores vacíos por defecto", () => {
      const note = new Note()
      expect(note.title).toBe("")
      expect(note.bodyMarkdown).toBe("")
      expect(note.tags).toEqual([])
    })

    it("debería copiar el array de tags, no referenciarlo", () => {
      const tags = ["a", "b"]
      const note = new Note({ title: "T", tags })
      note.tags.push("c")
      expect(tags).toHaveLength(2)
    })

    it("debería asignar createdAt y updatedAt como timestamps", () => {
      const before = Date.now()
      const note = new Note({ title: "Test" })
      const after = Date.now()
      expect(note.createdAt).toBeGreaterThanOrEqual(before)
      expect(note.createdAt).toBeLessThanOrEqual(after)
      expect(note.updatedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe("getPreview()", () => {
    it("debería eliminar caracteres markdown", () => {
      const note = new Note({
        title: "T",
        bodyMarkdown: "# Título **negrita** _cursiva_ `code` [link]"
      })
      const preview = note.getPreview()
      expect(preview).not.toMatch(/[#*_`[\]]/)
    })

    it("debería truncar a 100 caracteres por defecto", () => {
      const longBody = "a".repeat(150)
      const note = new Note({ title: "T", bodyMarkdown: longBody })
      expect(note.getPreview()).toHaveLength(103) // 100 + '...'
    })

    it("debería respetar maxLength custom", () => {
      const note = new Note({ title: "T", bodyMarkdown: "a".repeat(50) })
      const preview = note.getPreview(20)
      expect(preview).toHaveLength(23) // 20 + '...'
    })

    it("no debería agregar puntos si el texto cabe", () => {
      const note = new Note({ title: "T", bodyMarkdown: "corto" })
      expect(note.getPreview()).toBe("corto")
    })
  })

  describe("matchesSearch()", () => {
    let note

    beforeEach(() => {
      note = new Note({
        title: "Mi Reunión",
        bodyMarkdown: "Notas de la reunión de trabajo",
        tags: ["trabajo", "reunión"]
      })
    })

    it("debería encontrar por título", () => {
      expect(note.matchesSearch("reunión")).toBe(true)
    })

    it("debería encontrar por body", () => {
      expect(note.matchesSearch("trabajo")).toBe(true)
    })

    it("debería encontrar por tag", () => {
      expect(note.matchesSearch("reunión")).toBe(true)
    })

    it("debería ser case insensitive", () => {
      expect(note.matchesSearch("MI REUNIÓN")).toBe(true)
      expect(note.matchesSearch("TRABAJO")).toBe(true)
    })

    it("debería retornar false cuando no hay match", () => {
      expect(note.matchesSearch("vacaciones")).toBe(false)
    })

    it("debería retornar true con query vacía", () => {
      expect(note.matchesSearch("")).toBe(true)
    })
  })

  describe("touch()", () => {
    it("debería actualizar updatedAt", () => {
      const note = new Note({ title: "T", updatedAt: 1000 })
      const before = Date.now()
      note.touch()
      expect(note.updatedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe("Note.validate()", () => {
    it("debería requerir título", () => {
      const errors = Note.validate({ title: "" })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("Title")
    })

    it("debería rechazar título con solo espacios", () => {
      const errors = Note.validate({ title: "   " })
      expect(errors.length).toBeGreaterThan(0)
    })

    it("debería aceptar nota válida", () => {
      const errors = Note.validate({ title: "Válida" })
      expect(errors).toHaveLength(0)
    })
  })

  describe("serialización round-trip", () => {
    it("debería conservar todos los campos via toJSON → fromJSON", () => {
      const original = new Note({
        title: "Test",
        bodyMarkdown: "## Hola\nMundo",
        tags: ["uno", "dos"],
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

    it("toJSON debería retornar un objeto plano", () => {
      const note = new Note({ title: "Test", tags: ["a"] })
      const json = note.toJSON()
      expect(json).not.toBeInstanceOf(Note)
      expect(Array.isArray(json.tags)).toBe(true)
    })
  })
})

describe("NotesModule", () => {
  let storage, eventBus, module

  beforeEach(() => {
    const store = {}
    storage = {
      get: vi.fn(key => store[key] || null),
      set: vi.fn((key, val) => {
        store[key] = val
      })
    }
    const listeners = {}
    eventBus = {
      on: vi.fn((event, cb) => {
        listeners[event] = listeners[event] || []
        listeners[event].push(cb)
      }),
      emit: vi.fn((event, data) => {
        ;(listeners[event] || []).forEach(cb => cb(data))
      })
    }
    module = new NotesModule(storage, eventBus, null)
    // init sin DOM: solo carga notas
    module.notes = []
    module.container = null
    module.modalContainer = null
  })

  describe("createNote()", () => {
    it("debería crear una nota y emitir note:created", () => {
      const note = module.createNote({
        title: "Mi nota",
        bodyMarkdown: "# Hola",
        tags: ["x"]
      })
      expect(note).toBeInstanceOf(Note)
      expect(note.title).toBe("Mi nota")
      expect(eventBus.emit).toHaveBeenCalledWith("note:created", note)
    })

    it("debería persistir en storage", () => {
      module.createNote({ title: "Test" })
      expect(storage.set).toHaveBeenCalledWith("notes", expect.any(Array))
    })

    it("debería lanzar error si falta título", () => {
      expect(() => module.createNote({ title: "" })).toThrow()
    })

    it("debería agregar la nota al inicio de la lista", () => {
      module.createNote({ title: "Primera" })
      module.createNote({ title: "Segunda" })
      expect(module.notes[0].title).toBe("Segunda")
    })
  })

  describe("deleteNote()", () => {
    it("debería eliminar la nota y emitir note:deleted", () => {
      const note = module.createNote({ title: "Para borrar" })
      module.deleteNote(note.id)
      expect(module.notes).toHaveLength(0)
      expect(eventBus.emit).toHaveBeenCalledWith("note:deleted", note)
    })

    it("debería lanzar error si la nota no existe", () => {
      expect(() => module.deleteNote("id-falso")).toThrow()
    })
  })

  describe("searchNotes()", () => {
    beforeEach(() => {
      module.createNote({
        title: "React hooks",
        bodyMarkdown: "Uso de useState",
        tags: ["frontend"]
      })
      module.createNote({
        title: "Node.js tips",
        bodyMarkdown: "Express middleware",
        tags: ["backend"]
      })
      module.createNote({
        title: "CSS Grid",
        bodyMarkdown: "Layout moderno",
        tags: ["frontend", "css"]
      })
    })

    it("debería filtrar por título", () => {
      const results = module.searchNotes("react")
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe("React hooks")
    })

    it("debería filtrar por body", () => {
      const results = module.searchNotes("middleware")
      expect(results).toHaveLength(1)
    })

    it("debería filtrar por tag", () => {
      const results = module.searchNotes("frontend")
      expect(results).toHaveLength(2)
    })

    it("debería ser case insensitive", () => {
      expect(module.searchNotes("CSS")).toHaveLength(1)
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

    afterEach(() => {
      modalRoot?.remove()
    })

    it("showCreateModal debería inicializar TagInput y procesar etiquetas", () => {
      module.showCreateModal()
      const widget = modalRoot.querySelector(".tag-input-widget")
      expect(widget).not.toBeNull()

      const input = modalRoot.querySelector(".tag-text-input")
      input.value = "nueva-tag"
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      )

      const form = modalRoot.querySelector("#create-note-form")
      form.querySelector('input[name="title"]').value = "Nota creada"
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )

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
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )

      expect(module.notes[0].title).toBe("Nota modificada")
      expect(module.notes[0].tags).toEqual(["existente"])
    })
  })

  describe("parseMarkdown()", () => {
    it("debería retornar cadena vacía si no hay texto", () => {
      expect(parseMarkdown("")).toBe("")
      expect(parseMarkdown(null)).toBe("")
    })

    it("debería renderizar encabezados h1 a h4", () => {
      expect(parseMarkdown("# Titulo 1")).toContain("<h1")
      expect(parseMarkdown("## Titulo 2")).toContain("<h2")
      expect(parseMarkdown("### Titulo 3")).toContain("<h3")
      expect(parseMarkdown("#### Titulo 4")).toContain("<h4")
    })

    it("debería renderizar bloques de código pre y código inline", () => {
      const codeBlock = parseMarkdown("```javascript\nconst x = 1\n```")
      expect(codeBlock).toContain("<pre")
      expect(codeBlock).toContain("<code")

      const inlineCode = parseMarkdown("Texto con `codigo` inline")
      expect(inlineCode).toContain("<code")
    })

    it("debería renderizar citas blockquote y líneas divisorias hr", () => {
      const bq = parseMarkdown("> Esta es una cita")
      expect(bq).toContain("<blockquote")

      const hr = parseMarkdown("---")
      expect(hr).toContain("<hr")
    })

    it("debería renderizar listas de tareas con checkboxes", () => {
      const taskList = parseMarkdown("- [ ] Tarea pendiente\n- [x] Tarea hecha")
      expect(taskList).toContain("list-none")
      expect(taskList).toContain("✓")
      expect(taskList).toContain("Tarea pendiente")
      expect(taskList).toContain("Tarea hecha")
    })

    it("debería renderizar viñetas y listas numeradas", () => {
      const ul = parseMarkdown("- Elemento A\n- Elemento B")
      expect(ul).toContain("<li")

      const ol = parseMarkdown("1. Primero\n2. Segundo")
      expect(ol).toContain("<li")
    })

    it("debería renderizar negrita, cursiva, tachado y enlaces", () => {
      const formatted = parseMarkdown(
        "**negrita** *cursiva* ~~tachado~~ [Link](https://ejemplo.com)"
      )
      expect(formatted).toContain("<strong")
      expect(formatted).toContain("<em")
      expect(formatted).toContain("<del")
      expect(formatted).toContain('<a href="https://ejemplo.com"')
    })
  })

  describe("Vista Previa y Modales", () => {
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

    afterEach(() => {
      modalRoot?.remove()
    })

    it("showPreviewModal debería renderizar modal con nota y botones de acción", () => {
      const note = module.createNote({
        title: "Nota de prueba",
        bodyMarkdown: "### Subtítulo\n- [x] Hecho",
        tags: ["prueba"]
      })

      module.showPreviewModal(note.id)

      expect(modalRoot.textContent).toContain("Nota de prueba")
      expect(modalRoot.querySelector("h3")).not.toBeNull()
      expect(modalRoot.textContent).toContain("✓")
      expect(modalRoot.textContent).toContain("Hecho")

      const editBtn = modalRoot.querySelector(
        '[data-action="open-edit-from-preview"]'
      )
      expect(editBtn).not.toBeNull()
      expect(editBtn.dataset.noteId).toBe(note.id)
    })

    it("al hacer click en editar desde la vista previa debería abrir el modal de edición", () => {
      const note = module.createNote({
        title: "Nota para editar",
        bodyMarkdown: "Texto",
        tags: []
      })
      const spyEdit = vi.spyOn(module, "showEditModal")

      module.showPreviewModal(note.id)
      const editBtn = modalRoot.querySelector(
        '[data-action="open-edit-from-preview"]'
      )
      editBtn.click()

      expect(spyEdit).toHaveBeenCalledWith(note.id)
    })

    it("al hacer click en eliminar desde la vista previa debería confirmar y borrar la nota", () => {
      const note = module.createNote({
        title: "Nota para borrar",
        bodyMarkdown: "Texto"
      })
      vi.spyOn(window, "confirm").mockReturnValue(true)

      module.showPreviewModal(note.id)
      const deleteBtn = modalRoot.querySelector(
        '[data-action="delete-note-from-preview"]'
      )
      deleteBtn.click()

      expect(module.notes).toHaveLength(0)
    })

    it("alternar pestañas en el editor debería cambiar entre textarea y vista previa", () => {
      module.showCreateModal()

      const form = modalRoot.querySelector("#create-note-form")
      const textarea = form.querySelector('[name="bodyMarkdown"]')
      const previewArea = form.querySelector("#note-preview-area")
      const previewBtn = form.querySelector('[data-note-tab="preview"]')
      const writeBtn = form.querySelector('[data-note-tab="write"]')

      textarea.value = "# Título Markdown"

      previewBtn.click()
      expect(textarea.classList.contains("hidden")).toBe(true)
      expect(previewArea.classList.contains("hidden")).toBe(false)
      expect(previewArea.innerHTML).toContain("<h1")

      writeBtn.click()
      expect(textarea.classList.contains("hidden")).toBe(false)
      expect(previewArea.classList.contains("hidden")).toBe(true)
    })
  })

  describe("Eventos de tarjeta de notas en container", () => {
    let container

    beforeEach(() => {
      container = document.createElement("div")
      container.id = "notes-list"
      document.body.appendChild(container)
      module.container = container
      module._bindEvents()
    })

    afterEach(() => {
      container?.remove()
    })

    it("hacer click en la tarjeta debería abrir showPreviewModal", () => {
      const note = module.createNote({ title: "Tarjeta Click" })
      module.render()

      const spyPreview = vi
        .spyOn(module, "showPreviewModal")
        .mockImplementation(() => {})
      const card = container.querySelector(`[data-note-id="${note.id}"]`)
      card.click()

      expect(spyPreview).toHaveBeenCalledWith(note.id)
    })

    it("hacer click en el botón editar de la tarjeta debería abrir showEditModal", () => {
      const note = module.createNote({ title: "Tarjeta Edit" })
      module.render()

      const spyEdit = vi
        .spyOn(module, "showEditModal")
        .mockImplementation(() => {})
      const editBtn = container.querySelector(
        `[data-action="edit-note"][data-note-id="${note.id}"]`
      )
      editBtn.click()

      expect(spyEdit).toHaveBeenCalledWith(note.id)
    })
  })
})
