import { boardRepository } from '../repositories/boardRepository.js'
import { taskRepository } from '../repositories/taskRepository.js'
import { Activity } from '../models/Activity.js'
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/AppError.js'

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
  const task = await taskRepository.create({ ...input, boardId, version: 0 })
  await Activity.create({ boardId, taskId: task.id, userId, action: 'created', changes: input })
  return task
}

export async function update(id, input, userId) {
  await requireOwnedTask(id, userId)
  const { baseVersion, ...changes } = input
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
