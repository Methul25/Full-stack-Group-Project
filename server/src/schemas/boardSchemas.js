import { z } from 'zod'

const memberRole = z.enum(['editor', 'viewer'])
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Board member not found')

export const addMemberSchema = z.object({
  email: z.string().trim().email().max(254),
  role: memberRole,
}).strict()

export const updateMemberSchema = z.object({ role: memberRole }).strict()
export const memberParamsSchema = z.object({ userId: objectId })
