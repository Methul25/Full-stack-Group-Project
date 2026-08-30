import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as controller from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, registerSchema } from '../schemas/authSchemas.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

const router = Router()
const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(new AppError('Too many login attempts. Try again in one minute.', 429, 'RATE_LIMITED')),
})
router.post('/register', validate(registerSchema), asyncHandler(controller.register))
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login))
router.get('/me', authenticate, controller.me)
export default router
