import { boardRepository } from '../repositories/boardRepository.js'
import { taskRepository } from '../repositories/taskRepository.js'
import { Activity } from '../models/Activity.js'
import { userRepository } from '../repositories/userRepository.js'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/AppError.js'

export async function assignees(userId) {
  const board = (await boardRepository.listForUser(userId))[0]
  return board ? userRepository.findByIds(board.members.map((member) => member.userId)) : []
}

async function resolveAssignee(board, name) {
  const members = await userRepository.findByIds(board.members.map((member) => member.userId))
  const matches = members.filter((member) => member.name === name)
  if (matches.length !== 1) throw new ValidationError([{ field: 'assignee', message: 'Choose a uniquely named member of this board.' }])
  return { assignee: matches[0].name, assigneeId: matches[0].id }
}

async function requireOwnedTask(id, userId) {
  const task = await taskRepository.findById(id)
  if (!task) throw new NotFoundError('Task')
  if (!await boardRepository.isMember(task.boardId, userId)) throw new ForbiddenError()
  return task
}

export async function list(userId, query) {
  const boardIds = (await boardRepository.listForUser(userId)).map((board) => board.id)
  const { tasks, total } = await taskRepository.listByBoardIds(boardIds, query)
  return { tasks, meta: { page: query.page, limit: query.limit, total } }
}

export async function getOne(id, userId) { return requireOwnedTask(id, userId) }

export async function create(input, userId) {
  const allowedBoards = await boardRepository.listForUser(userId)
  const boardId = input.boardId ?? allowedBoards[0]?.id
  if (!boardId || !await boardRepository.isMember(boardId, userId)) throw new ForbiddenError('You cannot create tasks on this board')
  const board = allowedBoards.find((item) => item.id === boardId)
  const assigned = await resolveAssignee(board, input.assignee)
  const task = await taskRepository.create({ ...input, ...assigned, boardId, version: 0 })
  await Activity.create({ boardId, taskId: task.id, userId, action: 'created', changes: input })
  return task
}

export async function update(id, input, userId) {
  const existing = await requireOwnedTask(id, userId)
  const { baseVersion, ...changes } = input
  if (changes.assignee !== undefined) {
    const board = (await boardRepository.listForUser(userId)).find((item) => item.id === String(existing.boardId))
    Object.assign(changes, await resolveAssignee(board, changes.assignee))
  }
  const task = await taskRepository.updateVersioned(id, baseVersion, changes)
  if (!task) {
    const current = await taskRepository.findById(id)
    if (!current) throw new NotFoundError('Task')
    throw new ConflictError('Task was modified by someone else', { current, yourVersion: baseVersion, attempted: changes })
  }
  await Activity.create({ boardId: task.boardId, taskId: task.id, userId, action: 'updated', changes })
  return task
}

export async function remove(id, userId) {
  const task = await requireOwnedTask(id, userId)
  await taskRepository.delete(id)
  await Activity.create({ boardId: task.boardId, taskId: task.id, userId, action: 'deleted' })
}

export async function overdueSummary(userId, { boardId }) {
  const ownedBoardIds = (await boardRepository.listForUser(userId)).map((board) => board.id)
  if (boardId && !ownedBoardIds.includes(boardId)) throw new ForbiddenError()
  return taskRepository.overdueSummary(boardId ? [boardId] : ownedBoardIds)
}
