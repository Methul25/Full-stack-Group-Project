import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { config } from '../src/config.js'
import { Board } from '../src/models/Board.js'
import { User } from '../src/models/User.js'

const app = createApp(config)
let mongo

async function register(email, name = 'Test User') {
  return request(app).post('/api/auth/register').send({ name, email, password: 'strong-test-password' })
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
})

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})))
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})

describe('authentication API', () => {
  it('registers, restores, and logs in a user without exposing the password hash', async () => {
    const created = await register('person@example.com')
    expect(created.status).toBe(201)
    expect(created.body.data.user).not.toHaveProperty('passwordHash')

    const restored = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${created.body.data.token}`)
    expect(restored.status).toBe(200)
    expect(restored.body.data.email).toBe('person@example.com')

    const login = await request(app).post('/api/auth/login').send({ email: 'person@example.com', password: 'strong-test-password' })
    expect(login.status).toBe(200)
    expect(login.body.data.user.email).toBe('person@example.com')
  })

  it('returns consistent credential and duplicate-registration errors', async () => {
    await register('duplicate@example.com')
    const duplicate = await register('duplicate@example.com')
    expect(duplicate.status).toBe(409)
    expect(duplicate.body.error.code).toBe('EMAIL_EXISTS')

    const missing = await request(app).post('/api/auth/login').send({ email: 'missing@example.com', password: 'wrong-password' })
    expect(missing.status).toBe(401)
    expect(missing.body.error).toMatchObject({ code: 'BAD_CREDENTIALS', message: 'Invalid email or password' })
  })

  it('rejects passwords longer than bcrypt can safely process', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Unicode User',
      email: 'unicode@example.com',
      password: '😀'.repeat(20),
    })
    expect(response.status).toBe(400)
    expect(response.body.error.details).toContainEqual({ field: 'password', message: 'Password must not exceed 72 UTF-8 bytes' })
  })

  it('requires authentication and rate limits repeated proxy-address failures', async () => {
    expect((await request(app).get('/api/tasks')).status).toBe(401)
    const proxyApp = createApp({ ...config, isProduction: true, trustProxy: 1 })
    const attempts = []
    for (let attempt = 0; attempt < 6; attempt += 1) {
      attempts.push(await request(proxyApp)
        .post('/api/auth/login')
        .set('X-Forwarded-For', '203.0.113.10')
        .send({ email: 'missing@example.com', password: 'wrong-password' }))
    }
    expect(attempts.at(-1).status).toBe(429)
    expect(attempts.at(-1).body.error.code).toBe('RATE_LIMITED')
  })
})

describe('task authorization', () => {
  it('allows writers and rejects viewers and unrelated users', async () => {
    const owner = await register('owner@example.com', 'Owner User')
    const viewer = await register('viewer@example.com', 'Viewer User')
    const outsider = await register('outsider@example.com', 'Outside User')
    const ownerUser = await User.findOne({ email: 'owner@example.com' })
    const viewerUser = await User.findOne({ email: 'viewer@example.com' })
    const ownerBoard = await Board.findOne({ ownerId: ownerUser._id })
    ownerBoard.members.push({ userId: viewerUser._id, role: 'viewer' })
    await ownerBoard.save()

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${owner.body.data.token}`)
      .send({ title: 'Protected task', assignee: 'Owner User', status: 'todo', dueDate: '2030-01-01' })
    expect(created.status).toBe(201)

    const viewerUpdate = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${viewer.body.data.token}`)
      .send({ status: 'doing', baseVersion: 0 })
    expect(viewerUpdate.status).toBe(403)

    const viewerDelete = await request(app)
      .delete(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${viewer.body.data.token}`)
    expect(viewerDelete.status).toBe(403)

    const outsiderRead = await request(app)
      .get(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${outsider.body.data.token}`)
    expect(outsiderRead.status).toBe(403)

    const ownerUpdate = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${owner.body.data.token}`)
      .send({ status: 'doing', baseVersion: 0 })
    expect(ownerUpdate.status).toBe(200)
    expect(ownerUpdate.body.data.status).toBe('doing')
  })
})
