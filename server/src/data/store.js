import bcrypt from 'bcryptjs'

export const store = { users: [], boards: [], tasks: [] }

export async function seedStore() {
  if (store.users.length) return
  const passwordHash = await bcrypt.hash('password123', 12)
  store.users.push(
    { id: 'user-maya', name: 'Maya', email: 'maya@syncboard.test', passwordHash },
    { id: 'user-noah', name: 'Noah', email: 'noah@syncboard.test', passwordHash },
  )
  store.boards.push(
    { id: 'board-launch', name: 'Launch board', memberIds: ['user-maya'] },
    { id: 'board-private', name: 'Noah private board', memberIds: ['user-noah'] },
  )
  store.tasks.push(
    { id: 'task-1', boardId: 'board-launch', title: 'Review onboarding copy', assignee: 'Maya', status: 'todo', dueDate: '2026-09-10' },
    { id: 'task-2', boardId: 'board-launch', title: 'Connect the live task API', assignee: 'Maya', status: 'doing', dueDate: '2026-09-05' },
    { id: 'task-3', boardId: 'board-launch', title: 'Confirm release checklist', assignee: 'Maya', status: 'done', dueDate: '2026-09-01' },
    { id: 'task-private', boardId: 'board-private', title: 'Private roadmap notes', assignee: 'Noah', status: 'todo', dueDate: '2026-09-15' },
  )
}
