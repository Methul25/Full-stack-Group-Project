import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/config.js'

const validEnv = {
  NODE_ENV: 'test',
  JWT_SECRET: 'a-valid-test-secret-with-more-than-32-characters',
}

describe('environment configuration', () => {
  it('loads safe local defaults', () => {
    expect(loadConfig(validEnv)).toMatchObject({
      environment: 'test',
      isProduction: false,
      port: 4000,
      mongoUri: 'mongodb://127.0.0.1:27017/syncboard',
      seedDemoData: false,
      trustProxy: false,
    })
  })

  it('reports invalid fields together', () => {
    expect(() => loadConfig({ ...validEnv, PORT: '70000', JWT_SECRET: 'short' }))
      .toThrow(/PORT:.*JWT_SECRET:/)
  })

  it('requires a seed password only when seeding is enabled', () => {
    expect(() => loadConfig({ ...validEnv, SEED_DEMO_DATA: 'true' }))
      .toThrow(/SEED_USER_PASSWORD/)
    expect(loadConfig({ ...validEnv, SEED_DEMO_DATA: 'true', SEED_USER_PASSWORD: 'demo-pass' }).seedDemoData).toBe(true)
  })
})
