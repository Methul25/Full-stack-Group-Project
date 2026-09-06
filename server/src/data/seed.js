import bcrypt from 'bcryptjs'
import { Board } from '../models/Board.js'
import { Task } from '../models/Task.js'
import { User } from '../models/User.js'

const columns = [
  { title: 'To do', position: 0 },
  { title: 'In progress', position: 1 },
  { title: 'Completed', position: 2 },
]

export async function seedDatabase() {
  if (await User.exists({})) return

  const seedPassword = process.env.SEED_USER_PASSWORD
  if (!seedPassword || seedPassword.length < 8) {
    throw new Error('SEED_USER_PASSWORD must contain at least 8 characters when seeding demo data.')
  }
  const passwordHash = await bcrypt.hash(seedPassword, 12)
  const [maya, noah] = await User.create([
    { name: 'Maya', email: 'maya@syncboard.test', passwordHash },
    { name: 'Noah', email: 'noah@syncboard.test', passwordHash },
  ])
  const [launchBoard, privateBoard] = await Board.create([
    { name: 'Launch board', ownerId: maya._id, members: [{ userId: maya._id, role: 'owner' }], columns },
    { name: 'Noah private board', ownerId: noah._id, members: [{ userId: noah._id, role: 'owner' }], columns },
  ])
  await Task.create([
    { boardId: launchBoard._id, title: 'Review onboarding copy', assignee: 'Maya', assigneeId: maya._id, status: 'todo', dueDate: '2026-09-10', position: 0 },
    { boardId: launchBoard._id, title: 'Connect the live task API', assignee: 'Maya', assigneeId: maya._id, status: 'doing', dueDate: '2026-09-05', position: 0 },
    { boardId: launchBoard._id, title: 'Confirm release checklist', assignee: 'Maya', assigneeId: maya._id, status: 'done', dueDate: '2026-09-01', position: 0 },
    { boardId: privateBoard._id, title: 'Private roadmap notes', assignee: 'Noah', assigneeId: noah._id, status: 'todo', dueDate: '2026-09-15', position: 0 },
  ])
  console.log('Demo users, boards and tasks seeded')
}
