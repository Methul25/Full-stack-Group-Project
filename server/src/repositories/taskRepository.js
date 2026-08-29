import { randomUUID } from 'node:crypto'
import { store } from '../data/store.js'

export const taskRepository = {
  listByBoardIds(boardIds) { return store.tasks.filter((task) => boardIds.includes(task.boardId)) },
  findById(id) { return store.tasks.find((task) => task.id === id) ?? null },
  create(input) { const task = { id: randomUUID(), ...input }; store.tasks.push(task); return task },
  update(id, changes) {
    const index = store.tasks.findIndex((task) => task.id === id)
    if (index < 0) return null
    store.tasks[index] = { ...store.tasks[index], ...changes, id: store.tasks[index].id, boardId: store.tasks[index].boardId }
    return store.tasks[index]
  },
  delete(id) { const index = store.tasks.findIndex((task) => task.id === id); if (index < 0) return false; store.tasks.splice(index, 1); return true },
}
