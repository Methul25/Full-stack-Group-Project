import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { userRepository, publicUser } from '../repositories/userRepository.js'
import { AppError } from '../utils/AppError.js'

const dummyPasswordHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.6n7q5Yl8vCwZ3jZQmM1jR9p7W6E8f6u'
const issueToken = (user) => jwt.sign(
  { sub: user.id, email: user.email },
  config.jwtSecret,
  { algorithm: 'HS256', expiresIn: config.jwtExpiresIn, issuer: 'syncboard-api', audience: 'syncboard-client' },
)

export async function register(input) {
  if (await userRepository.findByEmail(input.email)) throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS')
  try {
    const user = await userRepository.create({ ...input, passwordHash: await bcrypt.hash(input.password, 12) })
    return { token: issueToken(user), user: publicUser(user) }
  } catch (error) {
    if (error?.code === 11000) throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS')
    throw error
  }
}

export async function login({ email, password }) {
  const user = await userRepository.findByEmail(email)
  const valid = await bcrypt.compare(password, user?.passwordHash ?? dummyPasswordHash)
  if (!valid) throw new AppError('Invalid email or password', 401, 'BAD_CREDENTIALS')
  return { token: issueToken(user), user: publicUser(user) }
}

export async function me(userId) {
  const user = await userRepository.findById(userId)
  if (!user) throw new AppError('User no longer exists', 401, 'INVALID_USER')
  return publicUser(user)
}
