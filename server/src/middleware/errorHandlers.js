import { NotFoundError } from '../utils/AppError.js'

export function notFoundHandler(req, res, next) { next(new NotFoundError('Route')) }

export function errorHandler(error, req, res, next) {
  void next
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
