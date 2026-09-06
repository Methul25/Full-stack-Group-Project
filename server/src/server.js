import { app } from './app.js'
import { config } from './config.js'
import { connectDb } from './db/connect.js'
import { seedDatabase } from './data/seed.js'

try {
  await connectDb()
  if (config.seedDemoData) await seedDatabase()
  app.listen(config.port, () => console.log(`SyncBoard API listening on http://localhost:${config.port}`))
} catch (error) {
  console.error('SyncBoard API could not connect to MongoDB:', error.message)
  process.exitCode = 1
}
