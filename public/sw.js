
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

  if (
    requestUrl.origin === self.location.origin &&
    requestUrl.pathname.startsWith('/assets/gsai-illustrations')
  ) {
    // Allow local illustration assets to fall through to the network fetch handler below.
  } else if (requestUrl.hostname === 'illustrations.shadcn.com') {
    const fileName = requestUrl.pathname.split('/').pop();
    if (fileName) {
      const localUrl = new URL(`/assets/gsai-illustrations/${fileName}`, self.location.origin);
      event.respondWith(fetch(localUrl.href));
      return;
    }
  }

  // Ignore React DevTools / other localhost requests the SW should not intercept
  if (requestUrl.port === '8097' || requestUrl.hostname.endsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch((error) => {
      console.warn('[SW] Network fetch failed, letting browser handle fallback', {
        url: requestUrl.href,
        error: error?.message,
      });
      return Response.error();
    })
  );
});
