import { Router } from 'express'
import * as controller from '../controllers/taskController.js'
import { validate } from '../middleware/validate.js'
import { createTaskSchema, taskIdSchema, taskQuerySchema, updateTaskSchema } from '../schemas/taskSchemas.js'

const router = Router()
router.get('/', validate(taskQuerySchema, 'query'), controller.list)
router.post('/', validate(createTaskSchema), controller.create)
router.get('/:id', validate(taskIdSchema, 'params'), controller.getOne)
router.patch('/:id', validate(taskIdSchema, 'params'), validate(updateTaskSchema), controller.update)
router.delete('/:id', validate(taskIdSchema, 'params'), controller.remove)
export default router
