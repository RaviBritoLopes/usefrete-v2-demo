const CACHE = 'usefrete-fusion-shell-v2'
const SHELL = ['/', '/manifest.webmanifest', '/usefrete-logo.png', '/offline-route.svg', '/offline-route-portrait.svg', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))), self.clients.claim()]))
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_SHELL') return
  const assets = Array.isArray(event.data.assets) ? event.data.assets.filter((url) => {
    try { return new URL(url).origin === self.location.origin } catch { return false }
  }) : []
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.allSettled(assets.map((asset) => cache.add(asset)))))
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => { if (response.ok) { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put('/', copy)) } return response }).catch(async () => await caches.match('/') || Response.error()))
    return
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.ok && (new URL(request.url).pathname.startsWith('/_next/static/') || ['script', 'style', 'image', 'font', 'manifest'].includes(request.destination))) { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put(request, copy)) } return response })))
})
