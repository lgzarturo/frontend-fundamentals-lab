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

const FENCE_LINE_CLASS =
  "bg-gray-100 dark:bg-xp-darker text-xp-primary px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-xp-primary/20 block my-0.5 overflow-x-auto"

/**
 * Detecta el tipo de bloque de una línea markdown.
 * @param {string} line - Línea markdown cruda
 * @returns {string} h1|h2|h3|h4|ul|ol|task|quote|hr|fence|p
 */
export function detectNoteBlockType(line) {
  if (/^```/.test(line)) return "fence"
  const heading = line.match(/^(#{1,4}) (.*)$/)
  if (heading) return `h${heading[1].length}`
  if (/^>\s?/.test(line)) return "quote"
  if (/^(---|\*\*\*|___)\s*$/.test(line)) return "hr"
  if (/^-\s*\[[ xX]\]\s*/.test(line)) return "task"
  if (/^[-*]\s+/.test(line)) return "ul"
  if (/^\d+\.\s+/.test(line)) return "ol"
  return "p"
}

/**
 * Renderiza una línea markdown reutilizando `parseMarkdown`, de modo que la
 * vista de edición y la vista guardada producen HTML idéntico.
 * @param {string} line - Línea markdown cruda
 * @param {boolean} inFence - La línea está dentro de un bloque de código
 * @returns {string} Fragmento HTML
 */
export function renderNoteLine(line, inFence = false) {
  if (inFence || line.startsWith("```")) {
    const code = inFence ? line : line.replace(/^```/, "")
    return `<div class="${FENCE_LINE_CLASS}">${escapeHtml(code) || "&nbsp;"}</div>`
  }
  if (!line.trim()) return "<div>&nbsp;</div>"
  return parseMarkdown(line)
}

const BLOCK_COMMANDS = [
  ["h1", "H1"],
  ["h2", "H2"],
  ["h3", "H3"],
  ["bold", "<strong>B</strong>"],
  ["italic", "<em>I</em>"],
  ["code", "<code>&lt;/&gt;</code>"],
  ["link", "🔗"],
  ["ul", "•"],
  ["ol", "1."],
  ["task", "☐"],
  ["quote", "“"]
]

/**
 * Shell del editor por líneas: barra de formato + contenedor + input oculto.
 * @param {Object} options
 * @param {string} [options.id] - Id del contenedor del editor
 * @param {string} [options.name] - Nombre del input oculto con el markdown
 * @param {string} [options.initialMarkdown] - Contenido inicial
 * @param {Object} [options.i18n] - Servicio i18n
 * @returns {string} Fragmento HTML
 */
export function blockEditorShellTemplate({
  id = "note-blocks-editor",
  name = "bodyMarkdown",
  initialMarkdown = "",
  i18n = null
} = {}) {
  const buttons = BLOCK_COMMANDS.map(([cmd, glyph]) => {
    const label =
      i18n?.getMessage(`app.screens.notes.editor.${cmd}`) || cmd
    return html`<button
      type="button"
      data-block-cmd="${cmd}"
      title="${label}"
      aria-label="${label}"
      class="note-tab-btn btn-compact shrink-0 px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-xp-primary transition-all"
    >
      ${raw(glyph)}
    </button>`
  }).join("")

  return html`
    <div
      class="be-toolbar sticky top-0 z-40 flex items-center gap-1 overflow-x-auto bg-gray-100 dark:bg-xp-darker p-0.5 rounded-lg border border-gray-200 dark:border-xp-primary/20 text-xs font-semibold mb-2"
    >
      ${raw(buttons)}
    </div>
    <div
      id="${id}"
      class="be-editor w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker text-gray-900 dark:text-gray-100 focus:outline-none focus:border-xp-primary text-sm min-h-[190px] leading-relaxed"
    ></div>
    <input type="hidden" name="${name}" value="${initialMarkdown}" />
  `
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
  const cancelLabel = i18n?.getMessage("ui.common.cancel") || "Cancelar"
  const createLabel =
    i18n?.getMessage("app.screens.notes.modal.create.create") || "Crear"

  return html`
    <div class="p-6 flex flex-col max-h-[85vh]">
      <div
        class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-xp-primary/20 shrink-0 mb-4"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl">📝</span>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${i18n?.getMessage("app.screens.notes.modal.create.title") || "Nueva Nota"}
          </h3>
        </div>
        <button
          type="button"
          data-action="close-modal"
          class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center text-lg shrink-0 cursor-pointer"
          aria-label="${cancelLabel}"
        >
          ✕
        </button>
      </div>

      <form id="create-note-form" class="flex flex-col flex-1 min-h-0">
        <div class="space-y-4 flex-1 overflow-y-auto min-h-0 pr-1 pb-1">
          <div>
            <label
              class="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
              ${i18n?.getMessage("app.screens.notes.modal.create.titleLabel") || "Título *"}
            </label>
            <input
              type="text"
              name="title"
              required
              class="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker text-gray-900 dark:text-gray-100 focus:outline-none focus:border-xp-primary transition-colors text-sm"
              placeholder="${i18n?.getMessage("app.screens.notes.modal.create.titlePlaceholder") || "Título de la nota"}"
            />
          </div>

          <div>
            <label
              class="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
              ${i18n?.getMessage("app.screens.notes.modal.create.content") || "Contenido (Markdown)"}
            </label>
            ${raw(blockEditorShellTemplate({ initialMarkdown: "", i18n }))}
          </div>

          <div>
            <label
              class="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
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

        <div
          class="flex gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 shrink-0"
        >
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-xp-darker dark:hover:bg-xp-darker/80 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-xp-primary/30 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
          >
            ${cancelLabel}
          </button>
          <button
            type="submit"
            class="flex-1 px-5 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-all text-sm shadow hover:shadow-md cursor-pointer"
          >
            ${createLabel}
          </button>
        </div>
      </form>
    </div>
  `
}

export function editNoteModalTemplate(note, i18n) {
  const cancelLabel = i18n?.getMessage("ui.common.cancel") || "Cancelar"
  const saveLabel =
    i18n?.getMessage("app.screens.notes.modal.edit.update") ||
    i18n?.getMessage("ui.common.save") ||
    "Guardar Cambios"

  return html`
    <div class="p-6 flex flex-col max-h-[85vh]">
      <div
        class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-xp-primary/20 shrink-0 mb-4"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl">✏️</span>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${i18n?.getMessage("app.screens.notes.modal.edit.title") || "Editar Nota"}
          </h3>
        </div>
        <button
          type="button"
          data-action="close-modal"
          class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center text-lg shrink-0 cursor-pointer"
          aria-label="${cancelLabel}"
        >
          ✕
        </button>
      </div>

      <form
        id="edit-note-form"
        data-note-id="${note.id}"
        class="flex flex-col flex-1 min-h-0"
      >
        <div class="space-y-4 flex-1 overflow-y-auto min-h-0 pr-1 pb-1">
          <div>
            <label
              class="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
              ${i18n?.getMessage("app.screens.notes.modal.create.titleLabel") || "Título *"}
            </label>
            <input
              type="text"
              name="title"
              required
              value="${note.title}"
              class="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker text-gray-900 dark:text-gray-100 focus:outline-none focus:border-xp-primary transition-colors text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
              ${i18n?.getMessage("app.screens.notes.modal.create.content") || "Contenido (Markdown)"}
            </label>
            ${raw(
              blockEditorShellTemplate({
                initialMarkdown: note.bodyMarkdown,
                i18n
              })
            )}
          </div>

          <div>
            <label
              class="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
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

        <div
          class="flex gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 shrink-0"
        >
          <button
            type="button"
            data-action="close-modal"
            class="flex-1 px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-xp-darker dark:hover:bg-xp-darker/80 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-xp-primary/30 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
          >
            ${cancelLabel}
          </button>
          <button
            type="submit"
            class="flex-1 px-5 py-3 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-all text-sm shadow hover:shadow-md cursor-pointer"
          >
            ${saveLabel}
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
    <div class="p-6 flex flex-col max-h-[85vh]">
      <div
        class="flex items-start justify-between gap-3 pb-4 border-b border-gray-200 dark:border-xp-primary/20 shrink-0"
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
          class="btn-icon w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center text-lg shrink-0 cursor-pointer"
          aria-label="${closeLabel}"
        >
          ✕
        </button>
      </div>

      <div
        class="note-preview-body prose prose-sm dark:prose-invert max-w-none my-4 p-5 bg-gray-50 dark:bg-xp-darker rounded-xl border border-gray-200 dark:border-xp-primary/20 flex-1 overflow-y-auto min-h-[140px] leading-relaxed text-gray-800 dark:text-gray-200"
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
        class="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0"
      >
        <button
          type="button"
          data-action="delete-note-from-preview"
          data-note-id="${note.id}"
          class="px-4 py-2.5 bg-xp-danger/10 hover:bg-xp-danger/20 text-xp-danger border border-xp-danger/30 rounded-lg transition-colors text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <span>🗑️</span>
          <span>${deleteLabel}</span>
        </button>

        <div class="flex items-center gap-3">
          <button
            type="button"
            data-action="close-modal"
            class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-xp-darker dark:hover:bg-xp-darker/80 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-xp-primary/30 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            ${closeLabel}
          </button>
          <button
            type="button"
            data-action="open-edit-from-preview"
            data-note-id="${note.id}"
            class="px-6 py-2.5 bg-xp-primary hover:bg-xp-primary/80 text-xp-darker font-bold rounded-lg transition-all text-sm inline-flex items-center gap-2 shadow hover:shadow-md cursor-pointer"
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
