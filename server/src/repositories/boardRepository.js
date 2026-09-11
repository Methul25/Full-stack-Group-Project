import { Board } from '../models/Board.js'

export const boardRepository = {
  async listForUser(userId) {
    const boards = await Board.find({ 'members.userId': userId }).sort({ createdAt: 1 })
    return boards.map((board) => board.toJSON())
  },
  async isMember(boardId, userId) {
    return Boolean(await Board.exists({ _id: boardId, 'members.userId': userId }))
  },
  async findForMember(boardId, userId) {
    const board = await Board.findOne({ _id: boardId, 'members.userId': userId })
    return board?.toJSON() ?? null
  },
}
