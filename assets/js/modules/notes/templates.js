import { escapeHtml, html, raw } from "../../utils/html.js"
import { getRelativeTime } from "../../utils/date.js"
import { tagInputTemplate } from "../../components/tagInput.js"

export { html, raw }

/**
 * Parsea texto con formato Markdown a HTML seguro y estilizado.
 * Soporta encabezados, código, listas, tareas, citas, enlaces y énfasis.
 * @param {string} markdown - Texto en formato Markdown
 * @returns {string} Fragmento HTML
 */
export function parseMarkdown(markdown) {
  if (!markdown || typeof markdown !== "string") return ""

  // Escapar HTML primero para evitar inyecciones XSS
  let text = escapeHtml(markdown)

  // 1. Bloques de código ```lang\ncode\n```
  text = text.replace(
    /```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g,
    '<pre class="bg-gray-100 dark:bg-xp-darker p-3 rounded-lg overflow-x-auto text-xs font-mono my-2 border border-gray-200 dark:border-xp-primary/20"><code>$1</code></pre>'
  )

  // 2. Código inline `code`
  text = text.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 dark:bg-xp-darker text-xp-primary px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-xp-primary/20">$1</code>'
  )

  // 3. Encabezados (#, ##, ###, ####)
  text = text.replace(
    /^#### (.*$)/gim,
    '<h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-1">$1</h4>'
  )
  text = text.replace(
    /^### (.*$)/gim,
    '<h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-3 mb-1.5">$1</h3>'
  )
  text = text.replace(
    /^## (.*$)/gim,
    '<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h2>'
  )
  text = text.replace(
    /^# (.*$)/gim,
    '<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h1>'
  )

  // 4. Citas (> texto o &gt; texto)
  text = text.replace(
    /^(?:>|&gt;)\s*(.*$)/gim,
    '<blockquote class="border-l-4 border-xp-primary pl-3 py-1 my-2 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-xp-darker/40 rounded-r">$1</blockquote>'
  )

  // 5. Línea divisoria horizontal (--- o ***)
  text = text.replace(
    /^(?:---|\*\*\*|___)\s*$/gim,
    '<hr class="my-4 border-gray-200 dark:border-xp-primary/20" />'
  )

  // 6. Listas de tareas (- [ ] y - [x])
  text = text.replace(
    /^\s*-\s*\[([ xX])\]\s*(.*$)/gim,
    (match, checked, itemText) => {
      const isDone = checked.toLowerCase() === "x"
      if (isDone) {
        return `<li class="flex items-center gap-2 list-none my-1 line-through text-gray-400"><span class="w-4 h-4 rounded bg-xp-primary text-xp-darker flex items-center justify-center text-[10px] font-bold">✓</span><span>${itemText}</span></li>`
      }
      return `<li class="flex items-center gap-2 list-none my-1 text-gray-700 dark:text-gray-300"><span class="w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-600 flex items-center justify-center text-[10px]"></span><span>${itemText}</span></li>`
    }
  )

  // 7. Listas no ordenadas (- item o * item)
  text = text.replace(
    /^\s*[-*]\s+(.*$)/gim,
    '<li class="ml-4 list-disc my-0.5 text-gray-700 dark:text-gray-300">$1</li>'
  )

  // 8. Listas ordenadas (1. item)
  text = text.replace(
    /^\s*(\d+)\.\s+(.*$)/gim,
    '<li class="ml-4 list-decimal my-0.5 text-gray-700 dark:text-gray-300">$2</li>'
  )

  // 9. Formato de texto: negrita, tachado, cursiva
  text = text.replace(
    /\*\*(.*?)\*\*/gim,
    '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>'
  )
  text = text.replace(
    /~~(.*?)~~/gim,
    '<del class="line-through text-gray-400">$1</del>'
  )
  text = text.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
  text = text.replace(/_([^_]+)_/gim, '<em class="italic">$1</em>')

  // 10. Enlaces [texto](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-xp-primary underline hover:text-xp-primary/80 transition-colors">$1</a>'
  )

  // 11. Saltos de línea (respetando bloques <pre>)
  const parts = text.split(/(<pre[\s\S]*?<\/pre>)/g)
  return parts
    .map(part => {
      if (part.startsWith("<pre")) return part
      return part.replace(/\n/g, "<br>")
    })
    .join("")
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
  const editLabel = i18n?.getMessage("ui.common.edit") || "Editar"

  return html`
    <div
      class="group relative bg-white dark:bg-xp-card rounded-xl p-5 border-2 border-gray-200 dark:border-xp-primary/20 flex flex-col justify-between hover:border-xp-primary hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[160px]"
      data-action="view-note"
      data-note-id="${note.id}"
    >
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3
            class="font-bold text-base md:text-lg leading-snug text-gray-900 dark:text-gray-100 group-hover:text-xp-primary transition-colors break-words flex-1 pr-1"
          >
            ${note.title}
          </h3>
          <div class="flex items-center gap-1 shrink-0">
            <button
              type="button"
              data-action="edit-note"
              data-note-id="${note.id}"
              class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-xp-primary hover:bg-xp-primary/10 transition-colors flex items-center justify-center text-sm"
              aria-label="${editLabel} nota"
              title="${editLabel}"
            >
              ✏️
            </button>
            <button
              type="button"
              data-action="delete-note"
              data-note-id="${note.id}"
              class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-xp-danger hover:bg-xp-danger/10 transition-colors flex items-center justify-center text-sm"
              aria-label="${deleteLabel} nota"
              title="${deleteLabel}"
            >
              &#x2715;
            </button>
          </div>
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
            : raw(
                html`<p
                  class="text-sm italic text-gray-400 dark:text-gray-500 line-clamp-2 mb-4 break-words"
                >
                  ${
                    i18n?.getMessage("app.screens.notes.noContent") ||
                    "Sin contenido adicional"
                  }
                </p>`
              )
        }
      </div>
      <div
        class="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800/60 mt-auto flex-wrap"
      >
        <div class="flex flex-wrap gap-1 max-w-[70%]">${raw(tagsHtml)}</div>
        <span class="text-xs text-gray-500 whitespace-nowrap"
          >${relativeTime}</span
        >
      </div>
    </div>
  `
}

export function emptySearchNotesTemplate(query, i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-5xl mb-3">🔍</div>
      <h3 class="text-lg font-bold mb-1">
        ${
          i18n?.getMessage(
            "app.screens.notes.searchEmptyTitle",
            "Sin resultados"
          ) || "Sin resultados"
        }
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        ${
          i18n?.getMessage(
            "app.screens.notes.searchEmptyDescription",
            "No se encontraron notas que coincidan con la búsqueda."
          ) || "No se encontraron notas que coincidan con la búsqueda."
        }
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
  const writeLabel =
    i18n?.getMessage("app.screens.notes.preview.tabWrite") || "Escribir"
  const previewLabel =
    i18n?.getMessage("app.screens.notes.preview.tabPreview") || "Vista Previa"

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
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold">
                ${i18n?.getMessage("app.screens.notes.modal.create.content") || "Contenido (Markdown)"}
              </label>
              <div
                class="flex items-center gap-1 bg-gray-100 dark:bg-xp-darker p-0.5 rounded-lg border border-gray-200 dark:border-xp-primary/20 text-xs font-semibold"
              >
                <button
                  type="button"
                  data-note-tab="write"
                  class="note-tab-btn active px-2.5 py-1 rounded-md bg-white dark:bg-xp-card text-xp-primary shadow-sm transition-all"
                >
                  ✏️ ${writeLabel}
                </button>
                <button
                  type="button"
                  data-note-tab="preview"
                  data-action="preview-note"
                  class="note-tab-btn px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-xp-primary transition-all"
                >
                  👁️ ${previewLabel}
                </button>
              </div>
            </div>
            <textarea
              name="bodyMarkdown"
              id="note-body-markdown-input"
              rows="8"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary font-mono text-sm resize-y"
              placeholder="# Mi nota&#10;&#10;Escribe en **Markdown**..."
            ></textarea>
            <div
              id="note-preview-area"
              class="hidden prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-xp-darker rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 min-h-[190px] max-h-[350px] overflow-y-auto leading-relaxed"
            ></div>
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
  const writeLabel =
    i18n?.getMessage("app.screens.notes.preview.tabWrite") || "Escribir"
  const previewLabel =
    i18n?.getMessage("app.screens.notes.preview.tabPreview") || "Vista Previa"

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
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold">
                ${i18n?.getMessage("app.screens.notes.modal.create.content") || "Contenido (Markdown)"}
              </label>
              <div
                class="flex items-center gap-1 bg-gray-100 dark:bg-xp-darker p-0.5 rounded-lg border border-gray-200 dark:border-xp-primary/20 text-xs font-semibold"
              >
                <button
                  type="button"
                  data-note-tab="write"
                  class="note-tab-btn active px-2.5 py-1 rounded-md bg-white dark:bg-xp-card text-xp-primary shadow-sm transition-all"
                >
                  ✏️ ${writeLabel}
                </button>
                <button
                  type="button"
                  data-note-tab="preview"
                  data-action="preview-note"
                  class="note-tab-btn px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-xp-primary transition-all"
                >
                  👁️ ${previewLabel}
                </button>
              </div>
            </div>
            <textarea
              name="bodyMarkdown"
              id="note-body-markdown-input"
              rows="8"
              class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus:outline-none focus:border-xp-primary font-mono text-sm resize-y"
            >
${note.bodyMarkdown}</textarea>
            <div
              id="note-preview-area"
              class="hidden prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-xp-darker rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 min-h-[190px] max-h-[350px] overflow-y-auto leading-relaxed"
            ></div>
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

export function notePreviewTemplate(note, i18n = null) {
  const parsedBody = parseMarkdown(note.bodyMarkdown)
  const relativeTime = getRelativeTime(note.updatedAt, i18n)
  const editLabel =
    i18n?.getMessage("app.screens.notes.preview.edit") || "Editar Nota"
  const closeLabel =
    i18n?.getMessage("app.screens.notes.preview.close") || "Cerrar"
  const deleteLabel = i18n?.getMessage("ui.common.delete") || "Eliminar"
  const emptyContentLabel =
    i18n?.getMessage("app.screens.notes.preview.emptyContent") ||
    "Esta nota no tiene contenido aún."

  const tagsHtml = (note.tags || []).length
    ? note.tags
        .map(
          tag =>
            `<span class="px-2.5 py-0.5 text-xs rounded-full bg-xp-primary/20 text-xp-primary font-medium">#${escapeHtml(tag)}</span>`
        )
        .join("")
    : ""

  return html`
    <div class="p-6">
      <div
        class="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-xp-primary/20"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">📝</span>
            <h2
              class="text-2xl font-bold text-gray-900 dark:text-gray-100 break-words"
            >
              ${note.title}
            </h2>
          </div>
          <div
            class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2 flex-wrap"
          >
            <span class="inline-flex items-center gap-1">
              <span>🕒</span>
              <span>${relativeTime}</span>
            </span>
            ${raw(tagsHtml ? `<div class="flex flex-wrap gap-1">${tagsHtml}</div>` : "")}
          </div>
        </div>
        <button
          type="button"
          data-action="close-modal"
          class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center text-lg shrink-0"
          aria-label="${closeLabel}"
        >
          ✕
        </button>
      </div>

      <div
        class="note-preview-body prose prose-sm dark:prose-invert max-w-none p-5 bg-gray-50 dark:bg-xp-darker rounded-xl border border-gray-200 dark:border-xp-primary/20 min-h-[140px] max-h-[55vh] overflow-y-auto leading-relaxed text-gray-800 dark:text-gray-200"
      >
        ${
          parsedBody
            ? raw(parsedBody)
            : raw(
                `<p class="italic text-gray-400 text-center py-6">${emptyContentLabel}</p>`
              )
        }
      </div>

      <div
        class="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800"
      >
        <button
          type="button"
          data-action="delete-note-from-preview"
          data-note-id="${note.id}"
          class="px-4 py-2.5 text-xp-danger hover:bg-xp-danger/10 rounded-lg transition-colors text-sm font-semibold inline-flex items-center gap-1.5"
        >
          <span>🗑️</span>
          <span>${deleteLabel}</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            data-action="close-modal"
            class="px-4 py-2.5 bg-gray-200 dark:bg-xp-darker rounded-lg hover:bg-gray-300 dark:hover:bg-xp-darker/80 transition-colors text-sm font-semibold"
          >
            ${closeLabel}
          </button>
          <button
            type="button"
            data-action="open-edit-from-preview"
            data-note-id="${note.id}"
            class="px-5 py-2.5 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-colors text-sm inline-flex items-center gap-1.5 shadow"
          >
            <span>✏️</span>
            <span>${editLabel}</span>
          </button>
        </div>
      </div>
    </div>
  `
}

export function emptyNotesTemplate(i18n) {
  return html`
    <div class="col-span-full text-center py-12">
      <div class="text-6xl mb-4">&#x1F4DD;</div>
      <h3 class="text-xl font-bold mb-2">
        ${
          i18n?.getMessage("app.screens.notes.empty.title") ||
          "¡No hay notas aún!"
        }
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        ${
          i18n?.getMessage("app.screens.notes.empty.description") ||
          "Crea tu primera nota para empezar a organizar tus ideas."
        }
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
