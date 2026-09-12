import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { config } from './config.js'
import { authenticate } from './middleware/authenticate.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js'
import { requestContext } from './middleware/requestContext.js'
import authRoutes from './routes/authRoutes.js'
import boardRoutes from './routes/boardRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

export const app = express()
app.disable('x-powered-by')
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false)
app.use(cors({ origin: config.clientOrigin, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json({ limit: '100kb' }))
app.use(requestContext)
const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
app.get('/api/health', (req, res) => {
  const database = connectionStates[mongoose.connection.readyState] ?? 'unknown'
  const healthy = database === 'connected'
  res.status(healthy ? 200 : 503).json({ data: { status: healthy ? 'ok' : 'degraded', database, uptime: process.uptime() } })
})
app.use('/api/auth', authRoutes)
app.use('/api/boards', authenticate, boardRoutes)
app.use('/api/tasks', authenticate, taskRoutes)
app.use(notFoundHandler)
app.use(errorHandler)
