const swUrl = new URL(self.location.href);
const cacheVersion = swUrl.searchParams.get('v') || 'dev';
const CACHE_NAME = `st-refka-media-${cacheVersion}`;

const STATIC_ASSETS = ['/', '/index.html', '/st-refka.png', '/Cairo-VariableFont_slnt,wght.ttf'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

const isHtmlOrApiRequest = (request) => {
  const destination = request.destination;
  if (destination === 'document') return true;
  const url = new URL(request.url);
  return url.pathname.startsWith('/auth/') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/functions/');
};

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'document' || request.mode === 'navigate') {
      return caches.match('/');
    }
    throw error;
  }
};

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('fonts.googleapis.com')) return;

  // Use Network-First for everything! 
  // This guarantees you always see the latest changes when online,
  // but still works entirely from cache when offline.
  event.respondWith(networkFirst(event.request));
});
