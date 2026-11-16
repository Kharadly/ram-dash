/* Offline copy of the dashboard. Network first, so updates show at once; the cached copy is used only when
   there is no signal. Bluetooth control itself never needs the internet. */
const CACHE = 'ram-dash-v2';
const FILES = ['./', './index.html', './ram.webp', './logo.webp', './icon-192.png', './icon-512.png', './manifest.webmanifest'];
const HOSTS = [self.location.origin, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || !HOSTS.includes(u.origin)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./'))));
});
