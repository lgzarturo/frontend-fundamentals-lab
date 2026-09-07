import { beforeEach, describe, expect, it } from "vitest"
import {
  isSoundEnabled,
  playCelebrationSound,
  setSoundEnabled,
  toggleSound
} from "../assets/js/utils/sound.js"

describe("Sound Utility", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("debería estar habilitado por defecto", () => {
    expect(isSoundEnabled()).toBe(true)
  })

  it("permite deshabilitar y verificar el estado del sonido", () => {
    setSoundEnabled(false)
    expect(isSoundEnabled()).toBe(false)

    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
  })

  it("toggleSound alterna adecuadamente entre habilitado y deshabilitado", () => {
    expect(isSoundEnabled()).toBe(true)

    const next1 = toggleSound()
    expect(next1).toBe(false)
    expect(isSoundEnabled()).toBe(false)

    const next2 = toggleSound()
    expect(next2).toBe(true)
    expect(isSoundEnabled()).toBe(true)
  })

  it("playCelebrationSound retorna false si el sonido está deshabilitado", async () => {
    setSoundEnabled(false)
    const played = await playCelebrationSound()
    expect(played).toBe(false)
  })

  it("playCelebrationSound retorna true cuando el sonido está activo", async () => {
    setSoundEnabled(true)
    const played = await playCelebrationSound()
    expect(played).toBe(true)
  })
})
