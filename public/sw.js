
// This service worker is intentionally minimal to create an "online-only" PWA.
// It ensures the app is installable but does not cache any assets,
// forcing all requests to be fetched from the network.

self.addEventListener('install', () => {
  // Activate the new service worker immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as the service worker activates.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Always fetch from the network and do not cache anything.
  event.respondWith(fetch(event.request));
});
