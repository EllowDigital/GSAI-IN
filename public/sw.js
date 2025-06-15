
// This service worker makes the app installable.
// It doesn't cache anything, ensuring the app only works online.
self.addEventListener('install', (event) => {
  // Skip waiting and activate new service worker immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as the service worker is activated.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Always fetch from the network. No offline support.
  event.respondWith(fetch(event.request));
});
