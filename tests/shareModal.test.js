import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  bindShareModalEvents,
  DEFAULT_SHARE_TITLE,
  DEFAULT_SHARE_URL,
  shareModalTemplate
} from "../assets/js/components/shareModal.js"

describe("ShareModal Component", () => {
  let eventBus
  let container

  beforeEach(() => {
    document.body.innerHTML = ""
    container = document.createElement("div")
    document.body.appendChild(container)

    eventBus = {
      emit: vi.fn(),
      on: vi.fn()
    }
  })

  it("renderiza el template del modal con la estructura requerida", () => {
    const html = shareModalTemplate(null, {
      title: "Título de Prueba",
      url: "https://test.example.com"
    })

    container.innerHTML = html

    expect(container.querySelector("h3")?.textContent.trim()).toBe(
      "Título de Prueba"
    )
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/assets/images/og-daily-os.jpg"
    )
    expect(
      container.querySelector('[data-share-platform="twitter"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-share-platform="whatsapp"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-share-platform="linkedin"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-share-platform="telegram"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-share-platform="facebook"]')
    ).not.toBeNull()
    expect(
      container.querySelector('[data-share-platform="native"]')
    ).not.toBeNull()
    expect(container.querySelector("#share-link-input")?.value).toBe(
      "https://test.example.com"
    )
  })

  it("al hacer clic en copiar enlace emite evento y toast de éxito", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true
    })

    container.innerHTML = shareModalTemplate(null, {
      url: "https://dailyos.app"
    })
    bindShareModalEvents(container, eventBus, null, {
      url: "https://dailyos.app"
    })

    const copyBtn = container.querySelector('[data-share-action="copy"]')
    copyBtn.click()

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(writeTextMock).toHaveBeenCalledWith("https://dailyos.app")
    expect(eventBus.emit).toHaveBeenCalledWith("toast:show", {
      message: expect.any(String),
      type: "success"
    })
    expect(eventBus.emit).toHaveBeenCalledWith("share:action", {
      platform: "copy_link",
      url: "https://dailyos.app"
    })
  })

  it("al hacer clic en una red social emite share:action y abre la ventana", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    container.innerHTML = shareModalTemplate()
    bindShareModalEvents(container, eventBus)

    const twitterBtn = container.querySelector(
      '[data-share-platform="twitter"]'
    )
    twitterBtn.click()

    expect(eventBus.emit).toHaveBeenCalledWith("share:action", {
      platform: "twitter",
      url: DEFAULT_SHARE_URL
    })
    expect(openSpy).toHaveBeenCalled()

    openSpy.mockRestore()
  })

  it("maneja el botón nativo de compartir cuando navigator.share está disponible", () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", {
      value: shareMock,
      configurable: true,
      writable: true
    })

    container.innerHTML = shareModalTemplate()
    bindShareModalEvents(container, eventBus)

    const nativeBtn = container.querySelector('[data-share-platform="native"]')
    nativeBtn.click()

    expect(eventBus.emit).toHaveBeenCalledWith("share:action", {
      platform: "native",
      url: DEFAULT_SHARE_URL
    })
    expect(shareMock).toHaveBeenCalled()
  })
})
