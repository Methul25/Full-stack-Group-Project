import { Link, NavLink } from 'react-router-dom'

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="SyncBoard home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>syncboard</span>
        </Link>
        <nav aria-label="Primary navigation">
          <NavLink to="/" end>Board</NavLink>
          <NavLink className="new-task-link" to="/tasks/new">Add task <span aria-hidden="true">+</span></NavLink>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
