const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(payload, status) {
    super(payload?.message ?? 'The request failed')
    this.status = status
    this.code = payload?.code ?? 'REQUEST_FAILED'
    this.details = payload?.details ?? []
  }
}

export class NetworkError extends Error {
  constructor() {
    super('The server is unreachable. Your changes are saved on this device.')
    this.code = 'NETWORK_ERROR'
  }
}

export async function request(path, options = {}) {
  const token = localStorage.getItem('syncboard_token')
  let response
  try {
    response = await fetch(BASE_URL + path, {
      ...options,
      headers: {
        ...(options.body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
  } catch {
    throw new NetworkError()
  }
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
