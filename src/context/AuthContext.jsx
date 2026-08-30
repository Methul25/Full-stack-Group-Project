import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { AuthContext } from './auth-context.js'

const TOKEN_KEY = 'syncboard_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))
  const [error, setError] = useState(null)
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(null); setError(null) }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    authApi.getMe().then(setUser).catch(logout).finally(() => setLoading(false))
  }, [logout])
  useEffect(() => { window.addEventListener('auth:expired', logout); return () => window.removeEventListener('auth:expired', logout) }, [logout])

  const submit = useCallback(async (operation, values) => {
    setLoading(true); setError(null)
    try { const result = await operation(values); localStorage.setItem(TOKEN_KEY, result.token); setUser(result.user); return result.user }
    catch (caught) { setError(caught); throw caught }
    finally { setLoading(false) }
  }, [])
  const value = useMemo(() => ({ user, loading, error, login: (values) => submit(authApi.login, values), register: (values) => submit(authApi.register, values), logout }), [user, loading, error, submit, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
