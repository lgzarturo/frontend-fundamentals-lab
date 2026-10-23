/**
 * Editor de notas por líneas con formato en vivo (estilo Notion).
 * Cada línea guarda markdown crudo y muestra HTML renderizado, salvo la
 * línea enfocada que se edita como texto plano. Sin dependencias externas.
 */
import {
  detectNoteBlockType,
  renderNoteLine
} from "../modules/notes/templates.js"
import { escapeHtml } from "../utils/html.js"

const BLOCK_MARKERS = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
  ul: "- ",
  ol: "1. ",
  quote: "> "
}

const INLINE_MARKERS = {
  bold: "**",
  italic: "*",
  code: "`"
}

const LEADING_MARKER_RE = /^(#{1,4}\s+|>\s?|-\s\[[ xX]\]\s+|[-*]\s+|\d+\.\s+|```)/
const LONE_MARKER_RE = /^(#{1,4}|[-*]|>|\d+\.|-\s\[[ xX]\]|```)\s*$/

function supportsPlaintextOnly() {
  try {
    const el = document.createElement("div")
    el.contentEditable = "plaintext-only"
    return el.contentEditable === "plaintext-only"
  } catch {
    return false
  }
}

function getSelectionOffsets(editEl) {
  const fallback = { start: editEl.textContent.length, end: editEl.textContent.length }
  try {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return fallback
    const range = sel.getRangeAt(0)
    if (!editEl.contains(range.startContainer)) return fallback
    const offsetOf = (node, offset) => {
      const pre = range.cloneRange()
      pre.selectNodeContents(editEl)
      pre.setEnd(node, offset)
      return pre.toString().length
    }
    return {
      start: offsetOf(range.startContainer, range.startOffset),
      end: offsetOf(range.endContainer, range.endOffset)
    }
  } catch {
    return fallback
  }
}

function setCaretOffset(editEl, offset) {
  try {
    let node = editEl.firstChild
    if (!node || node.nodeName === "BR") {
      editEl.textContent = editEl.textContent
      node = editEl.firstChild
    }
    if (!node) {
      node = document.createTextNode("")
      editEl.appendChild(node)
    }
    const pos = Math.max(0, Math.min(offset, node.textContent.length))
    const range = document.createRange()
    range.setStart(node, pos)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  } catch {
    // Posicionar el caret es best-effort
  }
}

export class BlockEditor {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.container - Contenedor de líneas
   * @param {HTMLElement|string} [options.toolbar] - Barra con [data-block-cmd]
   * @param {string} [options.initialMarkdown=""] - Contenido inicial
   * @param {Object} [options.i18n] - Servicio i18n
   * @param {HTMLElement|string} [options.hiddenInput] - Input oculto a sincronizar
   */
  constructor({
    container,
    toolbar = null,
    initialMarkdown = "",
    i18n = null,
    hiddenInput = null
  } = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container
    if (!this.container) throw new Error("BlockEditor needs a container")
    this.toolbar =
      typeof toolbar === "string" ? document.querySelector(toolbar) : toolbar
    this.hiddenInput =
      typeof hiddenInput === "string"
        ? document.querySelector(hiddenInput)
        : hiddenInput
    this.i18n = i18n
    this.lines = String(initialMarkdown ?? "").split("\n")
    this.focusedIndex = -1
    this.selectedRange = null
    this.plaintext = supportsPlaintextOnly()

    this._onFocusIn = e => {
      const edit = e.target.closest?.(".be-edit")
      if (edit) this.focusedIndex = Number(edit.dataset.index)
    }
    this._onFocusOut = e => {
      const edit = e.target.closest?.(".be-edit")
      if (edit) this._showView(Number(edit.dataset.index))
    }
    this._onInput = e => {
      const edit = e.target.closest?.(".be-edit")
      if (!edit) return
      const index = Number(edit.dataset.index)
      this._clearRange()
      this.lines[index] = edit.textContent
      this._refreshLineType(index)
      this._applyLiveStyle(index)
    }
    this._onKeyDown = e => {
      const edit = e.target.closest?.(".be-edit")
      if (!edit) return
      const index = Number(edit.dataset.index)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this._splitLine(index)
      } else if (e.key === "Backspace") {
        this._handleBackspace(e, index)
      } else if (
        e.shiftKey &&
        (e.key === "ArrowDown" || e.key === "ArrowUp")
      ) {
        e.preventDefault()
        this._extendRange(index, e.key === "ArrowDown" ? 1 : -1)
      } else if (e.key === "Escape") {
        this._clearRange()
      }
    }
    this._onClick = e => {
      const lineEl = e.target.closest?.(".be-line")
      if (!lineEl || !this.container.contains(lineEl)) return
      const index = Number(lineEl.dataset.index)
      if (e.shiftKey && (this.selectedRange || this.focusedIndex >= 0)) {
        const anchor = this.selectedRange
          ? this.selectedRange.anchor
          : this.focusedIndex
        if (this.focusedIndex >= 0 && this.focusedIndex !== index) {
          this._showView(this.focusedIndex)
        }
        this.selectedRange = { anchor, focus: index }
        this._showEdit(index)
        this._paintRange()
        return
      }
      this._clearRange()
      const edit = lineEl.querySelector(".be-edit")
      if (edit && edit.style.display === "none") this._showEdit(index)
    }
    this._onPaste = e => {
      if (this.plaintext) return
      const edit = e.target.closest?.(".be-edit")
      if (!edit) return
      e.preventDefault()
      const text =
        e.clipboardData?.getData("text") ||
        window.clipboardData?.getData("text") ||
        ""
      if (!text) return
      const index = Number(edit.dataset.index)
      const { start, end } = getSelectionOffsets(edit)
      const current = edit.textContent
      const next = current.slice(0, start) + text + current.slice(end)
      edit.textContent = next
      this.lines[index] = next
      setCaretOffset(edit, start + text.length)
      this._refreshLineType(index)
      this._applyLiveStyle(index)
    }
    this._onToolbarMouseDown = e => {
      if (e.target.closest?.("[data-block-cmd]")) e.preventDefault()
    }
    this._onToolbarClick = e => {
      const btn = e.target.closest?.("[data-block-cmd]")
      if (!btn) return
      this.runCommand(btn.dataset.blockCmd)
    }

    this._renderAll()
    this._bind()
  }

  getMarkdown() {
    this.lines = this.lines.map((line, index) => {
      const edit = this._editEl(index)
      return edit ? edit.textContent : line
    })
    return this.lines.join("\n")
  }

  setMarkdown(markdown) {
    this.lines = String(markdown ?? "").split("\n")
    this.focusedIndex = -1
    this.selectedRange = null
    this._renderAll()
  }

  syncHiddenInput() {
    if (this.hiddenInput) this.hiddenInput.value = this.getMarkdown()
  }

  destroy() {
    this.container.removeEventListener("focusin", this._onFocusIn)
    this.container.removeEventListener("focusout", this._onFocusOut)
    this.container.removeEventListener("input", this._onInput)
    this.container.removeEventListener("keydown", this._onKeyDown)
    this.container.removeEventListener("click", this._onClick)
    this.container.removeEventListener("paste", this._onPaste)
    this.toolbar?.removeEventListener("mousedown", this._onToolbarMouseDown)
    this.toolbar?.removeEventListener("click", this._onToolbarClick)
    this.focusedIndex = -1
    this.selectedRange = null
  }

  runCommand(cmd) {
    const index = this.focusedIndex >= 0 ? this.focusedIndex : 0
    if (INLINE_MARKERS[cmd]) {
      this._wrapInline(index, INLINE_MARKERS[cmd])
    } else if (cmd === "link") {
      this._insertLink(index)
    } else {
      for (const i of this._rangeIndices(index)) this._toggleBlock(i, cmd)
    }
    this._showEdit(this.selectedRange ? this.selectedRange.focus : index)
    this._paintRange()
  }

  _rangeIndices(fallback) {
    if (!this.selectedRange) return [fallback]
    const [from, to] = [
      Math.min(this.selectedRange.anchor, this.selectedRange.focus),
      Math.max(this.selectedRange.anchor, this.selectedRange.focus)
    ]
    const indices = []
    for (let i = from; i <= to; i++) indices.push(i)
    return indices
  }

  _extendRange(index, dir) {
    this._commit(index)
    const anchor = this.selectedRange ? this.selectedRange.anchor : index
    const focus = this.selectedRange ? this.selectedRange.focus : index
    const next = Math.max(0, Math.min(this.lines.length - 1, focus + dir))
    this.selectedRange = { anchor, focus: next }
    if (next !== index) this._showView(index)
    this._showEdit(next, dir > 0 ? this.lines[next].length : 0)
    this._paintRange()
  }

  _clearRange() {
    if (!this.selectedRange) return
    this.selectedRange = null
    this.container
      .querySelectorAll(".be-line[data-selected]")
      .forEach(lineEl => {
        delete lineEl.dataset.selected
        lineEl.style.backgroundColor = ""
      })
  }

  _paintRange() {
    this.container
      .querySelectorAll(".be-line[data-selected]")
      .forEach(lineEl => {
        delete lineEl.dataset.selected
        lineEl.style.backgroundColor = ""
      })
    if (!this.selectedRange) return
    for (const i of this._rangeIndices(this.focusedIndex)) {
      const lineEl = this._lineEl(i)
      if (!lineEl) continue
      lineEl.dataset.selected = "true"
      lineEl.style.backgroundColor = "rgba(10, 204, 113, 0.15)"
    }
  }

  _bind() {
    this.container.addEventListener("focusin", this._onFocusIn)
    this.container.addEventListener("focusout", this._onFocusOut)
    this.container.addEventListener("input", this._onInput)
    this.container.addEventListener("keydown", this._onKeyDown)
    this.container.addEventListener("click", this._onClick)
    this.container.addEventListener("paste", this._onPaste)
    this.toolbar?.addEventListener("mousedown", this._onToolbarMouseDown)
    this.toolbar?.addEventListener("click", this._onToolbarClick)
  }

  _computeFence() {
    const flags = []
    let inFence = false
    for (const line of this.lines) {
      if (line.startsWith("```")) {
        flags.push("fence")
        inFence = !inFence
      } else {
        flags.push(inFence ? "code" : null)
      }
    }
    return flags
  }

  _lineType(index, flags) {
    return flags[index] || detectNoteBlockType(this.lines[index])
  }

  _renderAll() {
    const flags = this._computeFence()
    this.container.innerHTML = this.lines
      .map((line, index) => {
        const type = this._lineType(index, flags)
        const inFence = flags[index] === "code"
        return (
          `<div class="be-line" data-index="${index}" data-block="${type}">` +
          `<div class="be-view">${renderNoteLine(line, inFence)}</div>` +
          `<div class="be-edit focus:outline-none" data-index="${index}" ` +
          `contenteditable="${this.plaintext ? "plaintext-only" : "true"}" ` +
          `style="display:none">${escapeHtml(line) || "<br>"}</div></div>`
        )
      })
      .join("")
  }

  _lineEl(index) {
    return this.container.querySelector(`.be-line[data-index="${index}"]`)
  }

  _editEl(index) {
    return this.container.querySelector(`.be-edit[data-index="${index}"]`)
  }

  _refreshLineType(index) {
    const lineEl = this._lineEl(index)
    if (lineEl) lineEl.dataset.block = this._lineType(index, this._computeFence())
  }

  _applyLiveStyle(index) {
    const edit = this._editEl(index)
    if (!edit) return
    const type = this._lineType(index, this._computeFence())
    edit.style.fontSize = ""
    edit.style.fontWeight = ""
    edit.style.fontStyle = ""
    edit.style.fontFamily = ""
    if (type === "h1") {
      edit.style.fontSize = "1.5rem"
      edit.style.fontWeight = "700"
    } else if (type === "h2") {
      edit.style.fontSize = "1.25rem"
      edit.style.fontWeight = "700"
    } else if (type === "h3" || type === "h4") {
      edit.style.fontSize = "1.125rem"
      edit.style.fontWeight = "700"
    } else if (type === "quote") {
      edit.style.fontStyle = "italic"
    } else if (type === "code" || type === "fence") {
      edit.style.fontFamily = "ui-monospace, monospace"
      edit.style.fontSize = "0.75rem"
    }
  }

  _commit(index) {
    const edit = this._editEl(index)
    if (edit) this.lines[index] = edit.textContent
  }

  _renderLine(index) {
    const flags = this._computeFence()
    const lineEl = this._lineEl(index)
    if (!lineEl) return
    const line = this.lines[index]
    lineEl.dataset.block = this._lineType(index, flags)
    lineEl.querySelector(".be-view").innerHTML = renderNoteLine(
      line,
      flags[index] === "code"
    )
    const edit = lineEl.querySelector(".be-edit")
    edit.innerHTML = escapeHtml(line) || "<br>"
  }

  _showEdit(index, caret = null) {
    const lineEl = this._lineEl(index)
    if (!lineEl) return
    this.focusedIndex = index
    this._renderLine(index)
    const view = lineEl.querySelector(".be-view")
    const edit = lineEl.querySelector(".be-edit")
    view.style.display = "none"
    edit.style.display = ""
    this._applyLiveStyle(index)
    try {
      edit.focus({ preventScroll: true })
    } catch {
      edit.focus()
    }
    setCaretOffset(edit, caret ?? this.lines[index].length)
  }

  _showView(index) {
    const lineEl = this._lineEl(index)
    if (!lineEl) return
    this._commit(index)
    this._renderLine(index)
    lineEl.querySelector(".be-view").style.display = ""
    lineEl.querySelector(".be-edit").style.display = "none"
  }

  _splitLine(index) {
    this._clearRange()
    const edit = this._editEl(index)
    const text = this.lines[index]
    const offset = edit ? getSelectionOffsets(edit).start : text.length
    this.lines[index] = text.slice(0, offset)
    this.lines.splice(index + 1, 0, text.slice(offset))
    this._renderAll()
    this._showEdit(index + 1, 0)
  }

  _handleBackspace(e, index) {
    const edit = this._editEl(index)
    if (!edit) return
    const text = edit.textContent
    this.lines[index] = text
    this._clearRange()
    if (LONE_MARKER_RE.test(text)) {
      e.preventDefault()
      this.lines[index] = ""
      this._renderLine(index)
      this._showEdit(index)
      return
    }
    const { start, end } = getSelectionOffsets(edit)
    if (start !== 0 || end !== 0) return
    if (index > 0) {
      e.preventDefault()
      const prevLen = this.lines[index - 1].length
      this.lines[index - 1] += text
      this.lines.splice(index, 1)
      this._renderAll()
      this._showEdit(index - 1, prevLen)
    }
  }

  _toggleBlock(index, kind) {
    this._commit(index)
    const line = this.lines[index]
    if (kind === "task") {
      const match = line.match(/^(-\s*\[)([ xX])(\]\s*)(.*)$/)
      if (match) {
        this.lines[index] =
          match[2] === " " ? `- [x] ${match[4]}` : match[4]
      } else {
        this.lines[index] = `- [ ] ${line.replace(LEADING_MARKER_RE, "")}`
      }
    } else if (kind === "paragraph" || kind === "p") {
      this.lines[index] = line.replace(LEADING_MARKER_RE, "")
    } else if (BLOCK_MARKERS[kind]) {
      const marker = BLOCK_MARKERS[kind]
      this.lines[index] = line.startsWith(marker)
        ? line.slice(marker.length)
        : marker + line.replace(LEADING_MARKER_RE, "")
    }
    this._renderLine(index)
  }

  _wrapInline(index, marker) {
    const edit = this._editEl(index)
    const text = edit ? edit.textContent : this.lines[index]
    const { start, end } = edit
      ? getSelectionOffsets(edit)
      : { start: text.length, end: text.length }
    let next
    let caret
    if (start === end) {
      next = text.slice(0, start) + marker + marker + text.slice(end)
      caret = start + marker.length
    } else {
      next =
        text.slice(0, start) +
        marker +
        text.slice(start, end) +
        marker +
        text.slice(end)
      caret = end + marker.length * 2
    }
    this.lines[index] = next
    this._renderLine(index)
    this._showEdit(index, caret)
  }

  _insertLink(index) {
    const message =
      this.i18n?.getMessage("app.screens.notes.editor.linkPrompt") ||
      "URL del enlace:"
    const url =
      typeof prompt === "function" ? prompt(message, "https://") : null
    if (!url || !url.trim()) return
    const edit = this._editEl(index)
    const text = edit ? edit.textContent : this.lines[index]
    const { start, end } = edit
      ? getSelectionOffsets(edit)
      : { start: text.length, end: text.length }
    let next
    let caret
    if (start === end) {
      next = `${text.slice(0, start)}[](${url.trim()})${text.slice(end)}`
      caret = start + 1
    } else {
      next = `${text.slice(0, start)}[${text.slice(start, end)}](${url.trim()})${text.slice(end)}`
      caret = end + url.trim().length + 4
    }
    this.lines[index] = next
    this._renderLine(index)
    this._showEdit(index, caret)
  }
}
