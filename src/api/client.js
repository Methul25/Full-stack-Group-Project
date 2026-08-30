const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(payload, status) {
    super(payload?.message ?? 'The request failed')
    this.status = status
    this.code = payload?.code ?? 'REQUEST_FAILED'
    this.details = payload?.details ?? []
  }
}

export async function request(path, options = {}) {
  const token = localStorage.getItem('syncboard_token')
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
  if (response.status === 401 && !path.endsWith('/login')) {
    localStorage.removeItem('syncboard_token')
    window.dispatchEvent(new Event('auth:expired'))
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(body.error, response.status)
  }
  if (response.status === 204) return null
  return response.json()
}
