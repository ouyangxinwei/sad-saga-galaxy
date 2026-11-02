const CACHE_PREFIX = 'oooo-app-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;

self.addEventListener('install', (event) => {
  const base = self.registration.scope;
  const assets = [
    base,
    new URL('index.html', base).toString(),
    new URL('manifest.webmanifest', base).toString(),
    new URL('oooo-icon.svg', base).toString(),
    new URL('oooo-icon-192.svg', base).toString(),
    new URL('oooo-icon-512.svg', base).toString(),
  ];

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(assets))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(new URL('index.html', scope).toString(), copy));
          return response;
        })
        .catch(async () => (await caches.match(new URL('index.html', scope).toString())) || (await caches.match(scope.toString())))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
