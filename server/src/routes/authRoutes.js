import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as controller from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, registerSchema } from '../schemas/authSchemas.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

const router = Router()
const limiterResponse = (req, res, next) => {
  void req
  void res
  next(new AppError('Too many authentication attempts. Try again later.', 429, 'RATE_LIMITED'))
}
const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse,
})
const registerLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: limiterResponse })
router.post('/register', registerLimiter, validate(registerSchema), asyncHandler(controller.register))
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login))
router.get('/me', authenticate, asyncHandler(controller.me))
export default router
