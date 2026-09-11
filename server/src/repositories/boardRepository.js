import { Board } from '../models/Board.js'

function primaryBoard(boards, userId) {
  return boards.find((board) => board.members.some((member) => String(member.userId) === String(userId) && member.role !== 'owner')) ?? boards[0] ?? null
}

export const boardRepository = {
  async listForUser(userId) {
    const boards = await Board.find({ 'members.userId': userId }).sort({ createdAt: 1 })
    return boards.map((board) => board.toJSON())
  },
  async isMember(boardId, userId) {
    return Boolean(await Board.exists({ _id: boardId, 'members.userId': userId }))
  },
  async findFirstForUser(userId) {
    const boards = await Board.find({ 'members.userId': userId }).sort({ createdAt: 1 })
    return primaryBoard(boards, userId)
  },
  async primaryForUser(userId) {
    const boards = await Board.find({ 'members.userId': userId }).sort({ createdAt: 1 })
    return primaryBoard(boards, userId)?.toJSON() ?? null
  },
  async roleForUser(boardId, userId) {
    const board = await Board.findOne({ _id: boardId, 'members.userId': userId }).select('members')
    return board?.members.find((member) => String(member.userId) === String(userId))?.role ?? null
  },
  async addMember(boardId, userId, role) {
    return Board.findOneAndUpdate(
      { _id: boardId, 'members.userId': { $ne: userId } },
      { $push: { members: { userId, role } } },
      { returnDocument: 'after', runValidators: true },
    )
  },
  async updateMemberRole(boardId, userId, role) {
    return Board.findOneAndUpdate(
      { _id: boardId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { returnDocument: 'after', runValidators: true },
    )
  },
  async removeMember(boardId, userId) {
    return Board.findByIdAndUpdate(
      boardId,
      { $pull: { members: { userId } } },
      { returnDocument: 'after', runValidators: true },
    )
  },
}
