import { Router } from 'express'
import * as controller from '../controllers/boardController.js'
import { validate } from '../middleware/validate.js'
import { addMemberSchema, memberParamsSchema, updateMemberSchema } from '../schemas/boardSchemas.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.get('/current', asyncHandler(controller.current))
router.post('/current/members', validate(addMemberSchema), asyncHandler(controller.addMember))
router.patch('/current/members/:userId', validate(memberParamsSchema, 'params'), validate(updateMemberSchema), asyncHandler(controller.updateMember))
router.delete('/current/members/:userId', validate(memberParamsSchema, 'params'), asyncHandler(controller.removeMember))

export default router
