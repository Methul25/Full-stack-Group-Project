import { randomUUID } from 'node:crypto'

export function requestContext(req, res, next) {
  const supplied = req.headers['x-request-id']
  req.id = typeof supplied === 'string' && /^[a-zA-Z0-9._-]{1,64}$/.test(supplied) ? supplied : randomUUID()
  res.set('X-Request-Id', req.id)
  const started = Date.now()
  res.on('finish', () => console.log(`${req.id} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`))
  next()
}
