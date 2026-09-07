/**
 * Bootstrap de la aplicación Daily OS
 * Punto de entrada único: reemplaza al monolito legacy app.js
 */
import { app } from "./core/app.js"
import { i18n } from "./services/i18n.js"

window.addEventListener("load", () => {
  i18n.init(app.eventBus).then(() => {
    const languageSelector = document.getElementById("language-selector")
    languageSelector.value = i18n.currentLanguage
    languageSelector.addEventListener("change", function () {
      i18n.setLanguage(this.value)
    })

    app.init()
  })

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(registration => {
        console.log("ServiceWorker registrado:", registration)
      })
      .catch(error => {
        console.log("ServiceWorker error:", error)
      })
  }
})
