import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function LoginPage() {
  const auth = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  if (auth.user) return <Navigate to="/" replace />
  const submit = async (event) => { event.preventDefault(); try { await auth.login(values); navigate(location.state?.from?.pathname ?? '/', { replace: true }) } catch { /* shown below */ } }
  return <AuthCard title="Welcome back" subtitle="Log in to open your protected board."><form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required /></label><label>Password<input type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} required /></label>{auth.error && <p className="form-error">{auth.error.message}</p>}<Button type="submit" disabled={auth.loading}>{auth.loading ? 'Logging in…' : 'Log in'}</Button><p>New here? <Link to="/register">Create an account</Link></p></form></AuthCard>
}

export function AuthCard({ title, subtitle, children }) { return <div className="auth-page"><section className="auth-card"><p className="eyebrow">SyncBoard secure access</p><h1>{title}</h1><p>{subtitle}</p>{children}</section></div> }
