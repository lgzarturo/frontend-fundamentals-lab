import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  TagInput,
  tagInputTemplate
} from "../assets/js/components/tagInput.js"

describe("tagInputTemplate", () => {
  it("debería renderizar la estructura HTML inicial con tags iniciales", () => {
    const htmlOutput = tagInputTemplate({
      id: "test-tags",
      name: "tags",
      initialTags: ["diseño", "ui"],
      placeholder: "Añade etiquetas"
    })

    expect(htmlOutput).toContain("id=\"test-tags\"")
    expect(htmlOutput).toContain("name=\"tags\"")
    expect(htmlOutput).toContain("value=\"diseño,ui\"")
    expect(htmlOutput).toContain("# diseño")
    expect(htmlOutput).toContain("# ui")
    expect(htmlOutput).toContain("placeholder=\"Añade etiquetas\"")
  })

  it("debería desduplicar y limpiar etiquetas iniciales en el template", () => {
    const htmlOutput = tagInputTemplate({
      initialTags: ["test", " test ", "TEST"]
    })

    const container = document.createElement("div")
    container.innerHTML = htmlOutput
    const chips = container.querySelectorAll(".tag-chip")
    expect(chips.length).toBe(2)
  })
})

describe("TagInput Component", () => {
  let container
  const dummyI18n = {
    getMessage: (key, params) => {
      if (key === "ui.tags.remove") return `Eliminar ${params?.tag}`
      if (key === "ui.tags.placeholder") return "Escribe una etiqueta..."
      if (key === "ui.tags.add") return "Agregar"
      if (key === "ui.tags.suggestions") return "Etiquetas sugeridas"
      if (key === "ui.tags.createNew") return `Crear "${params?.tag}"`
      return key
    }
  }

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
  })

  it("debería lanzar un error si no se pasa un contenedor válido", () => {
    expect(() => new TagInput({})).toThrow(
      "TagInput requires a valid container element"
    )
  })

  it("debería inicializarse con etiquetas iniciales y renderizar chips", () => {
    const tagInput = new TagInput({
      container,
      initialTags: ["javascript", "frontend"],
      i18n: dummyI18n
    })

    expect(tagInput.getTags()).toEqual(["javascript", "frontend"])
    const chips = container.querySelectorAll(".tag-chip")
    expect(chips.length).toBe(2)
    expect(chips[0].textContent).toContain("javascript")
    expect(chips[1].textContent).toContain("frontend")

    const hiddenInput = container.querySelector("input[name=\"tags\"]")
    expect(hiddenInput.value).toBe("javascript,frontend")
  })

  it("debería agregar etiquetas individualmente con addTag()", () => {
    const onChange = vi.fn()
    const tagInput = new TagInput({
      container,
      initialTags: ["uno"],
      onChange
    })

    const added = tagInput.addTag("dos")
    expect(added).toBe(true)
    expect(tagInput.getTags()).toEqual(["uno", "dos"])
    expect(onChange).toHaveBeenCalledWith(["uno", "dos"])

    const hiddenInput = container.querySelector("input[name=\"tags\"]")
    expect(hiddenInput.value).toBe("uno,dos")
    expect(container.querySelectorAll(".tag-chip").length).toBe(2)
  })

  it("debería limpiar espacios y remover hashtag al agregar etiqueta", () => {
    const tagInput = new TagInput({ container })
    tagInput.addTag("  #importante  ")

    expect(tagInput.getTags()).toEqual(["importante"])
  })

  it("no debería permitir etiquetas duplicadas (insensible a mayúsculas)", () => {
    const onChange = vi.fn()
    const tagInput = new TagInput({
      container,
      initialTags: ["CSS"],
      onChange
    })

    const result = tagInput.addTag("css")
    expect(result).toBe(false)
    expect(tagInput.getTags()).toEqual(["CSS"])
    expect(onChange).not.toHaveBeenCalled()
  })

  it("no debería agregar etiquetas vacías o con solo espacios", () => {
    const tagInput = new TagInput({ container })
    expect(tagInput.addTag("")).toBe(false)
    expect(tagInput.addTag("   ")).toBe(false)
    expect(tagInput.addTag("#")).toBe(false)
    expect(tagInput.getTags()).toEqual([])
  })

  it("debería eliminar etiquetas individualmente con removeTag()", () => {
    const onChange = vi.fn()
    const tagInput = new TagInput({
      container,
      initialTags: ["alfa", "beta", "gamma"],
      onChange
    })

    const removed = tagInput.removeTag("BETA")
    expect(removed).toBe(true)
    expect(tagInput.getTags()).toEqual(["alfa", "gamma"])
    expect(onChange).toHaveBeenCalledWith(["alfa", "gamma"])

    const hiddenInput = container.querySelector("input[name=\"tags\"]")
    expect(hiddenInput.value).toBe("alfa,gamma")
    expect(container.querySelectorAll(".tag-chip").length).toBe(2)
  })

  it("debería eliminar etiqueta al hacer clic en el botón de eliminar del chip", () => {
    const tagInput = new TagInput({
      container,
      initialTags: ["borrar-este", "conservar-este"]
    })

    const removeBtn = container.querySelector(
      ".remove-tag-btn[data-tag=\"borrar-este\"]"
    )
    expect(removeBtn).not.toBeNull()

    removeBtn.click()

    expect(tagInput.getTags()).toEqual(["conservar-este"])
    expect(container.querySelectorAll(".tag-chip").length).toBe(1)
  })

  it("debería agregar etiqueta al escribir y pulsar Enter", () => {
    const tagInput = new TagInput({ container })
    const input = container.querySelector(".tag-text-input")

    input.value = "nueva-etiqueta"
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true
    })
    input.dispatchEvent(event)

    expect(tagInput.getTags()).toEqual(["nueva-etiqueta"])
    expect(input.value).toBe("")
  })

  it("debería agregar etiqueta al pulsar la coma", () => {
    const tagInput = new TagInput({ container })
    const input = container.querySelector(".tag-text-input")

    input.value = "etiqueta-coma"
    const event = new KeyboardEvent("keydown", {
      key: ",",
      bubbles: true,
      cancelable: true
    })
    input.dispatchEvent(event)

    expect(tagInput.getTags()).toEqual(["etiqueta-coma"])
  })

  it("debería eliminar la última etiqueta con Backspace si el input está vacío", () => {
    const tagInput = new TagInput({
      container,
      initialTags: ["primera", "segunda"]
    })
    const input = container.querySelector(".tag-text-input")
    input.value = ""

    const event = new KeyboardEvent("keydown", {
      key: "Backspace",
      bubbles: true
    })
    input.dispatchEvent(event)

    expect(tagInput.getTags()).toEqual(["primera"])
  })

  it("debería agregar etiqueta al pulsar el botón de agregar", () => {
    const tagInput = new TagInput({ container })
    const input = container.querySelector(".tag-text-input")
    const addBtn = container.querySelector(".add-tag-btn")

    input.value = "desde-boton"
    addBtn.click()

    expect(tagInput.getTags()).toEqual(["desde-boton"])
    expect(input.value).toBe("")
  })

  it("debería mostrar sugerencias de autocomplete filtradas por texto", () => {
    const tagInput = new TagInput({
      container,
      availableTags: ["programación", "diseño", "productividad", "pruebas"],
      i18n: dummyI18n
    })

    const input = container.querySelector(".tag-text-input")
    input.value = "pro"
    input.dispatchEvent(new Event("input", { bubbles: true }))

    const menu = container.querySelector(".tag-suggestions-menu")
    expect(menu.classList.contains("hidden")).toBe(false)

    const suggestions = menu.querySelectorAll(
      ".suggestion-item[data-tag=\"programación\"], .suggestion-item[data-tag=\"productividad\"]"
    )
    expect(suggestions.length).toBe(2)
  })

  it("no debería sugerir etiquetas que ya están seleccionadas", () => {
    const tagInput = new TagInput({
      container,
      initialTags: ["diseño"],
      availableTags: ["diseño", "desarrollo"],
      i18n: dummyI18n
    })

    const input = container.querySelector(".tag-text-input")
    input.value = "d"
    input.dispatchEvent(new Event("input", { bubbles: true }))

    const menu = container.querySelector(".tag-suggestions-menu")
    const designSuggestion = menu.querySelector(
      ".suggestion-item[data-tag=\"diseño\"]"
    )
    const devSuggestion = menu.querySelector(
      ".suggestion-item[data-tag=\"desarrollo\"]"
    )

    expect(designSuggestion).toBeNull()
    expect(devSuggestion).not.toBeNull()
  })

  it("debería agregar etiqueta al hacer clic en un elemento de sugerencia", () => {
    const tagInput = new TagInput({
      container,
      availableTags: ["sugerencia-uno", "sugerencia-dos"],
      i18n: dummyI18n
    })

    const input = container.querySelector(".tag-text-input")
    input.value = "sug"
    input.dispatchEvent(new Event("input", { bubbles: true }))

    const menu = container.querySelector(".tag-suggestions-menu")
    const suggestionBtn = menu.querySelector(
      ".suggestion-item[data-tag=\"sugerencia-uno\"]"
    )
    expect(suggestionBtn).not.toBeNull()

    suggestionBtn.click()

    expect(tagInput.getTags()).toEqual(["sugerencia-uno"])
    expect(menu.classList.contains("hidden")).toBe(true)
  })

  it("debería permitir navegar sugerencias con ArrowDown y ArrowUp y seleccionar con Enter", () => {
    const tagInput = new TagInput({
      container,
      availableTags: ["alfa", "beta"],
      i18n: dummyI18n
    })

    const input = container.querySelector(".tag-text-input")
    input.value = ""
    input.dispatchEvent(new Event("focus", { bubbles: true }))

    const downEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true
    })
    input.dispatchEvent(downEvent)
    expect(tagInput.activeIndex).toBe(0)

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true
    })
    input.dispatchEvent(enterEvent)

    expect(tagInput.getTags()).toContain("alfa")
  })

  it("debería cerrar sugerencias al pulsar Escape", () => {
    const tagInput = new TagInput({
      container,
      availableTags: ["test"],
      i18n: dummyI18n
    })

    const input = container.querySelector(".tag-text-input")
    input.dispatchEvent(new Event("focus", { bubbles: true }))

    const menu = container.querySelector(".tag-suggestions-menu")
    expect(menu.classList.contains("hidden")).toBe(false)

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    expect(menu.classList.contains("hidden")).toBe(true)
  })

  it("debería actualizar etiquetas con setTags()", () => {
    const onChange = vi.fn()
    const tagInput = new TagInput({ container, onChange })

    tagInput.setTags(["uno", "dos", "tres"])
    expect(tagInput.getTags()).toEqual(["uno", "dos", "tres"])
    expect(onChange).toHaveBeenCalledWith(["uno", "dos", "tres"])

    const chips = container.querySelectorAll(".tag-chip")
    expect(chips.length).toBe(3)
  })

  it("debería limpiar listeners al llamar a destroy()", () => {
    const tagInput = new TagInput({
      container,
      availableTags: ["demo"]
    })
    tagInput.destroy()
    document.body.click()
  })
})
