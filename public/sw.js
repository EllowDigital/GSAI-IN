const SW_VERSION = '2.5.0';
const RUNTIME_CACHE = `gsai-runtime-${SW_VERSION}`;
const STATIC_CACHE = `gsai-static-${SW_VERSION}`;
const CACHE_PREFIX = 'gsai-';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) => key.startsWith(CACHE_PREFIX) && key !== RUNTIME_CACHE && key !== STATIC_CACHE
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PURGE_RUNTIME_CACHES') {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key))
        );
      })()
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: 'GSAI Update',
      body: event.data ? event.data.text() : 'You have a new notification.',
    };
  }

  const title = payload.title || 'GSAI Notification';
  const options = {
    body: payload.body || 'You have a new update.',
    icon: payload.icon || '/icons/android-chrome-192x192.png',
    badge: payload.badge || '/icons/favicon-32x32.png',
    tag: payload.tag || `gsai-${Date.now()}`,
    data: {
      url: payload.url || '/',
      scope: payload.scope || 'public',
    },
    renotify: Boolean(payload.renotify),
    requireInteraction: Boolean(payload.requireInteraction),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl =
    event.notification?.data?.url && typeof event.notification.data.url === 'string'
      ? event.notification.data.url
      : '/';

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const absoluteTarget = new URL(targetUrl, self.location.origin).href;

      for (const client of clientsList) {
        if (client.url === absoluteTarget && 'focus' in client) {
          await client.focus();
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(absoluteTarget);
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET') return;
  if (requestUrl.port === '8097' || requestUrl.hostname.endsWith('chrome-extension')) return;

  if (requestUrl.hostname === 'illustrations.shadcn.com') {
    const fileName = requestUrl.pathname.split('/').pop();
    if (fileName) {
      const localUrl = new URL(`/assets/illustrations/${fileName}`, self.location.origin);
      event.respondWith(fetch(localUrl.href));
      return;
    }
  }

  if (requestUrl.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate';
  const isStaticAsset = /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|webp|svg|ico)$/i.test(requestUrl.pathname);
  const isApiLike = requestUrl.pathname.startsWith('/rest/') || requestUrl.pathname.startsWith('/auth/');

  if (isApiLike) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (isDocument) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          const networkResponse = await fetch(request, { cache: 'no-store' });
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          const cached = await cache.match(request);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);

        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        return cached || (await networkPromise) || Response.error();
      })()
    );
  }
});
