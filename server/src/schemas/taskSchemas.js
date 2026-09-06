import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Resource not found')

const taskFields = {
  title: z.string().trim().min(3).max(140),
  assignee: z.string().trim().min(2).max(60),
  status: z.enum(['todo', 'doing', 'done']),
  dueDate: z.iso.date(),
  boardId: objectId.optional(),
  description: z.string().trim().max(2000).default(''),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
}

export const createTaskSchema = z.object(taskFields).strict()
export const updateTaskSchema = z.object({
  ...Object.fromEntries(Object.entries(taskFields).filter(([key]) => key !== 'boardId').map(([key, value]) => [key, value.optional()])),
  baseVersion: z.number().int().min(0),
}).strict().refine((value) => Object.keys(value).some((key) => key !== 'baseVersion'), { message: 'Send at least one changed field' })
export const taskIdSchema = z.object({ id: objectId })
export const taskQuerySchema = z.object({
  status: z.enum(['todo', 'doing', 'done']).optional(),
  assignee: z.string().trim().min(1).optional(),
  sort: z.enum(['dueDate', '-dueDate', 'title', '-title', 'status', '-status']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const analyticsQuerySchema = z.object({ boardId: objectId.optional() })
