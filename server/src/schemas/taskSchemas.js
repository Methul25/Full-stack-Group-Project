import { z } from 'zod'

const taskFields = {
  title: z.string().trim().min(3).max(140),
  assignee: z.string().trim().min(2).max(60),
  status: z.enum(['todo', 'doing', 'done']),
  dueDate: z.iso.date(),
  boardId: z.string().uuid().optional(),
}

export const createTaskSchema = z.object(taskFields).strict()
export const updateTaskSchema = z.object(taskFields).partial().omit({ boardId: true }).refine((value) => Object.keys(value).length > 0, { message: 'Send at least one field' })
export const taskIdSchema = z.object({ id: z.string().min(1) })
export const taskQuerySchema = z.object({
  status: z.enum(['todo', 'doing', 'done']).optional(),
  assignee: z.string().trim().min(1).optional(),
  sort: z.enum(['dueDate', '-dueDate', 'title', '-title', 'status', '-status']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})
