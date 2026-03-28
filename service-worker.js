// SERVICE WORKER v3.0 — MAT Mézières Avec Toi
// Network First — mises à jour automatiques garanties
const CACHE = 'mat-v3.0';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./index.html','./mat-header.png','./icon-192.png'])));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Ne pas intercepter les appels API
  if (url.includes('onrender.com') || url.includes('googleapis.com') ||
      url.includes('open-meteo.com') || url.includes('facebook.com') ||
      url.includes('panneaupocket') || url.includes('github.io')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.method === 'GET') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
  );
});

// Réception des notifications push
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title:'MAT', body:'Nouvelle publication Radio Mézières' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'MAT — Mézières Avec Toi', {
      body:    data.body   || '',
      icon:    './icon-192.png',
      badge:   './icon-192.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || './' },
      actions: [{ action:'open', title:'Voir' }]
    })
  );
});

// Clic sur une notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || './';
  e.waitUntil(clients.matchAll({ type:'window' }).then(cls => {
    const existing = cls.find(c => c.url.includes('mairie-mezieres'));
    if (existing) { existing.focus(); }
    else { clients.openWindow(url); }
  }));
});
