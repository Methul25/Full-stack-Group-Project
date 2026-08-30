import { columns } from '../../data/columns.js'
import { useTasks } from '../../hooks/useTasks.js'

export default function FilterBar() {
  const { state, actions } = useTasks()
  const assignees = [...new Set(state.tasks.map((task) => task.assignee))].sort()

  return (
    <section className="filterbar" aria-label="Filter tasks">
      <label className="search-field">
        <span className="sr-only">Search tasks</span>
        <span aria-hidden="true">⌕</span>
        <input value={state.query} onChange={(event) => actions.setQuery(event.target.value)} placeholder="Search tasks..." />
        {state.query && <button onClick={() => actions.setQuery('')} aria-label="Clear search">×</button>}
      </label>
      <label>
        <span>Assignee</span>
        <select value={state.assignee} onChange={(event) => actions.setAssignee(event.target.value)}>
          <option value="all">Everyone</option>
          {assignees.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select value={state.status} onChange={(event) => actions.setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
        </select>
      </label>
      {(state.query || state.assignee !== 'all' || state.status !== 'all') && <button className="clear-filters" onClick={actions.clearFilters}>Clear filters</button>}
    </section>
  )
}
