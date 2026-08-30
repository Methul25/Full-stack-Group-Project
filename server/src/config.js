import 'dotenv/config'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret === 'replace-with-a-long-random-secret') {
  throw new Error('JWT_SECRET must be set in .env to a long random value.')
}

const seedDemoData = process.env.SEED_DEMO_DATA === 'true'
const seedUserPassword = process.env.SEED_USER_PASSWORD
if (seedDemoData && (!seedUserPassword || seedUserPassword.length < 8)) {
  throw new Error('SEED_USER_PASSWORD must contain at least 8 characters when demo data is enabled.')
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  seedDemoData,
  seedUserPassword,
}
