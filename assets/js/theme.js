/**
 * Inicializa el tema, modo oscuro
 * @event window load - Se ejecuta cuando la página ha cargado completamente
 */
window.addEventListener("load", () => {
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  )
})
