import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { AuthCard } from './LoginPage.jsx'

export default function RegisterPage() {
  const auth = useAuth(); const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  if (auth.user) return <Navigate to="/" replace />
  const update = (event) => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = async (event) => { event.preventDefault(); try { await auth.register(values); navigate('/', { replace: true }) } catch { /* shown below */ } }
  return <AuthCard title="Create your account" subtitle="Registration creates a private board you own."><form className="auth-form" onSubmit={submit}><label>Name<input name="name" value={values.name} onChange={update} minLength="2" required /></label><label>Email<input name="email" type="email" value={values.email} onChange={update} required /></label><label>Password<input name="password" type="password" value={values.password} onChange={update} minLength="8" required /></label>{auth.error && <p className="form-error">{auth.error.message}</p>}<Button type="submit" disabled={auth.loading}>{auth.loading ? 'Creating…' : 'Register'}</Button><p>Already registered? <Link to="/login">Log in</Link></p></form></AuthCard>
}
