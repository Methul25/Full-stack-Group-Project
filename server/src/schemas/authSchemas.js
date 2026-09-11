import { z } from 'zod'

const password = z.string().min(8).max(72).refine(
  (value) => Buffer.byteLength(value, 'utf8') <= 72,
  'Password must not exceed 72 UTF-8 bytes',
)

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password,
}).strict()

export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }).strict()
