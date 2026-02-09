/* ===========================
   CONFIGURATION
=========================== */

const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./logo-192.png",
  "./logo-512.png",
  "./manifest.json"
];


/* ===========================
   INSTALL
=========================== */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(APP_SHELL);
      })
  );
  self.skipWaiting();
});


/* ===========================
   ACTIVATE
=========================== */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


/* ===========================
   FETCH STRATEGY
=========================== */

self.addEventListener("fetch", event => {

  // Navigation HTML → Network First
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => {
              return response || caches.match("./index.html");
            });
        })
    );
    return;
  }

  // Autres ressources → Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return cached || fetch(event.request)
          .then(response => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
      })
  );
});