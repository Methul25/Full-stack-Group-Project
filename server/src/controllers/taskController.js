import * as taskService from '../services/taskService.js'

export function list(req, res) { const result = taskService.list(req.user.id, req.validated.query); res.json({ data: result.tasks, meta: result.meta }) }
export function getOne(req, res) { res.json({ data: taskService.getOne(req.validated.params.id, req.user.id) }) }
export function create(req, res) {
  const task = taskService.create(req.validated.body, req.user.id)
  res.status(201).location(`/api/tasks/${task.id}`).json({ data: task })
}
export function update(req, res) { res.json({ data: taskService.update(req.validated.params.id, req.validated.body, req.user.id) }) }
export function remove(req, res) { taskService.remove(req.validated.params.id, req.user.id); res.status(204).end() }
