import * as authService from '../services/authService.js'

export async function register(req, res) {
  res.status(201).json({ data: await authService.register(req.validated.body) })
}

export async function login(req, res) {
  res.json({ data: await authService.login(req.validated.body) })
}

export function me(req, res) {
  res.json({ data: authService.me(req.user.id) })
}
