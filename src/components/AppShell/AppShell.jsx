import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export default function AppShell({ children }) {
  const auth = useAuth()
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="SyncBoard home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>syncboard</span>
        </Link>
        <nav aria-label="Primary navigation">
          {auth.user ? <><NavLink to="/" end>Board</NavLink><NavLink className="new-task-link" to="/tasks/new">Add task <span aria-hidden="true">+</span></NavLink><span className="signed-in-user">{auth.user.name}</span><button className="logout-button" onClick={auth.logout}>Log out</button></> : <><NavLink to="/login">Log in</NavLink><NavLink to="/register">Register</NavLink></>}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
