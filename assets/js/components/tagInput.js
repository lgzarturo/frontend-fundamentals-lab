/**
 * Componente reutilizable para gestión de etiquetas con autocompletado,
 * chips individuales y eliminación sencilla.
 */
import { escapeHtml } from "../utils/html.js"

export function tagInputTemplate({
  id = "tag-input-container",
  name = "tags",
  initialTags = [],
  placeholder = "",
  i18n = null
} = {}) {
  const cleanTags = Array.isArray(initialTags)
    ? [...new Set(initialTags.map(t => String(t).trim()).filter(Boolean))]
    : []

  const chipsHtml = cleanTags
    .map(
      tag => `
      <span
        class="tag-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-xp-primary/20 text-xp-primary border border-xp-primary/30 dark:border-xp-primary/40 transition-colors"
        data-tag="${escapeHtml(tag)}"
      >
        <span># ${escapeHtml(tag)}</span>
        <button
          type="button"
          class="btn-compact remove-tag-btn w-4 h-4 rounded-full flex items-center justify-center text-xp-primary hover:text-white hover:bg-xp-danger transition-colors text-[10px]"
          data-tag="${escapeHtml(tag)}"
          aria-label="${i18n?.getMessage("ui.tags.remove", { tag }) || `Eliminar ${tag}`}"
        >
          &#x2715;
        </button>
      </span>`
    )
    .join("")

  const ph =
    placeholder ||
    i18n?.getMessage("ui.tags.placeholder") ||
    "Escribe una etiqueta y presiona Enter..."
  const addText = i18n?.getMessage("ui.tags.add") || "Agregar"

  return `
    <div id="${id}" class="tag-input-widget relative w-full">
      <div class="tag-input-box flex flex-wrap items-center gap-1.5 min-h-[44px] p-2 rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker focus-within:border-xp-primary transition-colors">
        <div class="tag-chips-container flex flex-wrap items-center gap-1.5">
          ${chipsHtml}
        </div>
        <div class="flex items-center gap-1 flex-1 min-w-[140px]">
          <input
            type="text"
            class="tag-text-input flex-1 bg-transparent border-0 focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-1 px-1"
            placeholder="${escapeHtml(ph)}"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            type="button"
            class="btn-compact add-tag-btn px-2.5 py-1 text-xs bg-xp-primary/20 text-xp-primary hover:bg-xp-primary/30 rounded font-medium transition-colors shrink-0"
            aria-label="${addText}"
          >
            + ${addText}
          </button>
        </div>
      </div>
      <input type="hidden" name="${name}" value="${escapeHtml(cleanTags.join(","))}" />
      <div
        class="tag-suggestions-menu hidden absolute z-40 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-xp-card border-2 border-gray-200 dark:border-xp-primary/30 rounded-lg shadow-xl py-1 text-sm"
      ></div>
    </div>
  `
}

export class TagInput {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container
   * @param {string[]} [options.initialTags=[]]
   * @param {string[]|Function} [options.availableTags=[]]
   * @param {string} [options.name="tags"]
   * @param {string} [options.placeholder=""]
   * @param {Object} [options.i18n=null]
   * @param {Function} [options.onChange=null]
   */
  constructor({
    container,
    initialTags = [],
    availableTags = [],
    name = "tags",
    placeholder = "",
    i18n = null,
    onChange = null
  }) {
    if (!container) {
      throw new Error("TagInput requires a valid container element")
    }

    this.container = container
    this.name = name
    this.i18n = i18n
    this.onChange = onChange
    this.availableTagsSource = availableTags
    this.placeholder =
      placeholder ||
      i18n?.getMessage("ui.tags.placeholder") ||
      "Escribe una etiqueta y presiona Enter..."

    this.tags = Array.isArray(initialTags)
      ? [...new Set(initialTags.map(t => String(t).trim()).filter(Boolean))]
      : []

    this.activeIndex = -1
    this.isOpen = false
    this.currentSuggestions = []

    this._boundOnDocClick = this._handleDocClick.bind(this)
    this._initDOM()
    this._bindEvents()
  }

  _initDOM() {
    let widget = this.container.classList.contains("tag-input-widget")
      ? this.container
      : this.container.querySelector(".tag-input-widget")

    if (!widget) {
      this.container.innerHTML = tagInputTemplate({
        name: this.name,
        initialTags: this.tags,
        placeholder: this.placeholder,
        i18n: this.i18n
      })
      widget = this.container.querySelector(".tag-input-widget")
    }

    this.widgetEl = widget
    this.chipsContainer = widget.querySelector(".tag-chips-container")
    this.inputEl = widget.querySelector(".tag-text-input")
    this.addBtn = widget.querySelector(".add-tag-btn")
    this.hiddenInput = widget.querySelector(`input[name="${this.name}"]`)
    this.menuEl = widget.querySelector(".tag-suggestions-menu")

    this._renderChips()
    this._syncHiddenInput()
  }

  _bindEvents() {
    this.chipsContainer.addEventListener("click", e => {
      const removeBtn = e.target.closest(".remove-tag-btn")
      if (removeBtn) {
        const tag = removeBtn.dataset.tag
        this.removeTag(tag)
      }
    })

    this.addBtn.addEventListener("click", () => {
      this._commitInput()
    })

    this.inputEl.addEventListener("focus", () => {
      this._updateSuggestions(this.inputEl.value)
    })

    this.inputEl.addEventListener("input", () => {
      this._updateSuggestions(this.inputEl.value)
    })

    this.inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (
          this.isOpen &&
          this.activeIndex >= 0 &&
          this.currentSuggestions[this.activeIndex]
        ) {
          this.addTag(this.currentSuggestions[this.activeIndex])
        } else {
          this._commitInput()
        }
      } else if (e.key === ",") {
        e.preventDefault()
        this._commitInput()
      } else if (e.key === "Backspace" && this.inputEl.value === "") {
        if (this.tags.length > 0) {
          this.removeTag(this.tags[this.tags.length - 1])
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        this._moveSelection(1)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        this._moveSelection(-1)
      } else if (e.key === "Escape") {
        this.closeSuggestions()
      }
    })

    this.menuEl.addEventListener("click", e => {
      const item = e.target.closest("[data-tag]")
      if (item) {
        const tag = item.dataset.tag
        this.addTag(tag)
      }
    })

    document.addEventListener("click", this._boundOnDocClick)
  }

  _handleDocClick(e) {
    if (!this.widgetEl.contains(e.target)) {
      this.closeSuggestions()
    }
  }

  _commitInput() {
    const rawValue = this.inputEl.value
    if (!rawValue) return
    const parts = rawValue
      .split(",")
      .map(p => p.replace(/^#/, "").trim())
      .filter(Boolean)

    parts.forEach(part => this.addTag(part))
    this.inputEl.value = ""
    this.closeSuggestions()
  }

  /**
   * Obtiene la lista completa de sugerencias disponibles
   * @returns {string[]}
   */
  _getAvailableTags() {
    const source =
      typeof this.availableTagsSource === "function"
        ? this.availableTagsSource()
        : this.availableTagsSource

    if (!Array.isArray(source)) return []
    return [...new Set(source.map(t => String(t).trim()).filter(Boolean))]
  }

  _updateSuggestions(query = "") {
    const cleanQuery = query.trim().toLowerCase().replace(/^#/, "")
    const available = this._getAvailableTags()
    const lowerCurrent = new Set(this.tags.map(t => t.toLowerCase()))

    // Excluir etiquetas ya agregadas
    const candidates = available.filter(t => !lowerCurrent.has(t.toLowerCase()))

    let matched = []
    if (cleanQuery) {
      matched = candidates.filter(t =>
        t.toLowerCase().includes(cleanQuery)
      )
    } else {
      matched = candidates.slice(0, 8)
    }

    this.currentSuggestions = matched
    this.activeIndex = -1

    const canCreateNew =
      cleanQuery &&
      !lowerCurrent.has(cleanQuery) &&
      !matched.some(t => t.toLowerCase() === cleanQuery)

    if (matched.length === 0 && !canCreateNew) {
      this.closeSuggestions()
      return
    }

    const suggestionsHeader =
      this.i18n?.getMessage("ui.tags.suggestions") || "Etiquetas sugeridas"
    const addText = this.i18n?.getMessage("ui.tags.clickToAdd") || "Añadir"

    let itemsHtml = ""

    if (matched.length > 0) {
      itemsHtml += `
        <div class="px-3 py-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          ${escapeHtml(suggestionsHeader)}
        </div>
      `
      itemsHtml += matched
        .map(
          (t, idx) => `
        <button
          type="button"
          class="suggestion-item w-full text-left px-3 py-1.5 flex items-center justify-between text-sm hover:bg-xp-primary/15 dark:hover:bg-xp-primary/25 transition-colors text-gray-800 dark:text-gray-200"
          data-tag="${escapeHtml(t)}"
          data-index="${idx}"
        >
          <span><span class="text-xp-primary font-semibold">#</span> ${escapeHtml(t)}</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">${escapeHtml(addText)}</span>
        </button>
      `
        )
        .join("")
    }

    if (canCreateNew) {
      const createText =
        this.i18n?.getMessage("ui.tags.createNew", {
          tag: query.trim()
        }) || `Crear "${escapeHtml(query.trim())}"`

      itemsHtml += `
        <button
          type="button"
          class="suggestion-item w-full text-left px-3 py-1.5 flex items-center gap-1.5 text-sm text-xp-primary hover:bg-xp-primary/15 dark:hover:bg-xp-primary/25 font-medium transition-colors border-t border-gray-100 dark:border-gray-800 mt-1"
          data-tag="${escapeHtml(query.trim().replace(/^#/, ""))}"
          data-index="${matched.length}"
        >
          <span>+ ${escapeHtml(createText)}</span>
        </button>
      `
      this.currentSuggestions.push(query.trim().replace(/^#/, ""))
    }

    this.menuEl.innerHTML = itemsHtml
    this.menuEl.classList.remove("hidden")
    this.isOpen = true
  }

  _moveSelection(direction) {
    if (!this.isOpen || this.currentSuggestions.length === 0) return

    const total = this.currentSuggestions.length
    this.activeIndex = (this.activeIndex + direction + total) % total

    const items = this.menuEl.querySelectorAll(".suggestion-item")
    items.forEach((item, idx) => {
      const isSelected = idx === this.activeIndex
      item.classList.toggle("bg-xp-primary/20", isSelected)
      item.classList.toggle("dark:bg-xp-primary/30", isSelected)
      if (isSelected && typeof item.scrollIntoView === "function") {
        item.scrollIntoView({ block: "nearest" })
      }
    })
  }

  closeSuggestions() {
    this.menuEl.classList.add("hidden")
    this.isOpen = false
    this.activeIndex = -1
    this.currentSuggestions = []
  }

  _renderChips() {
    const chipsHtml = this.tags
      .map(
        tag => `
        <span
          class="tag-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-xp-primary/20 text-xp-primary border border-xp-primary/30 dark:border-xp-primary/40 transition-colors"
          data-tag="${escapeHtml(tag)}"
        >
          <span># ${escapeHtml(tag)}</span>
          <button
            type="button"
            class="btn-compact remove-tag-btn w-4 h-4 rounded-full flex items-center justify-center text-xp-primary hover:text-white hover:bg-xp-danger transition-colors text-[10px]"
            data-tag="${escapeHtml(tag)}"
            aria-label="${this.i18n?.getMessage("ui.tags.remove", { tag }) || `Eliminar ${tag}`}"
          >
            &#x2715;
          </button>
        </span>
      `
      )
      .join("")

    this.chipsContainer.innerHTML = chipsHtml
  }

  _syncHiddenInput() {
    if (this.hiddenInput) {
      this.hiddenInput.value = this.tags.join(",")
    }
  }

  addTag(rawTag) {
    if (!rawTag) return false
    const tag = String(rawTag).trim().replace(/^#/, "").trim()
    if (!tag) return false

    // Comprobación insensible a mayúsculas
    const exists = this.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    if (exists) {
      this.inputEl.value = ""
      this.closeSuggestions()
      return false
    }

    this.tags.push(tag)
    this._renderChips()
    this._syncHiddenInput()
    this.inputEl.value = ""
    this.closeSuggestions()
    this.inputEl.focus()

    if (typeof this.onChange === "function") {
      this.onChange([...this.tags])
    }
    return true
  }

  removeTag(rawTag) {
    if (!rawTag) return false
    const tag = String(rawTag).toLowerCase()
    const prevLen = this.tags.length
    this.tags = this.tags.filter(t => t.toLowerCase() !== tag)

    if (this.tags.length !== prevLen) {
      this._renderChips()
      this._syncHiddenInput()
      this.inputEl.focus()

      if (typeof this.onChange === "function") {
        this.onChange([...this.tags])
      }
      return true
    }
    return false
  }

  getTags() {
    return [...this.tags]
  }

  setTags(newTags) {
    this.tags = Array.isArray(newTags)
      ? [...new Set(newTags.map(t => String(t).trim()).filter(Boolean))]
      : []
    this._renderChips()
    this._syncHiddenInput()
    if (typeof this.onChange === "function") {
      this.onChange([...this.tags])
    }
  }

  destroy() {
    document.removeEventListener("click", this._boundOnDocClick)
  }
}
