import { useState } from 'react'
import StatusView from '../components/StatusView/StatusView.jsx'
import { useBoard } from '../hooks/useBoard.js'

export default function TeamPage() {
  const board = useBoard()
  const [values, setValues] = useState({ email: '', role: 'editor' })
  const [notice, setNotice] = useState('')

  if (board.loading && !board.board) return <StatusView type="loading" title="Opening team" message="Loading board members…" />
  if (board.error && !board.board) return <StatusView type="error" title="Team unavailable" message={board.error.message} actionLabel="Try again" onAction={() => board.refresh()} />

  const submit = async (event) => {
    event.preventDefault()
    setNotice('')
    try {
      await board.addMember({ email: values.email.trim(), role: values.role })
      setValues({ email: '', role: 'editor' })
      setNotice('Member added to the board.')
    } catch { /* context displays the API error */ }
  }

  const updateRole = async (member, role) => {
    setNotice('')
    try { await board.updateMember(member.id, role); setNotice(`${member.name}'s role was updated.`) }
    catch { /* context displays the API error */ }
  }

  const remove = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this board?`)) return
    setNotice('')
    try { await board.removeMember(member.id); setNotice(`${member.name} was removed from the board.`) }
    catch { /* context displays the API error */ }
  }

  return (
    <div className="page team-page">
      <header><p className="eyebrow">Board access</p><h1>Team members</h1><p>Manage who can plan work, contribute updates, or view the board.</p></header>
      {board.isOwner && (
        <form className="member-form" onSubmit={submit}>
          <label>Email address<input type="email" required value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} placeholder="member@example.com" /></label>
          <label>Role<select value={values.role} onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))}><option value="editor">Editor</option><option value="viewer">Viewer</option></select></label>
          <button className="button button--primary" disabled={board.loading}>Add member</button>
        </form>
      )}
      {notice && <p className="form-success">{notice}</p>}
      {board.error && <p className="form-error">{board.error.message}</p>}
      {!board.isOwner && <p className="role-notice">Your role is <strong>{board.board?.currentUserRole}</strong>. Only the board owner can manage membership.</p>}
      <section className="member-list" aria-label="Board members">
        {board.board?.members.map((member) => (
          <article className="member-row" key={member.id}>
            <span className="avatar">{member.name[0]}</span>
            <div><strong>{member.name}</strong><span>{member.email}</span></div>
            {board.isOwner && member.role !== 'owner' ? (
              <><select aria-label={`Role for ${member.name}`} value={member.role} disabled={board.loading} onChange={(event) => updateRole(member, event.target.value)}><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button className="member-remove" disabled={board.loading} onClick={() => remove(member)}>Remove</button></>
            ) : <span className={`role-badge role-badge--${member.role}`}>{member.role}</span>}
          </article>
        ))}
      </section>
    </div>
  )
}
