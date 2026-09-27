// Let Report service worker: makes the app installable and opens it fast.
// - Pages: network first (always the newest version), cached copy when offline.
// - App files (js, css, images): cached after first use.
// - Supabase (reports, photos, sign-in): never cached — always live.
// - Push notifications: shows alerts, chat messages and trouble changes; a tap opens the right screen.
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

// ───── Push notifications ─────
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // The app is open and on screen: it already shows the news itself, so no system notification.
    const onScreen = wins.some(w => w.focused && w.visibilityState === 'visible');
    if (onScreen && d.tag !== 'test') return;
    await self.registration.showNotification(d.title || 'Let Report', {
      body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag, icon: 'icons/icon-192.png', badge: 'icons/badge-96.png',
      data: { url: d.url || '#' }, timestamp: Date.now(),
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.url) || '#';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const win = wins.find(w => w.url.startsWith(self.registration.scope)) || wins[0];
    if (win) { await win.focus(); win.postMessage({ type: 'open', link }); return; }
    await self.clients.openWindow(self.registration.scope + link);
  })());
});
