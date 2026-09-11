import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { authenticate } from './middleware/authenticate.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js'
import { requestContext } from './middleware/requestContext.js'
import authRoutes from './routes/authRoutes.js'
import boardRoutes from './routes/boardRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
const defaultClientDist = fileURLToPath(new URL('../../dist', import.meta.url))

export function createApp(appConfig = config, database = mongoose.connection, clientDist = defaultClientDist) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', appConfig.trustProxy)
  if (appConfig.isProduction) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    }))
  }
  if (!appConfig.isProduction) {
    app.use(cors({ origin: appConfig.clientOrigin, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
  }
  app.use(express.json({ limit: '100kb' }))
  app.use(requestContext)
  app.get('/api/health', (req, res) => {
    const databaseStatus = connectionStates[database.readyState] ?? 'unknown'
    const healthy = databaseStatus === 'connected'
    res.status(healthy ? 200 : 503).json({ data: { status: healthy ? 'ok' : 'degraded', database: databaseStatus, uptime: process.uptime() } })
  })
  app.use('/api/auth', authRoutes)
  app.use('/api/boards', authenticate, boardRoutes)
  app.use('/api/tasks', authenticate, taskRoutes)

  if (appConfig.isProduction) {
    app.use(express.static(clientDist, { index: false }))
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/') || !req.accepts('html')) return next()
      res.sendFile(path.join(clientDist, 'index.html'))
    })
  }

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

export const app = createApp()
