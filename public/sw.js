const CACHE_NAME = 'ascend-athletics-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/globals.css',
  '/athlete/login',
  '/coach'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Apenas intercepta requisições de navegação ou assets locais
  if (event.request.mode === 'navigate' || event.request.url.includes('/globals.css') || event.request.url.includes('/favicon.ico')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/athlete/login');
        });
      })
    );
  }
});
