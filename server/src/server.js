import { app } from './app.js'
import { config } from './config.js'
import { seedStore } from './data/store.js'

await seedStore()
app.listen(config.port, () => console.log(`SyncBoard API listening on http://localhost:${config.port}`))
