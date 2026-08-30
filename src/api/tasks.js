import { request } from './client.js'

export async function getTasks(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
  return (await request(`/api/tasks?${query}`)).data
}

export async function getTask(id) { return (await request(`/api/tasks/${id}`)).data }
export async function createTask(task) { return (await request('/api/tasks', { method: 'POST', body: JSON.stringify(task) })).data }
export async function updateTask(id, changes) { return (await request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })).data }
export async function deleteTask(id) { await request(`/api/tasks/${id}`, { method: 'DELETE' }); return id }
