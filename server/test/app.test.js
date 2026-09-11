import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { config } from '../src/config.js'

let clientDist

beforeAll(async () => {
  clientDist = await mkdtemp(path.join(tmpdir(), 'syncboard-client-'))
  await mkdir(path.join(clientDist, 'assets'))
  await writeFile(path.join(clientDist, 'index.html'), '<!doctype html><div id="root"></div>')
  await writeFile(path.join(clientDist, 'assets', 'app.js'), 'console.log("ok")')
})

afterAll(async () => {
  const { rm } = await import('node:fs/promises')
  await rm(clientDist, { recursive: true, force: true })
})

describe('application shell and health', () => {
  const productionConfig = { ...config, isProduction: true, trustProxy: 1 }

  it('reports degraded and healthy database states', async () => {
    const degraded = await request(createApp(config, { readyState: 0 })).get('/api/health')
    expect(degraded.status).toBe(503)
    expect(degraded.body.data).toMatchObject({ status: 'degraded', database: 'disconnected' })

    const healthy = await request(createApp(config, { readyState: 1 })).get('/api/health')
    expect(healthy.status).toBe(200)
    expect(healthy.body.data).toMatchObject({ status: 'ok', database: 'connected' })
  })

  it('serves production navigation and assets', async () => {
    const app = createApp(productionConfig, { readyState: 1 }, clientDist)
    for (const route of ['/', '/login', '/register', '/tasks/example']) {
      const response = await request(app).get(route).set('Accept', 'text/html')
      expect(response.status).toBe(200)
      expect(response.text).toContain('<div id="root"></div>')
    }
    expect((await request(app).get('/assets/app.js')).type).toBe('text/javascript')
  })

  it('keeps unknown API routes out of the SPA fallback', async () => {
    const app = createApp(productionConfig, { readyState: 1 }, clientDist)
    for (const route of ['/api', '/api/does-not-exist']) {
      const response = await request(app).get(route).set('Accept', 'text/html')
      expect(response.status).toBe(404)
      expect(response.type).toBe('application/json')
      expect(response.body.error.code).toBe('NOT_FOUND')
    }
  })

  it('replaces an invalid request identifier', async () => {
    const response = await request(createApp(config, { readyState: 0 }))
      .get('/api/health')
      .set('X-Request-Id', 'invalid request id')
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })
})
