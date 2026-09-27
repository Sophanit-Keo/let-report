// Let Report service worker: makes the app installable and opens it fast.
// - Pages: network first (always the newest version), cached copy when offline.
// - App files (js, css, images): cached after first use.
// - Supabase (reports, photos, sign-in): never cached — always live.
const CACHE = 'let-report-%V%';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'images/logo-badge.jpg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('let-report-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // Supabase and fonts go straight to the network

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
