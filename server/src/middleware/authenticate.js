import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { config } from '../config.js'
import { AppError } from '../utils/AppError.js'

export function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) return next(new AppError('Authentication required', 401, 'NO_TOKEN'))
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'], issuer: 'syncboard-api', audience: 'syncboard-client' })
    if (typeof payload.sub !== 'string' || !mongoose.isValidObjectId(payload.sub)) {
      throw new Error('Invalid token subject')
    }
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (error) {
    const expired = error.name === 'TokenExpiredError'
    next(new AppError(expired ? 'Token expired' : 'Invalid token', 401, expired ? 'TOKEN_EXPIRED' : 'BAD_TOKEN'))
  }
}
