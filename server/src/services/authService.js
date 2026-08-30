import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { userRepository, publicUser } from '../repositories/userRepository.js'
import { AppError } from '../utils/AppError.js'

const issueToken = (user) => jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

export async function register(input) {
  if (userRepository.findByEmail(input.email)) throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS')
  const user = userRepository.create({ ...input, passwordHash: await bcrypt.hash(input.password, 12) })
  return { token: issueToken(user), user: publicUser(user) }
}

export async function login({ email, password }) {
  const user = userRepository.findByEmail(email)
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!valid) throw new AppError('Invalid email or password', 401, 'BAD_CREDENTIALS')
  return { token: issueToken(user), user: publicUser(user) }
}

export function me(userId) {
  const user = userRepository.findById(userId)
  if (!user) throw new AppError('User no longer exists', 401, 'INVALID_USER')
  return publicUser(user)
}
