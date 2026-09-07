/**
 * Bootstrap de la aplicación Daily OS
 * Punto de entrada único: reemplaza al monolito legacy app.js
 */
import { app } from "./core/app.js"
import { i18n } from "./services/i18n.js"

window.addEventListener("load", () => {
  // Fachada global para los handlers inline (onclick="app...") del HTML
  window.app = app

  const startApp = () => {
    const languageSelector = document.getElementById("language-selector")
    if (languageSelector) {
      languageSelector.value = i18n.currentLanguage
      languageSelector.addEventListener("change", function () {
        i18n.setLanguage(this.value)
      })
    }

    // Inyecta el servicio i18n en la app para que los módulos lo reciban
    app.i18n = i18n
    app.init()
  }

  i18n
    .init(app.eventBus)
    .catch(error => {
      console.error("Error al inicializar i18n:", error)
    })
    .then(() => {
      startApp()
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
