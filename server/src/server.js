import { app } from './app.js'
import { config } from './config.js'
import { seedDatabase } from './data/seed.js'
import { connectDb, disconnectDb } from './db/connect.js'

let server
let shuttingDown = false

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${signal} received; shutting down`)
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  await disconnectDb()
}

async function start() {
  await connectDb()
  if (config.seedDemoData) await seedDatabase(config.seedUserPassword)
  server = app.listen(config.port, () => console.log(`SyncBoard listening on http://localhost:${config.port}`))
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => shutdown(signal).catch((error) => {
    process.exitCode = 1
    console.error('Graceful shutdown failed:', error.message)
  }))
}

start().catch(async (error) => {
  process.exitCode = 1
  console.error('SyncBoard startup failed:', error.message)
  await disconnectDb().catch(() => {})
})
