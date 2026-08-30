import { request } from './client.js'

export async function register(values) { return (await request('/api/auth/register', { method: 'POST', body: JSON.stringify(values) })).data }
export async function login(values) { return (await request('/api/auth/login', { method: 'POST', body: JSON.stringify(values) })).data }
export async function getMe() { return (await request('/api/auth/me')).data }
