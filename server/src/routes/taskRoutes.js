import { Router } from 'express'
import * as controller from '../controllers/taskController.js'
import { validate } from '../middleware/validate.js'
import { validateObjectId } from '../middleware/validateObjectId.js'
import { analyticsQuerySchema, createTaskSchema, taskIdSchema, taskQuerySchema, updateTaskSchema } from '../schemas/taskSchemas.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.get('/analytics/overdue', validate(analyticsQuerySchema, 'query'), asyncHandler(controller.overdueSummary))
router.get('/', validate(taskQuerySchema, 'query'), asyncHandler(controller.list))
router.post('/', validate(createTaskSchema), asyncHandler(controller.create))
router.get('/:id', validateObjectId, validate(taskIdSchema, 'params'), asyncHandler(controller.getOne))
router.patch('/:id', validateObjectId, validate(taskIdSchema, 'params'), validate(updateTaskSchema), asyncHandler(controller.update))
router.delete('/:id', validateObjectId, validate(taskIdSchema, 'params'), asyncHandler(controller.remove))
export default router
