import { app } from '../server/src/app.js'
import { connectDb } from '../server/src/db/connect.js'

let connection

export default async function handler(req, res) {
  try {
    connection ??= connectDb().catch((error) => {
      connection = undefined
      throw error
    })
    await connection
  } catch {
    return res.status(503).json({
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Service temporarily unavailable. Please try again shortly.',
      },
    })
  }
  return app(req, res)
}
