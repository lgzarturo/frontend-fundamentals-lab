const CACHE_NAME = "pwa-cache-v2"
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/css/styles.css",
  "/assets/js/app.js"
]

self.addEventListener("install", (event) => {
  // Instala el service worker y cachea los recursos necesarios
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener("fetch", (event) => {
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
        .then((response) => {
          const responseClone = response.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache first para assets estables (imágenes)
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request)
    })
  )
})

self.addEventListener("activate", (event) => {
  // Activa el service worker y limpia cachés antiguas
  clients.claim()
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  )
})
