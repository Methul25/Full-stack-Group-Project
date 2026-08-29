import { randomUUID } from 'node:crypto'

export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] ?? randomUUID()
  res.set('X-Request-Id', req.id)
  const started = Date.now()
  res.on('finish', () => console.log(`${req.id} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`))
  next()
}
