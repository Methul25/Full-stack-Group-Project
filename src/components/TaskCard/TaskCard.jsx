import { Link } from 'react-router-dom'
import { columns } from '../../data/mockTasks.js'
import { useTasks } from '../../hooks/useTasks.js'
import Button from '../Button/Button.jsx'

export default function TaskCard({ task }) {
  const { state, actions } = useTasks()
  const index = columns.findIndex((column) => column.id === task.status)
  const due = new Date(`${task.dueDate}T00:00:00`)
  const overdue = task.status !== 'done' && due < new Date(new Date().setHours(0, 0, 0, 0))

  const confirmDelete = () => {
    if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) actions.removeTask(task.id)
  }

  return (
    <article className="task-card">
      <div className="task-card-topline">
        <span className="task-assignee">{task.assignee}</span>
        <button className="delete-button" onClick={confirmDelete} disabled={state.saving} aria-label={`Delete ${task.title}`}>×</button>
      </div>
      <Link to={`/tasks/${task.id}`}><h3>{task.title}</h3></Link>
      <div className="task-meta">
        <span className="avatar" title={`Assigned to ${task.assignee}`}>{task.assignee[0]}</span>
        <span className={overdue ? 'overdue' : ''}>{overdue ? 'Overdue · ' : ''}{due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>
      <div className="move-actions" aria-label={`Move ${task.title}`}>
        <Button size="sm" variant="ghost" disabled={index === 0 || state.saving} onClick={() => actions.moveTask(task.id, columns[index - 1]?.id)}>←</Button>
        <span>Move</span>
        <Button size="sm" variant="ghost" disabled={index === columns.length - 1 || state.saving} onClick={() => actions.moveTask(task.id, columns[index + 1]?.id)}>→</Button>
      </div>
    </article>
  )
}
