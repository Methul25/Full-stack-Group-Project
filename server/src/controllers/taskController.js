import * as taskService from '../services/taskService.js'

export async function assignees(req, res) { res.json({ data: await taskService.assignees(req.user.id) }) }

export async function list(req, res) { const result = await taskService.list(req.user.id, req.validated.query); res.json({ data: result.tasks, meta: result.meta }) }
export async function getOne(req, res) { res.json({ data: await taskService.getOne(req.validated.params.id, req.user.id) }) }
export async function create(req, res) {
  const task = await taskService.create(req.validated.body, req.user.id)
  res.status(201).location(`/api/tasks/${task.id}`).json({ data: task })
}
export async function update(req, res) { res.json({ data: await taskService.update(req.validated.params.id, req.validated.body, req.user.id) }) }
export async function remove(req, res) { await taskService.remove(req.validated.params.id, req.user.id); res.status(204).end() }
export async function overdueSummary(req, res) { res.json({ data: await taskService.overdueSummary(req.user.id, req.validated.query) }) }
