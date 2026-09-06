import mongoose from 'mongoose'
import { NotFoundError } from '../utils/AppError.js'

export function validateObjectId(req, res, next) {
  void res
  if (!mongoose.isValidObjectId(req.params.id)) return next(new NotFoundError('Task'))
  next()
}
