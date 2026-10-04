const VERSION = '2.0.0';
const CACHE = `pocket2048-v${VERSION}`;
const ASSETS = ['./', './index.html', './style.css', './engine.js', './audio.js', './app.js', './updates.js', './icon.svg', './icon-192.png', './icon-512.png', './manifest.webmanifest'];
self.addEventListener('install', event => {
  // Finish a complete download before offering the update; leave the current game running.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })))));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pocket2048-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('/version.json')) return;
  // Cache the whole release together for reliable offline play.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request.mode === 'navigate' ? './index.html' : event.request, { ignoreSearch: true });
    return cached || fetch(event.request);
  }));
});
