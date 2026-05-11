const CACHE = 'market-radar-v2';
const CDN = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/index.html', '/manifest.json', ...CDN]).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

const API_DOMAINS = ['finnhub.io','twelvedata.com','financialmodelingprep.com','alphavantage.co','polygon.io','stooq.com','api.anthropic.com','fonts.googleapis.com'];

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isAPI = API_DOMAINS.some(d => url.hostname.includes(d));
  if (isAPI) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
    if (r.ok) { const clone = r.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
    return r;
  })));
});
