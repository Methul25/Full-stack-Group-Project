import { Link, useParams } from 'react-router-dom'
import { columns } from '../data/mockTasks.js'
import { useTasks } from '../hooks/useTasks.js'
import StatusView from '../components/StatusView/StatusView.jsx'

export default function TaskDetailPage() {
  const { id } = useParams()
  const { state } = useTasks()
  if (state.loading)
    return (
      <StatusView
        type="loading"
        title="Opening task"
        message="Loading the task details…"
      />
    )
  const task = state.tasks.find((item) => item.id === id)
  if (!task)
    return (
      <StatusView
        type="empty"
        title="Task not found"
        message="This task may have been deleted, or the link may be incorrect."
      />
    )
  const column = columns.find((item) => item.id === task.status)
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/">
        ← Back to board
      </Link>
      <article className="detail-card">
        <div className="detail-kicker">
          <span style={{ background: column.accent }} />
          {column.label}
        </div>
        <h1>{task.title}</h1>
        <dl>
          <div>
            <dt>Assignee</dt>
            <dd>
              <span className="avatar">{task.assignee[0]}</span>
              {task.assignee}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{column.label}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>
              {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(
                'en-GB',
                { day: 'numeric', month: 'long', year: 'numeric' },
              )}
            </dd>
          </div>
        </dl>
      </article>
    </div>
  )
}
