import { store } from '../data/store.js'

export const boardRepository = {
  listForUser(userId) { return store.boards.filter((board) => board.memberIds.includes(userId)) },
  isMember(boardId, userId) { return Boolean(store.boards.find((board) => board.id === boardId)?.memberIds.includes(userId)) },
}
