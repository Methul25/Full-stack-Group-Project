import 'dotenv/config'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret === 'replace-with-a-long-random-secret') {
  throw new Error('JWT_SECRET must be set in .env to a long random value.')
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
}
