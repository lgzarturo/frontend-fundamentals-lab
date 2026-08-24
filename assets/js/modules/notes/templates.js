import { escapeHtml } from "../../utils/html.js"
import { getRelativeTime } from "../../utils/date.js"

export function html(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i]
    if (value === undefined || value === null) {
      return result + string
    }
    if (typeof value === "string") {
      return result + string + escapeHtml(value)
    }
    return result + string + String(value)
  }, "")
}

export function parseMarkdown(markdown) {
  return markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/`(.*?)`/gim, "<code>$1</code>")
    .replace(/\n/gim, "<br>")
}

export function noteCardTemplate(note, i18n) {
  const preview = note.getPreview(100)
  const tagsHtml = note.tags.length
    ? note.tags
        .map(
          tag =>
            html`<span
              class="px-2 py-0.5 text-xs rounded-full bg-xp-primary/20 text-xp-primary"
              >${tag}</span
            >`
        )
        .join("")
    : ""
  const relativeTime = getRelativeTime(note.updatedAt, i18n)

  return html`
    <div
      class="bg-white dark:bg-xp-card rounded-xl p-5 border-2 border-gray-200 dark:border-xp-primary/20 flex flex-col gap-3 cursor-pointer hover:border-xp-primary transition-colors"
      data-action="view-note"
      data-note-id="${note.id}"
    >
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-bold text-base leading-snug">${note.title}</h3>
        <button
          data-action="delete-note"
          data-note-id="${note.id}"
          class="text-gray-400 hover:text-xp-danger transition-colors shrink-0"
          aria-label="Eliminar nota"
        >
          &#x2715;
        </button>
      </div>
      ${preview ? html`<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">${preview}</p>` : ""}
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex flex-wrap gap-1">${tagsHtml}</div>
        <span class="text-xs text-gray-500">${relativeTime}</span>
      </div>
    </div>
  `
}

export function noteListTemplate(notes, i18n) {
  if (!notes.length) return emptyNotesTemplate(i18n)
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${notes.map(note => noteCardTemplate(note, i18n)).join("")}
    </div>
  `
}

export function createNoteModalTemplate(i18n) {
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.notes.modal.create.title") || "Nueva Nota"}
      </h3>
      <form id="create-note-form">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.notes.modal.create.titleLabel") || "Título *"}
            </label>
            <input
              type="text"
              name="title"
              required
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="${i18n?.getMessage("app.screens.notes.modal.create.titlePlaceholder") || "Título de la nota"}"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.notes.modal.create.content") || "Contenido (Markdown)"}
            </label>
            <textarea
              name="bodyMarkdown"
              rows="8"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary font-mono text-sm resize-y"
              placeholder="# Mi nota&#10;&#10;Escribe en **Markdown**..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.notes.modal.create.tags") || "Etiquetas (separadas por coma)"}
            </label>
            <input
              type="text"
              name="tags"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
              placeholder="trabajo, personal, ideas"
            />
          </div>
          <div>
            <button
              type="button"
              data-action="preview-note"
              class="px-4 py-2 bg-xp-secondary/20 text-xp-secondary rounded-lg hover:bg-xp-secondary/30 transition-colors text-sm"
            >
              ${i18n?.getMessage("app.screens.notes.modal.create.preview") || "Preview"}
            </button>
          </div>
          <div
            id="note-preview-area"
            class="hidden prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-xp-darker rounded-lg border border-gray-200 dark:border-xp-primary/20"
          ></div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("ui.common.cancel") || "Cancelar"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("app.screens.notes.modal.create.create") || "Crear"}
          </button>
        </div>
      </form>
    </div>
  `
}

export function editNoteModalTemplate(note, i18n) {
  const tagsValue = note.tags.join(", ")
  return html`
    <div class="p-6">
      <h3 class="text-2xl font-bold mb-4">
        ${i18n?.getMessage("app.screens.notes.modal.edit.title") || "Editar Nota"}
      </h3>
      <form id="edit-note-form" data-note-id="${note.id}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.notes.modal.create.titleLabel") || "Título *"}
            </label>
            <input
              type="text"
              name="title"
              required
              value="${note.title}"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.notes.modal.create.content") || "Contenido (Markdown)"}
            </label>
            <textarea
              name="bodyMarkdown"
              rows="8"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary font-mono text-sm resize-y"
            >
${note.bodyMarkdown}</textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">
              ${i18n?.getMessage("app.screens.notes.modal.create.tags") || "Etiquetas (separadas por coma)"}
            </label>
            <input
              type="text"
              name="tags"
              value="${tagsValue}"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary"
            />
          </div>
          <div>
            <button
              type="button"
              data-action="preview-note"
              class="px-4 py-2 bg-xp-secondary/20 text-xp-secondary rounded-lg hover:bg-xp-secondary/30 transition-colors text-sm"
            >
              ${i18n?.getMessage("app.screens.notes.modal.create.preview") || "Preview"}
            </button>
          </div>
          <div
            id="note-preview-area"
            class="hidden prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-xp-darker rounded-lg border border-gray-200 dark:border-xp-primary/20"
          ></div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors"
          >
            ${i18n?.getMessage("ui.common.cancel") || "Cancelar"}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors"
          >
            ${i18n?.getMessage("ui.common.save") || "Guardar"}
          </button>
        </div>
      </form>
    </div>
  `
}

export function notePreviewTemplate(note) {
  const parsedBody = parseMarkdown(note.bodyMarkdown)
  return `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">${escapeHtml(note.title)}</h2>
      <div class="prose prose-sm dark:prose-invert max-w-none">${parsedBody}</div>
    </div>
  `
}

export function emptyNotesTemplate(i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">&#x1F4DD;</div>
      <h3 class="text-xl font-bold mb-2">
        ${i18n?.getMessage("app.screens.notes.empty.title") || "¡No hay notas aún!"}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        ${i18n?.getMessage("app.screens.notes.empty.description") || "Crea tu primera nota para empezar a organizar tus ideas."}
      </p>
      <button
        data-action="create-note"
        class="px-6 py-3 bg-xp-primary text-xp-darker font-bold rounded-lg hover:bg-xp-primary/80 transition-colors"
      >
        ${i18n?.getMessage("app.screens.notes.empty.action") || "Crear Nota"}
      </button>
    </div>
  `
}
