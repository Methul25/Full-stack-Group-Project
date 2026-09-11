import { boardRepository } from '../repositories/boardRepository.js'
import { taskRepository } from '../repositories/taskRepository.js'
import { Activity } from '../models/Activity.js'
import { userRepository } from '../repositories/userRepository.js'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/AppError.js'

export async function assignees(userId) {
  const board = await boardRepository.primaryForUser(userId)
  return board ? userRepository.findByIds(board.members.filter((member) => member.role !== 'viewer').map((member) => member.userId)) : []
}

async function recordActivity(input) {
  try {
    await Activity.create(input)
  } catch {
    console.error('Activity recording failed')
  }
}

const editRoles = new Set(['owner', 'editor'])

async function requireTaskAccess(id, userId, allowedRoles) {
  const task = await taskRepository.findById(id)
  if (!task) throw new NotFoundError('Task')
  const role = await boardRepository.roleForUser(task.boardId, userId)
  if (!role) throw new ForbiddenError()
  if (allowedRoles && !allowedRoles.has(role)) throw new ForbiddenError('Your board role does not allow this action')
  return task
}

async function resolveAssignee(board, name) {
  const assignableIds = board.members.filter((member) => member.role !== 'viewer').map((member) => member.userId)
  const users = await userRepository.findByIds(assignableIds)
  const matches = users.filter((member) => member.name === name)
  if (matches.length !== 1) {
    throw new ValidationError([{ field: 'assignee', message: 'Choose an owner or editor with a unique name on this board.' }])
  }
  return { assignee: matches[0].name, assigneeId: matches[0].id }
}

export async function list(userId, query) {
  const board = await boardRepository.primaryForUser(userId)
  const { tasks, total } = await taskRepository.listByBoardIds(board ? [board.id] : [], query)
  return { tasks, meta: { page: query.page, limit: query.limit, total } }
}

export async function getOne(id, userId) { return requireTaskAccess(id, userId) }

export async function create(input, userId) {
  const board = await boardRepository.primaryForUser(userId)
  const boardId = input.boardId ?? board?.id
  const role = board?.members.find((member) => String(member.userId) === String(userId))?.role
  if (!board || board.id !== boardId || !editRoles.has(role)) throw new ForbiddenError('Your board role does not allow task creation')
  const assigned = await resolveAssignee(board, input.assignee)
  const task = await taskRepository.create({ ...input, ...assigned, boardId, version: 0 })
  await recordActivity({ boardId, taskId: task.id, userId, action: 'created', changes: input })
  return task
}

export async function update(id, input, userId) {
  const existing = await requireTaskAccess(id, userId, editRoles)
  const { baseVersion, ...changes } = input
  if (changes.assignee !== undefined) {
    const board = await boardRepository.primaryForUser(userId)
    if (!board || board.id !== String(existing.boardId)) throw new ForbiddenError()
    Object.assign(changes, await resolveAssignee(board, changes.assignee))
  }
  const task = await taskRepository.updateVersioned(id, baseVersion, changes)
  if (!task) {
    const current = await taskRepository.findById(id)
    if (!current) throw new NotFoundError('Task')
    throw new ConflictError('Task was modified by someone else', { current, yourVersion: baseVersion, attempted: changes })
  }
  await recordActivity({ boardId: task.boardId, taskId: task.id, userId, action: 'updated', changes })
  return task
}

export async function remove(id, userId) {
  const task = await requireTaskAccess(id, userId, new Set(['owner']))
  await taskRepository.delete(id)
  await recordActivity({ boardId: task.boardId, taskId: task.id, userId, action: 'deleted' })
}

export async function overdueSummary(userId, { boardId }) {
  const board = await boardRepository.primaryForUser(userId)
  if (!board || (boardId && board.id !== boardId)) throw new ForbiddenError()
  return taskRepository.overdueSummary([board.id])
}
