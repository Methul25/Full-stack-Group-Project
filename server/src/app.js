import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { authenticate } from './middleware/authenticate.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js'
import { requestContext } from './middleware/requestContext.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

export const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: config.clientOrigin, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json({ limit: '100kb' }))
app.use(requestContext)
app.get('/api/health', (req, res) => res.json({ data: { status: 'ok', uptime: process.uptime() } }))
app.use('/api/auth', authRoutes)
app.use('/api/tasks', authenticate, taskRoutes)
app.use(notFoundHandler)
app.use(errorHandler)
