import { afterEach, describe, expect, it, vi } from "vitest"
import { BlockEditor } from "../assets/js/components/blockEditor.js"
import {
  blockEditorShellTemplate,
  detectNoteBlockType,
  parseMarkdown,
  renderNoteLine
} from "../assets/js/modules/notes/templates.js"

const i18nStub = { getMessage: key => key }

function setup(initialMarkdown = "") {
  document.body.innerHTML = `
    <div id="toolbar-host"></div>
    <div id="editor-host"></div>
    <input type="hidden" id="hidden-md" />
  `
  document.getElementById("toolbar-host").innerHTML =
    blockEditorShellTemplate({ id: "editor-host-x", i18n: i18nStub })
  const editor = new BlockEditor({
    container: "#editor-host",
    toolbar: "#toolbar-host .be-toolbar",
    initialMarkdown,
    i18n: i18nStub,
    hiddenInput: "#hidden-md"
  })
  return editor
}

function lineEl(index) {
  return document.querySelector(`.be-line[data-index="${index}"]`)
}

function editEl(index) {
  return document.querySelector(`.be-edit[data-index="${index}"]`)
}

function clickView(index) {
  lineEl(index)
    .querySelector(".be-view")
    .dispatchEvent(new MouseEvent("click", { bubbles: true }))
}

function typeIn(index, text) {
  const edit = editEl(index)
  edit.textContent = text
  edit.dispatchEvent(new Event("input", { bubbles: true }))
}

function setSelection(index, start, end) {
  const edit = editEl(index)
  const node = edit.firstChild
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

describe("BlockEditor", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  describe("render inicial", () => {
    it("debería renderizar una línea por cada línea markdown con su tipo", () => {
      setup("# Título\nTexto\n- item")
      expect(lineEl(0).dataset.block).toBe("h1")
      expect(lineEl(1).dataset.block).toBe("p")
      expect(lineEl(2).dataset.block).toBe("ul")
    })

    it("debería iniciar con una línea vacía si no hay contenido", () => {
      setup("")
      expect(document.querySelectorAll(".be-line")).toHaveLength(1)
      expect(lineEl(0).dataset.block).toBe("p")
    })

    it("debería exigir un contenedor", () => {
      expect(() => new BlockEditor({})).toThrow()
    })
  })

  describe("FR-001 conversión en vivo al escribir", () => {
    it.each([
      ["# Hola", "h1"],
      ["## Hola", "h2"],
      ["### Hola", "h3"],
      ["- item", "ul"],
      ["1. primero", "ol"],
      ["- [ ] tarea", "task"],
      ["> cita", "quote"],
      ["```js", "fence"]
    ])("debería convertir %s a bloque %s sin recargar", (text, type) => {
      setup("")
      clickView(0)
      typeIn(0, text)
      expect(lineEl(0).dataset.block).toBe(type)
      expect(document.querySelectorAll(".be-line")).toHaveLength(1)
    })

    it("debería aplicar estilo en vivo al detectar encabezado", () => {
      setup("")
      clickView(0)
      typeIn(0, "# Hola")
      expect(editEl(0).style.fontWeight).toBe("700")
      typeIn(0, "Hola")
      expect(lineEl(0).dataset.block).toBe("p")
      expect(editEl(0).style.fontWeight).toBe("")
    })

    it("debería mostrar la línea formateada al soltar el foco", () => {
      setup("")
      clickView(0)
      typeIn(0, "# Hola")
      editEl(0).dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
      const view = lineEl(0).querySelector(".be-view")
      expect(view.style.display).toBe("")
      expect(view.innerHTML).toContain("<h1")
      expect(view.innerHTML).toContain("Hola")
    })
  })

  describe("FR-002 barra de formato", () => {
    it("debería alternar encabezados desde la toolbar", () => {
      const editor = setup("Hola")
      const h2 = document.querySelector('[data-block-cmd="h2"]')
      h2.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(editor.getMarkdown()).toBe("## Hola")
      h2.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(editor.getMarkdown()).toBe("Hola")
    })

    it("debería convertir a lista, checklist y cita", () => {
      const editor = setup("Texto")
      editor.runCommand("ul")
      expect(editor.getMarkdown()).toBe("- Texto")
      editor.runCommand("ol")
      expect(editor.getMarkdown()).toBe("1. Texto")
      editor.runCommand("quote")
      expect(editor.getMarkdown()).toBe("> Texto")
    })

    it("debería ciclar checklist pendiente, hecha y párrafo", () => {
      const editor = setup("Tarea")
      editor.runCommand("task")
      expect(editor.getMarkdown()).toBe("- [ ] Tarea")
      editor.runCommand("task")
      expect(editor.getMarkdown()).toBe("- [x] Tarea")
      editor.runCommand("task")
      expect(editor.getMarkdown()).toBe("Tarea")
    })

    it("debería envolver la selección con negrita y código", () => {
      const editor = setup("hola mundo")
      clickView(0)
      setSelection(0, 5, 10)
      editor.runCommand("bold")
      expect(editor.getMarkdown()).toBe("hola **mundo**")
      setSelection(0, 0, 4)
      editor.runCommand("code")
      expect(editor.getMarkdown()).toBe("`hola` **mundo**")
    })

    it("debería crear enlaces con prompt y tolerar cancelación", () => {
      const editor = setup("visita allá")
      clickView(0)
      setSelection(0, 7, 11)
      vi.stubGlobal("prompt", () => "https://ejemplo.com")
      editor.runCommand("link")
      expect(editor.getMarkdown()).toBe("visita [allá](https://ejemplo.com)")

      vi.stubGlobal("prompt", () => null)
      editor.runCommand("link")
      expect(editor.getMarkdown()).toBe("visita [allá](https://ejemplo.com)")
    })
  })

  describe("teclas de edición", () => {
    it("Enter debería dividir la línea en el caret", () => {
      const editor = setup("hola mundo")
      clickView(0)
      setSelection(0, 4, 4)
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      )
      expect(editor.getMarkdown()).toBe("hola\n mundo")
      expect(document.querySelectorAll(".be-line")).toHaveLength(2)
    })

    it("Backspace al inicio debería unir con la línea anterior", () => {
      const editor = setup("hola\nmundo")
      clickView(1)
      setSelection(1, 0, 0)
      editEl(1).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Backspace", bubbles: true })
      )
      expect(editor.getMarkdown()).toBe("holamundo")
    })

    it("Backspace en marcador solitario debería volver a párrafo", () => {
      const editor = setup("- ")
      clickView(0)
      setSelection(0, 2, 2)
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Backspace", bubbles: true })
      )
      expect(editor.getMarkdown()).toBe("")
      expect(lineEl(0).dataset.block).toBe("p")
    })
  })

  describe("FR-004 round-trip markdown", () => {
    it("debería conservar el markdown existente sin pérdidas", () => {
      const md = [
        "# Título",
        "",
        "Párrafo con **negrita** y [link](https://x.com).",
        "- [ ] pendiente",
        "- [x] hecha",
        "1. primero",
        "> cita",
        "```js",
        "const x = 1",
        "```"
      ].join("\n")
      const editor = setup(md)
      expect(editor.getMarkdown()).toBe(md)
      expect(lineEl(7).dataset.block).toBe("fence")
      expect(lineEl(8).dataset.block).toBe("code")
    })

    it("setMarkdown debería reemplazar el contenido", () => {
      const editor = setup("viejo")
      editor.setMarkdown("# nuevo")
      expect(editor.getMarkdown()).toBe("# nuevo")
      expect(lineEl(0).dataset.block).toBe("h1")
    })

    it("syncHiddenInput debería volcar el markdown al input oculto", () => {
      const editor = setup("hola")
      clickView(0)
      typeIn(0, "hola editado")
      editor.syncHiddenInput()
      expect(document.getElementById("hidden-md").value).toBe("hola editado")
    })

    it("destroy debería desvincular eventos", () => {
      const editor = setup("hola")
      editor.destroy()
      clickView(0)
      expect(lineEl(0).querySelector(".be-view").style.display).toBe("")
      expect(editor.focusedIndex).toBe(-1)
    })
  })

  describe("FR-003 identidad edición/guardado", () => {
    it.each([
      "# Título",
      "## Sub",
      "### Menor",
      "- viñeta",
      "1. primero",
      "- [ ] pendiente",
      "- [x] hecha",
      "> cita",
      "---",
      "Texto **negrita** *cursiva* `code` [L](https://x.com)"
    ])("renderNoteLine(%s) debería igualar parseMarkdown", line => {
      expect(renderNoteLine(line)).toBe(parseMarkdown(line))
    })

    it("debería detectar tipos de bloque", () => {
      expect(detectNoteBlockType("# a")).toBe("h1")
      expect(detectNoteBlockType("#### a")).toBe("h4")
      expect(detectNoteBlockType("- a")).toBe("ul")
      expect(detectNoteBlockType("3. a")).toBe("ol")
      expect(detectNoteBlockType("- [x] a")).toBe("task")
      expect(detectNoteBlockType("> a")).toBe("quote")
      expect(detectNoteBlockType("---")).toBe("hr")
      expect(detectNoteBlockType("```")).toBe("fence")
      expect(detectNoteBlockType("texto")).toBe("p")
    })
  })

  describe("selección multilínea", () => {
    it("Shift+Abajo debería extender la selección a la siguiente línea", () => {
      const editor = setup("uno\ndos\ntres")
      clickView(0)
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          shiftKey: true,
          bubbles: true
        })
      )
      expect(editor.selectedRange).toEqual({ anchor: 0, focus: 1 })
      expect(lineEl(0).dataset.selected).toBe("true")
      expect(lineEl(1).dataset.selected).toBe("true")
      expect(lineEl(2).dataset.selected).toBeUndefined()
    })

    it("Shift+Arriba debería extender hacia arriba y respetar bordes", () => {
      const editor = setup("uno\ndos\ntres")
      clickView(1)
      editEl(1).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowUp",
          shiftKey: true,
          bubbles: true
        })
      )
      expect(editor.selectedRange).toEqual({ anchor: 1, focus: 0 })
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowUp",
          shiftKey: true,
          bubbles: true
        })
      )
      expect(editor.selectedRange).toEqual({ anchor: 1, focus: 0 })
    })

    it("Shift+Click debería extender el rango y click simple colapsar", () => {
      const editor = setup("uno\ndos\ntres")
      clickView(0)
      lineEl(2)
        .querySelector(".be-view")
        .dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }))
      expect(editor.selectedRange).toEqual({ anchor: 0, focus: 2 })
      expect(lineEl(1).dataset.selected).toBe("true")
      lineEl(2)
        .querySelector(".be-view")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(editor.selectedRange).toBeNull()
      expect(lineEl(0).dataset.selected).toBeUndefined()
    })

    it("Escape y tipear deberían colapsar el rango", () => {
      const editor = setup("uno\ndos")
      clickView(0)
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          shiftKey: true,
          bubbles: true
        })
      )
      editEl(1).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      )
      expect(editor.selectedRange).toBeNull()

      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          shiftKey: true,
          bubbles: true
        })
      )
      typeIn(1, "dos!")
      expect(editor.selectedRange).toBeNull()
      expect(editor.getMarkdown()).toBe("uno\ndos!")
    })

    it("comando de bloque debería aplicar a todo el rango", () => {
      const editor = setup("uno\ndos\ntres")
      clickView(0)
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          shiftKey: true,
          bubbles: true
        })
      )
      editor.runCommand("h2")
      expect(editor.getMarkdown()).toBe("## uno\n## dos\ntres")
    })

    it("comando inline debería aplicar solo a la línea con foco", () => {
      const editor = setup("uno\ndos")
      clickView(0)
      editEl(0).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          shiftKey: true,
          bubbles: true
        })
      )
      setSelection(1, 0, 3)
      editor.runCommand("bold")
      expect(editor.getMarkdown()).toBe("uno\n**dos**")
    })
  })

  describe("scroll y toolbar", () => {
    it("el editor no debería tener scroll propio y la toolbar sticky en una fila", () => {
      const shell = blockEditorShellTemplate({ i18n: i18nStub })
      expect(shell).toContain("sticky top-0 z-40")
      expect(shell).toContain("overflow-x-auto")
      expect(shell).toContain("shrink-0")
      expect(shell).not.toContain("flex-wrap")
      expect(shell).not.toContain("max-h-[350px]")
      expect(shell).not.toContain("overflow-y-auto")
    })
  })

  describe("shell del editor", () => {
    it("debería incluir toolbar, contenedor e input oculto", () => {
      const shell = blockEditorShellTemplate({
        initialMarkdown: "# Hola",
        i18n: i18nStub
      })
      expect(shell).toContain('id="note-blocks-editor"')
      expect(shell).toContain('name="bodyMarkdown"')
      expect(shell).toContain('data-block-cmd="h1"')
      expect(shell).toContain('data-block-cmd="link"')
      expect(shell).toContain('data-block-cmd="task"')
      expect(shell).toContain("value=\"# Hola\"")
    })
  })
})
