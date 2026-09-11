import { defineConfig } from 'vitest/config'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-only-jwt-secret-that-is-at-least-32-characters'
process.env.SEED_DEMO_DATA = 'false'

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
})
