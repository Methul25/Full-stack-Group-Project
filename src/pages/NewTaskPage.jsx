import { Link, useNavigate } from 'react-router-dom'
import TaskForm from '../components/TaskForm/TaskForm.jsx'
import { useTasks } from '../hooks/useTasks.js'

export default function NewTaskPage() {
  const navigate = useNavigate()
  const { state, actions } = useTasks()
  const submit = async (task) => { const created = await actions.addTask(task); navigate(`/tasks/${created.id}`) }
  return (
    <div className="page form-page">
      <Link className="back-link" to="/">← Back to board</Link>
      <header><p className="eyebrow">New work item</p><h1>Create a task</h1><p>Turn an idea into a clear, owned piece of work.</p></header>
      {state.error && <p className="form-error">{state.error}</p>}
      <TaskForm onSubmit={submit} saving={state.saving} serverErrors={state.validationErrors} />
    </div>
  )
}
