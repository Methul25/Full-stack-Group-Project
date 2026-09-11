import { Task } from '../models/Task.js'
import { boardRepository } from '../repositories/boardRepository.js'
import { userRepository } from '../repositories/userRepository.js'
import { AppError, ForbiddenError, NotFoundError } from '../utils/AppError.js'

async function requireBoard(userId) {
  const board = await boardRepository.findFirstForUser(userId)
  if (!board) throw new NotFoundError('Board')
  return board
}

function roleFor(board, userId) {
  return board.members.find((member) => String(member.userId) === String(userId))?.role
}

async function requireOwner(userId) {
  const board = await requireBoard(userId)
  if (roleFor(board, userId) !== 'owner') throw new ForbiddenError('Only the board owner can manage members')
  return board
}

async function snapshot(board, currentUserId) {
  const users = await userRepository.findByIds(board.members.map((member) => member.userId))
  const byId = new Map(users.map((user) => [String(user.id), user]))
  return {
    ...board.toJSON(),
    currentUserRole: roleFor(board, currentUserId),
    members: board.members.map((member) => ({
      ...byId.get(String(member.userId)),
      role: member.role,
    })),
  }
}

export async function current(userId) {
  return snapshot(await requireBoard(userId), userId)
}

export async function addMember(userId, { email, role }) {
  const board = await requireOwner(userId)
  const member = await userRepository.findPublicByEmail(email)
  if (!member) throw new NotFoundError('Registered user')
  if (roleFor(board, member.id)) throw new AppError('User is already a board member', 409, 'MEMBER_EXISTS')
  const updated = await boardRepository.addMember(board.id, member.id, role)
  if (!updated) throw new AppError('User is already a board member', 409, 'MEMBER_EXISTS')
  return snapshot(updated, userId)
}

export async function updateMember(userId, memberId, { role }) {
  const board = await requireOwner(userId)
  const existingRole = roleFor(board, memberId)
  if (!existingRole) throw new NotFoundError('Board member')
  if (existingRole === 'owner') throw new ForbiddenError('The board owner role cannot be changed')
  if (role === 'viewer' && await Task.exists({ boardId: board.id, assigneeId: memberId })) {
    throw new AppError('Reassign this member\'s tasks before making them a viewer', 409, 'MEMBER_HAS_TASKS')
  }
  const updated = await boardRepository.updateMemberRole(board.id, memberId, role)
  return snapshot(updated, userId)
}

export async function removeMember(userId, memberId) {
  const board = await requireOwner(userId)
  const existingRole = roleFor(board, memberId)
  if (!existingRole) throw new NotFoundError('Board member')
  if (existingRole === 'owner') throw new ForbiddenError('The board owner cannot be removed')
  if (await Task.exists({ boardId: board.id, assigneeId: memberId })) {
    throw new AppError('Reassign this member\'s tasks before removing them', 409, 'MEMBER_HAS_TASKS')
  }
  return snapshot(await boardRepository.removeMember(board.id, memberId), userId)
}
