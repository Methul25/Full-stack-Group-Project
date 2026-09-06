import { NotFoundError } from '../utils/AppError.js'

export function notFoundHandler(req, res, next) { next(new NotFoundError('Route')) }

export function errorHandler(error, req, res, next) {
  void next
  if (error?.name === 'ValidationError') {
    error.status = 400
    error.code = 'DATABASE_VALIDATION_ERROR'
    error.details = Object.values(error.errors).map((issue) => ({ field: issue.path, message: issue.message }))
  }
  if (error?.name === 'CastError') {
    error.status = 404
    error.code = 'NOT_FOUND'
    error.message = 'Resource not found'
  }
  if (error?.code === 11000) {
    error.status = 409
    error.code = 'DUPLICATE_KEY'
    error.message = 'A record with that value already exists'
  }
  const status = error.status ?? 500
  if (status >= 500) console.error(req.id, error)
  res.status(status).json({
    error: {
      message: status >= 500 ? 'Something went wrong' : error.message,
      code: error.code ?? 'INTERNAL_ERROR',
      ...(error.details && { details: error.details }),
      requestId: req.id,
    },
  })
}
