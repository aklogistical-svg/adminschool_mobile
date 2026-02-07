const CACHE_NAME = "adminv1-cache";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo192.PNG",
  "./logo512.PNG" 
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
