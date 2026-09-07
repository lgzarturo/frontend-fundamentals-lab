import { Note } from "./models.js"
import {
  createNoteModalTemplate,
  editNoteModalTemplate,
  emptyNotesTemplate,
  noteListTemplate,
  notePreviewTemplate,
  parseMarkdown
} from "./templates.js"

export class NotesModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.notes = []
    this.container = null
    this.modalContainer = null
  }

  init() {
    this._loadNotes()
    this.container = document.getElementById("notes-list")
    this.modalContainer = document.getElementById("modal-content")
    this._bindEvents()
  }

  render() {
    if (!this.container) return

    if (this.notes.length === 0) {
      this.container.innerHTML = emptyNotesTemplate(this.i18n)
      return
    }

    this.container.innerHTML = noteListTemplate(this.notes, this.i18n)
  }

  createNote(data) {
    const errors = Note.validate(data)
    if (errors.length) throw new Error(errors.join(", "))

    const note = new Note({
      title: data.title,
      bodyMarkdown: data.bodyMarkdown || "",
      tags: this._parseTags(data.tags)
    })

    this.notes.unshift(note)
    this._saveNotes()
    this.render()
    this.eventBus.emit("note:created", note)
    return note
  }

  updateNote(noteId, data) {
    const note = this.notes.find(n => n.id === noteId)
    if (!note) throw new Error(`Note not found: ${noteId}`)

    if (data.title !== undefined) note.title = data.title
    if (data.bodyMarkdown !== undefined) note.bodyMarkdown = data.bodyMarkdown
    if (data.tags !== undefined) note.tags = this._parseTags(data.tags)
    note.touch()

    this._saveNotes()
    this.render()
    this.eventBus.emit("note:updated", note)
    return note
  }

  deleteNote(noteId) {
    const index = this.notes.findIndex(n => n.id === noteId)
    if (index === -1) throw new Error(`Note not found: ${noteId}`)

    const deleted = this.notes.splice(index, 1)[0]
    this._saveNotes()
    this.render()
    this.eventBus.emit("undo:show", {
      message: `${this.i18n?.getMessage("ui.common.deleted")} "${deleted.title}"`,
      undoCallback: () => {
        this.notes.splice(index, 0, deleted)
        this._saveNotes()
        this.render()
      }
    })
    this.eventBus.emit("note:deleted", deleted)
    return deleted
  }

  searchNotes(query) {
    return this.notes.filter(n => n.matchesSearch(query))
  }

  showCreateModal() {
    if (!this.modalContainer) return
    this.eventBus.emit("modal:open", {
      contentHtml: createNoteModalTemplate(this.i18n)
    })

    const form = document.getElementById("create-note-form")

    form
      .querySelector('[data-action="preview-note"]')
      .addEventListener("click", () => {
        const body = form.querySelector('[name="bodyMarkdown"]').value
        const previewArea = document.getElementById("note-preview-area")
        previewArea.innerHTML = parseMarkdown(body)
        previewArea.classList.toggle("hidden")
      })

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      this.createNote({
        title: formData.get("title"),
        bodyMarkdown: formData.get("bodyMarkdown"),
        tags: formData.get("tags")
      })
      this.eventBus.emit("modal:close")
    })
  }

  showEditModal(noteId) {
    const note = this.notes.find(n => n.id === noteId)
    if (!note || !this.modalContainer) return

    this.eventBus.emit("modal:open", {
      contentHtml: editNoteModalTemplate(note, this.i18n)
    })

    const form = document.getElementById("edit-note-form")

    form
      .querySelector('[data-action="preview-note"]')
      .addEventListener("click", () => {
        const body = form.querySelector('[name="bodyMarkdown"]').value
        const previewArea = document.getElementById("note-preview-area")
        previewArea.innerHTML = parseMarkdown(body)
        previewArea.classList.toggle("hidden")
      })

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      this.updateNote(noteId, {
        title: formData.get("title"),
        bodyMarkdown: formData.get("bodyMarkdown"),
        tags: formData.get("tags")
      })
      this.eventBus.emit("modal:close")
    })
  }

  showPreviewModal(noteId) {
    const note = this.notes.find(n => n.id === noteId)
    if (!note || !this.modalContainer) return

    this.eventBus.emit("modal:open", {
      contentHtml: notePreviewTemplate(note)
    })
  }

  _parseTags(raw) {
    if (Array.isArray(raw)) return raw
    if (!raw) return []
    return raw
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
  }

  _loadNotes() {
    const data = this.storage.get("notes")
    if (data && Array.isArray(data)) {
      this.notes = data.map(n => Note.fromJSON(n))
    }
  }

  _saveNotes() {
    this.storage.set(
      "notes",
      this.notes.map(n => n.toJSON())
    )
  }

  _bindEvents() {
    this.eventBus.on("note:create", () => this.showCreateModal())
    this.eventBus.on("note:update", noteId => this.showEditModal(noteId))
    this.eventBus.on("note:delete", noteId => this.deleteNote(noteId))
    this.eventBus.on("note:search", query => {
      if (!this.container) return
      const results = this.searchNotes(query)
      this.container.innerHTML = noteListTemplate(results, this.i18n)
    })

    if (this.container) {
      this.container.addEventListener("click", e => {
        const target = e.target.closest("[data-action]")
        if (!target) return

        const action = target.dataset.action
        const noteId = target.dataset.noteId

        switch (action) {
          case "create-note":
            this.showCreateModal()
            break
          case "view-note":
            this.showEditModal(noteId)
            break
          case "delete-note":
            if (
              confirm(
                this.i18n?.getMessage("ui.common.confirmDelete") ||
                  "¿Eliminar esta nota?"
              )
            ) {
              this.deleteNote(noteId)
            }
            break
        }
      })
    }
  }
}
