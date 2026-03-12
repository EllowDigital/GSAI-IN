
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
  const requestUrl = new URL(event.request.url);

  if (requestUrl.port === '8097' || requestUrl.hostname.endsWith('chrome-extension')) {
    return;
  }

  if (requestUrl.hostname === 'illustrations.shadcn.com') {
    const fileName = requestUrl.pathname.split('/').pop();
    if (fileName) {
      const localUrl = new URL(`/assets/illustrations/${fileName}`, self.location.origin);
      event.respondWith(fetch(localUrl.href));
      return;
    }
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }
});
