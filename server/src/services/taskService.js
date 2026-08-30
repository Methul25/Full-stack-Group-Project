import { boardRepository } from '../repositories/boardRepository.js'
import { taskRepository } from '../repositories/taskRepository.js'
import { ForbiddenError, NotFoundError } from '../utils/AppError.js'

function requireOwnedTask(id, userId) {
  const task = taskRepository.findById(id)
  if (!task) throw new NotFoundError('Task')
  if (!boardRepository.isMember(task.boardId, userId)) throw new ForbiddenError()
  return task
}

export function list(userId, query) {
  const boardIds = boardRepository.listForUser(userId).map((board) => board.id)
  let tasks = taskRepository.listByBoardIds(boardIds)
  if (query.status) tasks = tasks.filter((task) => task.status === query.status)
  if (query.assignee) tasks = tasks.filter((task) => task.assignee === query.assignee)
  const direction = query.sort?.startsWith('-') ? -1 : 1
  const sortField = query.sort?.replace(/^-/, '') || 'dueDate'
  tasks = [...tasks].sort((a, b) => String(a[sortField]).localeCompare(String(b[sortField])) * direction)
  const total = tasks.length
  const page = query.page ?? 1
  const limit = query.limit ?? 50
  return { tasks: tasks.slice((page - 1) * limit, page * limit), meta: { page, limit, total } }
}

export function getOne(id, userId) { return requireOwnedTask(id, userId) }

export function create(input, userId) {
  const allowedBoards = boardRepository.listForUser(userId)
  const boardId = input.boardId ?? allowedBoards[0]?.id
  if (!boardId || !boardRepository.isMember(boardId, userId)) throw new ForbiddenError('You cannot create tasks on this board')
  return taskRepository.create({ ...input, boardId })
}

export function update(id, changes, userId) { requireOwnedTask(id, userId); return taskRepository.update(id, changes) }
export function remove(id, userId) { requireOwnedTask(id, userId); taskRepository.delete(id) }
