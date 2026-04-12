/**
 * Pruebas para EventBus
 */
import { describe, expect, it, vi } from "vitest"
import { EventBus } from "../assets/js/core/eventBus.js"

describe("EventBus", () => {
  it("debería suscribirse y emitir eventos", () => {
    const bus = new EventBus()
    const callback = vi.fn()

    bus.on("test", callback)
    bus.emit("test", { data: "value" })

    expect(callback).toHaveBeenCalledWith({ data: "value" })
  })

  it("debería desuscribirse de los eventos", () => {
    const bus = new EventBus()
    const callback = vi.fn()

    bus.on("test", callback)
    bus.off("test", callback)
    bus.emit("test", {})

    expect(callback).not.toHaveBeenCalled()
  })

  it("debería manejar múltiples suscriptores", () => {
    const bus = new EventBus()
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    bus.on("test", callback1)
    bus.on("test", callback2)
    bus.emit("test", "data")

    expect(callback1).toHaveBeenCalledWith("data")
    expect(callback2).toHaveBeenCalledWith("data")
  })

  it("debería soportar suscripción única", () => {
    const bus = new EventBus()
    const callback = vi.fn()

    bus.once("test", callback)
    bus.emit("test", "first")
    bus.emit("test", "second")

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith("first")
  })
})
