// Empty service worker for PWA installability and future cache strategies
self.addEventListener("install", (event) => {
  event.waitUntil(Promise.resolve());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.resolve());
  self.clients.claim();
});
