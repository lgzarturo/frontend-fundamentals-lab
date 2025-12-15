/**
 * Inicializa el seguimiento de analíticas
 * @event window load - Se ejecuta cuando la página ha cargado completamente
 */
window.addEventListener("load", () => {
  // Evento personalizado para Google Analytics 4 vía Tag Manager
  document.addEventListener("DOMContentLoaded", function () {
    // Medición de clics en enlaces para GA4
    document.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "click_link",
            link_url: link.href,
            link_content: link.textContent.trim()
          })
        }
      })
    })
  })
})
