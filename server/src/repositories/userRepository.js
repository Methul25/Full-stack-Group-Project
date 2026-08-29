import { randomUUID } from 'node:crypto'
import { store } from '../data/store.js'

export const publicUser = ({ id, name, email }) => ({ id, name, email })

export const userRepository = {
  findByEmail(email) { return store.users.find((user) => user.email === email.toLowerCase()) ?? null },
  findById(id) { return store.users.find((user) => user.id === id) ?? null },
  create({ name, email, passwordHash }) {
    const user = { id: randomUUID(), name, email: email.toLowerCase(), passwordHash }
    store.users.push(user)
    const board = { id: randomUUID(), name: `${name}'s board`, memberIds: [user.id] }
    store.boards.push(board)
    return user
  },
}
