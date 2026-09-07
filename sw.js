const CACHE_NAME = "pwa-cache-v4"
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/css/tailwind.min.css",
  "/assets/css/styles.css",
  "/assets/js/analytics.js",
  "/assets/js/theme.js",
  "/assets/js/main.js",
  "/assets/js/core/app.js",
  "/assets/js/core/eventBus.js",
  "/assets/js/services/storage.js",
  "/assets/js/services/i18n.js",
  "/assets/js/utils/confetti.js",
  "/assets/js/utils/date.js",
  "/assets/js/utils/html.js",
  "/assets/js/utils/id.js",
  "/assets/js/data/demoData.js",
  "/assets/js/modules/budgets/index.js",
  "/assets/js/modules/budgets/models.js",
  "/assets/js/modules/budgets/templates.js",
  "/assets/js/modules/tasks/index.js",
  "/assets/js/modules/tasks/models.js",
  "/assets/js/modules/tasks/templates.js",
  "/assets/js/modules/habits/index.js",
  "/assets/js/modules/habits/models.js",
  "/assets/js/modules/habits/templates.js",
  "/assets/js/modules/notes/index.js",
  "/assets/js/modules/notes/models.js",
  "/assets/js/modules/notes/templates.js",
  "/assets/js/modules/home/index.js",
  "/assets/js/modules/home/templates.js",
  "/assets/locales/en.json",
  "/assets/locales/es.json"
]

self.addEventListener("install", event => {
  // Instala el service worker y cachea los recursos necesarios
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener("fetch", event => {
  const { request } = event

  // No caches manifest ni cosas raras
  if (request.method !== "GET") return

  // Network first para HTML, CSS y JS
  if (
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style"
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone()
          caches
            .open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Network first para JSON de locale
  if (request.destination === "json" || request.url.includes("/locales/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone()
          caches
            .open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache first para assets estables (imágenes)
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request)
    })
  )
})

self.addEventListener("activate", event => {
  // Activa el service worker y limpia cachés antiguas
  clients.claim()
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )
      )
  )
})
