import { request } from './client.js'

export async function getCurrentBoard() {
  return (await request('/api/boards/current')).data
}

export async function addMember(input) {
  return (await request('/api/boards/current/members', { method: 'POST', body: JSON.stringify(input) })).data
}

export async function updateMember(userId, role) {
  return (await request(`/api/boards/current/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) })).data
}

export async function removeMember(userId) {
  return (await request(`/api/boards/current/members/${userId}`, { method: 'DELETE' })).data
}
