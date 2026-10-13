const C = 'aix-quickref-v20261013-171438';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url); if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('manage.html') || u.searchParams.has('check')) return; // 管理頁、更新檢查不經過快取
  if (r.mode === 'navigate' || r.url.endsWith('/') || r.url.endsWith('index.html')) {
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fromCache = () => caches.match('./index.html').then(m => m || caches.match('./'));
      const t = setTimeout(() => fromCache().then(m => { if (m && !done) { done = true; resolve(m); } }), 3000);
      fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put('./index.html', cp)); } if (!done) { done = true; clearTimeout(t); resolve(res); } })
        .catch(() => fromCache().then(m => { if (!done) { done = true; clearTimeout(t); resolve(m || Response.error()); } }));
    }));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
});
