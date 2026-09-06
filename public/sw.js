const CACHE = 'syncboard-shell-v5'
self.addEventListener('install', (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE)
  const response = await fetch('/')
  if (!response.ok) throw new Error('Unable to cache the application shell')
  const html = await response.clone().text()
  const assets = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)].map((match) => match[1])
  await cache.addAll([...new Set(assets)])
  await cache.put('/', response)
  await self.skipWaiting()
})()))
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith('syncboard-shell-') && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()),
))
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return
  const navigation = event.request.mode === 'navigate'
  if (!navigation && !['script', 'style', 'image', 'font'].includes(event.request.destination)) return
  event.respondWith(fetch(event.request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE)
      await cache.put(event.request, response.clone())
    }
    return response
  }).catch(async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(event.request, { ignoreVary: true })
    return cached ?? (navigation ? await cache.match('/') : undefined) ?? Response.error()
  }))
})
