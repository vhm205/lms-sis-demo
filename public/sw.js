// EduCenter PWA Service Worker
const CACHE_NAME = 'educenter-pwa-v2';
const PRECACHE_ASSETS = [
  '/parent',
  '/parent/login',
  '/manifest.json',
  '/icons/icon.svg'
];

// Install: Cache initial shell and resources without auto skipWaiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache asset caching warning:', err);
      });
    })
  );
  // Note: Do NOT call self.skipWaiting() here so the update prompt can ask the user first.
});

// Message: Listen for SKIP_WAITING from client update popup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate: Clean up previous cache versions and take control of open clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first or cache fallback strategy for PWA navigation & assets
self.addEventListener('fetch', (event) => {
  // Pass through non-GET requests and internal API routes
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
