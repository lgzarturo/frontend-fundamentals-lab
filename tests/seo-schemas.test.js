import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { JSDOM } from "jsdom"
import {
  DEFAULT_SHARE_TITLE,
  DEFAULT_SHARE_URL
} from "../assets/js/components/shareModal.js"

describe("SEO, Meta y Schemas.org", () => {
  const htmlPath = path.resolve(__dirname, "../index.html")
  const htmlContent = fs.readFileSync(htmlPath, "utf-8")
  const dom = new JSDOM(htmlContent)
  const document = dom.window.document

  it("DEFAULT_SHARE_URL debe apuntar a https://task-manager.appsutiles.dev/", () => {
    expect(DEFAULT_SHARE_URL).toBe("https://task-manager.appsutiles.dev/")
  })

  it("DEFAULT_SHARE_TITLE debe ser 'Daily OS - Tu Sistema Operativo Personal'", () => {
    expect(DEFAULT_SHARE_TITLE).toBe("Daily OS - Tu Sistema Operativo Personal")
  })

  it("el título del documento debe ser 'Daily OS - Tu Sistema Operativo Personal'", () => {
    const title = document.querySelector("title")?.textContent.trim()
    expect(title).toBe("Daily OS - Tu Sistema Operativo Personal")
  })

  it("canonical y alternates deben apuntar a https://task-manager.appsutiles.dev/", () => {
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical?.getAttribute("href")).toBe(
      "https://task-manager.appsutiles.dev/"
    )

    const esAlternate = document.querySelector('link[hreflang="es"]')
    expect(esAlternate?.getAttribute("href")).toBe(
      "https://task-manager.appsutiles.dev/"
    )
  })

  it("Open Graph y Twitter Cards deben tener Daily OS y nuevo dominio", () => {
    const ogTitle = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
    expect(ogTitle).toBe("Daily OS - Tu Sistema Operativo Personal")

    const ogUrl = document
      .querySelector('meta[property="og:url"]')
      ?.getAttribute("content")
    expect(ogUrl).toBe("https://task-manager.appsutiles.dev/")

    const twitterTitle = document
      .querySelector('meta[name="twitter:title"]')
      ?.getAttribute("content")
    expect(twitterTitle).toBe("Daily OS - Tu Sistema Operativo Personal")
  })

  it("todos los bloques JSON-LD deben ser válidos y tener los tipos requeridos", () => {
    const jsonLdScripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )
    expect(jsonLdScripts.length).toBeGreaterThanOrEqual(3)

    const parsedSchemas = Array.from(jsonLdScripts).map(s =>
      JSON.parse(s.textContent)
    )
    const types = parsedSchemas.map(s => s["@type"])

    expect(types).toContain("WebApplication")
    expect(types).toContain("WebSite")
    expect(types).toContain("FAQPage")

    const webApp = parsedSchemas.find(s => s["@type"] === "WebApplication")
    expect(webApp.name).toBe("Daily OS")
    expect(webApp.url).toBe("https://task-manager.appsutiles.dev/")

    const faq = parsedSchemas.find(s => s["@type"] === "FAQPage")
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3)
  })
})
