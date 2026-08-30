import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import StatusView from '../StatusView/StatusView.jsx'

export default function ProtectedRoute({ children }) {
  const auth = useAuth()
  const location = useLocation()
  if (auth.loading) return <StatusView type="loading" title="Checking your session" message="Verifying your access token…" />
  if (!auth.user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
