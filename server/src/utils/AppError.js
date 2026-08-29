export class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(`${resource} not found`, 404, 'NOT_FOUND') }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have access to this resource') { super(message, 403, 'FORBIDDEN') }
}

export class ValidationError extends AppError {
  constructor(details) { super('Validation failed', 400, 'VALIDATION_ERROR', details) }
}
