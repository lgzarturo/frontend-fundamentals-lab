import { Note } from "./models.js"
import {
  createNoteModalTemplate,
  editNoteModalTemplate,
  emptyNotesTemplate,
  noteListTemplate,
  notePreviewTemplate,
  parseMarkdown
} from "./templates.js"
import { TagInput } from "../../components/tagInput.js"

export class NotesModule {
  constructor(storage, eventBus, i18n) {
    this.storage = storage
    this.eventBus = eventBus
    this.i18n = i18n
    this.notes = []
    this.container = null
    this.modalContainer = null
    this.activeTagInput = null
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

  getAllTags() {
    const tagsSet = new Set()
    this.notes.forEach(note => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach(t => t && tagsSet.add(t.trim()))
      }
    })
    try {
      const storedTasks = this.storage?.get("tasks")
      if (Array.isArray(storedTasks)) {
        storedTasks.forEach(task => {
          if (Array.isArray(task.tags)) {
            task.tags.forEach(t => t && tagsSet.add(t.trim()))
          }
        })
      }
    } catch {
      // Ignora errores si no hay almacenamiento
    }
    return Array.from(tagsSet).sort()
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
    const tagsContainer = document.getElementById("note-tags-input-container")
    let tagInputInstance = null

    if (tagsContainer) {
      tagInputInstance = new TagInput({
        container: tagsContainer,
        initialTags: [],
        availableTags: () => this.getAllTags(),
        name: "tags",
        i18n: this.i18n
      })
      this.activeTagInput = tagInputInstance
    }

    this._bindEditorTabs(form)

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      const tags = tagInputInstance
        ? tagInputInstance.getTags()
        : this._parseTags(formData.get("tags"))

      this.createNote({
        title: formData.get("title"),
        bodyMarkdown: formData.get("bodyMarkdown"),
        tags
      })
      tagInputInstance?.destroy()
      this.activeTagInput = null
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
    const tagsContainer = document.getElementById("note-tags-input-container")
    let tagInputInstance = null

    if (tagsContainer) {
      tagInputInstance = new TagInput({
        container: tagsContainer,
        initialTags: note.tags,
        availableTags: () => this.getAllTags(),
        name: "tags",
        i18n: this.i18n
      })
      this.activeTagInput = tagInputInstance
    }

    this._bindEditorTabs(form)

    form.addEventListener("submit", e => {
      e.preventDefault()
      const formData = new FormData(form)
      const tags = tagInputInstance
        ? tagInputInstance.getTags()
        : this._parseTags(formData.get("tags"))

      this.updateNote(noteId, {
        title: formData.get("title"),
        bodyMarkdown: formData.get("bodyMarkdown"),
        tags
      })
      tagInputInstance?.destroy()
      this.activeTagInput = null
      this.eventBus.emit("modal:close")
    })
  }

  _bindEditorTabs(form) {
    if (!form) return
    const writeBtn = form.querySelector('[data-note-tab="write"]')
    const previewBtn = form.querySelector('[data-note-tab="preview"]')
    const textarea = form.querySelector('[name="bodyMarkdown"]')
    const previewArea = form.querySelector("#note-preview-area")

    if (!previewBtn || !textarea || !previewArea) return

    const switchToWrite = () => {
      if (writeBtn) {
        writeBtn.classList.add(
          "active",
          "bg-white",
          "dark:bg-xp-card",
          "text-xp-primary",
          "shadow-sm"
        )
        writeBtn.classList.remove("text-gray-600", "dark:text-gray-400")
      }
      previewBtn.classList.remove(
        "active",
        "bg-white",
        "dark:bg-xp-card",
        "text-xp-primary",
        "shadow-sm"
      )
      previewBtn.classList.add("text-gray-600", "dark:text-gray-400")

      textarea.classList.remove("hidden")
      previewArea.classList.add("hidden")
    }

    const switchToPreview = () => {
      previewBtn.classList.add(
        "active",
        "bg-white",
        "dark:bg-xp-card",
        "text-xp-primary",
        "shadow-sm"
      )
      previewBtn.classList.remove("text-gray-600", "dark:text-gray-400")
      if (writeBtn) {
        writeBtn.classList.remove(
          "active",
          "bg-white",
          "dark:bg-xp-card",
          "text-xp-primary",
          "shadow-sm"
        )
        writeBtn.classList.add("text-gray-600", "dark:text-gray-400")
      }

      const parsed = parseMarkdown(textarea.value)
      const emptyMsg =
        this.i18n?.getMessage("app.screens.notes.preview.emptyContent") ||
        "Esta nota no tiene contenido aún."
      previewArea.innerHTML =
        parsed ||
        `<p class="italic text-gray-400 text-center py-4">${emptyMsg}</p>`

      textarea.classList.add("hidden")
      previewArea.classList.remove("hidden")
    }

    if (writeBtn) {
      writeBtn.addEventListener("click", switchToWrite)
    }
    previewBtn.addEventListener("click", () => {
      if (previewArea.classList.contains("hidden")) {
        switchToPreview()
      } else {
        switchToWrite()
      }
    })
  }

  showPreviewModal(noteId) {
    const note = this.notes.find(n => n.id === noteId)
    if (!note || !this.modalContainer) return

    this.eventBus.emit("modal:open", {
      contentHtml: notePreviewTemplate(note, this.i18n)
    })

    const modal = this.modalContainer
    const handlePreviewAction = e => {
      const editBtn = e.target.closest('[data-action="open-edit-from-preview"]')
      const deleteBtn = e.target.closest(
        '[data-action="delete-note-from-preview"]'
      )

      if (editBtn && editBtn.dataset.noteId === noteId) {
        modal.removeEventListener("click", handlePreviewAction)
        this.showEditModal(noteId)
      } else if (deleteBtn && deleteBtn.dataset.noteId === noteId) {
        if (
          confirm(
            this.i18n?.getMessage("ui.common.confirmDelete") ||
              "¿Eliminar esta nota?"
          )
        ) {
          modal.removeEventListener("click", handlePreviewAction)
          this.eventBus.emit("modal:close")
          this.deleteNote(noteId)
        }
      }
    }

    modal.addEventListener("click", handlePreviewAction)
  }

  _parseTags(raw) {
    if (Array.isArray(raw)) return raw
    if (!raw) return []
    return raw
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
  }

  /**
   * Recarga los datos desde el almacenamiento y re-renderiza
   * Útil tras importar/limpiar datos sin duplicar listeners
   */
  reload() {
    this._loadNotes()
    this.render()
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
      this.container.innerHTML = noteListTemplate(
        results,
        this.i18n,
        query?.trim()
      )
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
          case "edit-note":
            e.stopPropagation()
            this.showEditModal(noteId)
            break
          case "delete-note":
            e.stopPropagation()
            if (
              confirm(
                this.i18n?.getMessage("ui.common.confirmDelete") ||
                  "¿Eliminar esta nota?"
              )
            ) {
              this.deleteNote(noteId)
            }
            break
          case "view-note":
            this.showPreviewModal(noteId)
            break
        }
      })
    }
  }
}
