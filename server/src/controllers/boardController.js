import * as boardService from '../services/boardService.js'

export async function current(req, res) {
  res.json({ data: await boardService.current(req.user.id) })
}

export async function addMember(req, res) {
  const board = await boardService.addMember(req.user.id, req.validated.body)
  res.status(201).json({ data: board })
}

export async function updateMember(req, res) {
  res.json({ data: await boardService.updateMember(req.user.id, req.validated.params.userId, req.validated.body) })
}

export async function removeMember(req, res) {
  res.json({ data: await boardService.removeMember(req.user.id, req.validated.params.userId) })
}
