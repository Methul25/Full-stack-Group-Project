import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'must contain at least 32 characters')
    .refine((value) => value !== 'replace-with-a-long-random-secret', 'must not use the example placeholder'),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'must be a duration such as 30m, 1h, or 7d').default('1h'),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//, 'must be a MongoDB connection URI')
    .default('mongodb://127.0.0.1:27017/syncboard'),
  SEED_DEMO_DATA: z.enum(['true', 'false']).default('false'),
  SEED_USER_PASSWORD: z.string().optional(),
}).superRefine((env, context) => {
  if (env.SEED_DEMO_DATA === 'true' && (!env.SEED_USER_PASSWORD || Buffer.byteLength(env.SEED_USER_PASSWORD, 'utf8') < 8)) {
    context.addIssue({ code: 'custom', path: ['SEED_USER_PASSWORD'], message: 'must contain at least 8 bytes when demo seeding is enabled' })
  }
})

export function loadConfig(env = process.env) {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    throw new Error(`Invalid environment configuration: ${details}`)
  }
  const values = result.data
  return {
    environment: values.NODE_ENV,
    isProduction: values.NODE_ENV === 'production',
    port: values.PORT,
    clientOrigin: values.CLIENT_ORIGIN,
    jwtSecret: values.JWT_SECRET,
    jwtExpiresIn: values.JWT_EXPIRES_IN,
    mongoUri: values.MONGODB_URI,
    seedDemoData: values.SEED_DEMO_DATA === 'true',
    seedUserPassword: values.SEED_USER_PASSWORD,
    trustProxy: values.NODE_ENV === 'production' ? 1 : false,
  }
}

export const config = loadConfig()
