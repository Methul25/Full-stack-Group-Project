import { request } from './client.js'

export async function getTasks(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
  let result = await request(`/api/tasks?${query}`)
  const tasks = [...result.data]
  if (query.has('page')) return tasks

  while (result.data.length > 0 && result.meta.page * result.meta.limit < result.meta.total) {
    query.set('page', String(result.meta.page + 1))
    result = await request(`/api/tasks?${query}`)
    tasks.push(...result.data)
  }
  return tasks
}

export async function getTask(id) { return (await request(`/api/tasks/${id}`)).data }
export async function createTask(task) { return (await request('/api/tasks', { method: 'POST', body: JSON.stringify(task) })).data }
export async function updateTask(id, changes, baseVersion) { return (await request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ ...changes, baseVersion }) })).data }
export async function deleteTask(id) { await request(`/api/tasks/${id}`, { method: 'DELETE' }); return id }
export async function getOverdueSummary(boardId) { return (await request(`/api/tasks/analytics/overdue${boardId ? `?boardId=${boardId}` : ''}`)).data }
