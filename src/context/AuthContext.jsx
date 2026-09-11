import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { AuthContext } from './auth-context.js'

const TOKEN_KEY = 'syncboard_token'
const USER_KEY = 'syncboard_user'

function cachedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) }
  catch { return null }
}

export function AuthProvider({ children }) {
  const token = localStorage.getItem(TOKEN_KEY)
  const [user, setUser] = useState(() => token ? cachedUser() : null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState(null)
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null); setError(null) }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    authApi.getMe()
      .then((nextUser) => { localStorage.setItem(USER_KEY, JSON.stringify(nextUser)); setUser(nextUser) })
      .catch((caught) => { if (caught.code !== 'NETWORK_ERROR') logout() })
      .finally(() => setLoading(false))
  }, [logout])
  useEffect(() => { window.addEventListener('auth:expired', logout); return () => window.removeEventListener('auth:expired', logout) }, [logout])

  const submit = useCallback(async (operation, values) => {
    setLoading(true); setError(null)
    try { const result = await operation(values); localStorage.setItem(TOKEN_KEY, result.token); localStorage.setItem(USER_KEY, JSON.stringify(result.user)); setUser(result.user); return result.user }
    catch (caught) { setError(caught); throw caught }
    finally { setLoading(false) }
  }, [])
  const value = useMemo(() => ({ user, loading, error, login: (values) => submit(authApi.login, values), register: (values) => submit(authApi.register, values), logout }), [user, loading, error, submit, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
