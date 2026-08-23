import { mockTasks } from '../data/mockTasks.js'

const ARTIFICIAL_DELAY = 650
let tasks = mockTasks.map((task) => ({ ...task }))

const wait = () => new Promise((resolve) => window.setTimeout(resolve, ARTIFICIAL_DELAY))

export async function getTasks({ fail = false } = {}) {
  await wait()
  if (fail) throw new Error('The mock service could not load your board.')
  return tasks.map((task) => ({ ...task }))
}

export async function createTask(task) {
  await wait()
  const created = { ...task, id: crypto.randomUUID() }
  tasks = [...tasks, created]
  return created
}

export async function updateTask(id, changes) {
  await wait()
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...changes } : task))
  return tasks.find((task) => task.id === id)
}

export async function deleteTask(id) {
  await wait()
  tasks = tasks.filter((task) => task.id !== id)
  return id
}
