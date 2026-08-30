import { useState } from 'react'
import Button from '../Button/Button.jsx'

const initial = { title: '', assignee: 'Maya', status: 'todo', dueDate: '' }

export default function TaskForm({ onSubmit, saving, serverErrors = [] }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))

  const validate = () => {
    const next = {}
    if (!values.title.trim()) next.title = 'A title is required.'
    else if (values.title.trim().length < 3) next.title = 'Use at least 3 characters.'
    if (!values.dueDate) next.dueDate = 'Choose a due date.'
    else if (new Date(`${values.dueDate}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0))) next.dueDate = 'Due date cannot be in the past.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    try { await onSubmit({ ...values, title: values.title.trim() }) } catch { /* context renders the API error */ }
  }

  const serverError = (field) => serverErrors.find((item) => item.field === field)?.message

  return (
    <form className="task-form" onSubmit={submit} noValidate>
      <div className="form-section-heading"><span>01</span><div><h2>Task essentials</h2><p>Give the team enough context to act.</p></div></div>
      <label className="full-field">Task title <em>*</em>
        <input name="title" value={values.title} onChange={update} aria-invalid={Boolean(errors.title)} aria-describedby="title-error" placeholder="e.g. Review onboarding copy" autoFocus />
        {(errors.title || serverError('title')) && <small id="title-error">{errors.title || serverError('title')}</small>}
      </label>
      <div className="form-section-heading"><span>02</span><div><h2>Planning details</h2><p>Set ownership, urgency, and timing.</p></div></div>
      <div className="form-grid">
        <label>Assignee<select name="assignee" value={values.assignee} onChange={update}><option>Maya</option><option>Noah</option><option>Ava</option></select></label>
        <label>Status<select name="status" value={values.status} onChange={update}><option value="todo">To do</option><option value="doing">In progress</option><option value="done">Completed</option></select></label>
        <label>Due date <em>*</em><input type="date" name="dueDate" value={values.dueDate} onChange={update} aria-invalid={Boolean(errors.dueDate || serverError('dueDate'))} />{(errors.dueDate || serverError('dueDate')) && <small>{errors.dueDate || serverError('dueDate')}</small>}</label>
      </div>
      <div className="form-actions"><Button type="submit" disabled={saving}>{saving ? 'Creating task…' : 'Create task'}</Button></div>
    </form>
  )
}
