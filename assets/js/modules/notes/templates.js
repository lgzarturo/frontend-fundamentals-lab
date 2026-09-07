import { escapeHtml, html, raw } from "../../utils/html.js"
import { getRelativeTime } from "../../utils/date.js"
import { tagInputTemplate } from "../../components/tagInput.js"

export { html, raw }

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
  const preview = note.getPreview(120)
  const tagsHtml = note.tags.length
    ? note.tags
        .map(
          tag =>
            html`<span
              class="px-2.5 py-0.5 text-xs rounded-full bg-xp-primary/20 text-xp-primary font-medium"
              >#${tag}</span
            >`
        )
        .join("")
    : ""
  const relativeTime = getRelativeTime(note.updatedAt, i18n)
  const deleteLabel = i18n?.getMessage("ui.common.delete") || "Eliminar"

  return html`
    <div
      class="group relative bg-white dark:bg-xp-card rounded-xl p-5 border-2 border-gray-200 dark:border-xp-primary/20 flex flex-col justify-between hover:border-xp-primary hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[160px]"
      data-action="view-note"
      data-note-id="${note.id}"
    >
      <div>
        <div class="flex items-start justify-between gap-3 mb-2">
          <h3
            class="font-bold text-base md:text-lg leading-snug text-gray-900 dark:text-gray-100 group-hover:text-xp-primary transition-colors break-words flex-1"
          >
            ${note.title}
          </h3>
          <button
            type="button"
            data-action="delete-note"
            data-note-id="${note.id}"
            class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-xp-danger hover:bg-xp-danger/10 transition-colors flex items-center justify-center shrink-0 text-sm"
            aria-label="${deleteLabel} nota"
            title="${deleteLabel}"
          >
            &#x2715;
          </button>
        </div>
        ${
          preview
            ? raw(
                html`<p
                  class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4 break-words"
                >
                  ${preview}
                </p>`
              )
            : ""
        }
      </div>
      <div
        class="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800/60 mt-auto flex-wrap"
      >
        <div class="flex flex-wrap gap-1 max-w-[70%]">${raw(tagsHtml)}</div>
        <span class="text-xs text-gray-500 whitespace-nowrap">${relativeTime}</span>
      </div>
    </div>
  `
}

export function emptySearchNotesTemplate(query, i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-5xl mb-3">🔍</div>
      <h3 class="text-lg font-bold mb-1">
        ${i18n?.getMessage("app.screens.notes.searchEmptyTitle", "Sin resultados") || "Sin resultados"}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        ${i18n?.getMessage("app.screens.notes.searchEmptyDescription", "No se encontraron notas que coincidan con la búsqueda.") || "No se encontraron notas que coincidan con la búsqueda."}
      </p>
    </div>
  `
}

export function noteListTemplate(notes, i18n, query = "") {
  if (!notes.length) {
    if (query) {
      return emptySearchNotesTemplate(query, i18n)
    }
    return emptyNotesTemplate(i18n)
  }
  const cards = notes.map(note => noteCardTemplate(note, i18n)).join("")
  return html`
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${raw(cards)}
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
              ${i18n?.getMessage("app.screens.notes.modal.create.tags") || "Etiquetas"}
            </label>
            <div id="note-tags-input-container">
              ${raw(
                tagInputTemplate({
                  id: "note-tags-widget",
                  name: "tags",
                  initialTags: [],
                  i18n
                })
              )}
            </div>
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
              ${i18n?.getMessage("app.screens.notes.modal.create.tags") || "Etiquetas"}
            </label>
            <div id="note-tags-input-container">
              ${raw(
                tagInputTemplate({
                  id: "note-tags-widget",
                  name: "tags",
                  initialTags: note.tags,
                  i18n
                })
              )}
            </div>
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
  return html`
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">${note.title}</h2>
      <div class="prose prose-sm dark:prose-invert max-w-none">
        ${raw(parsedBody)}
      </div>
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

