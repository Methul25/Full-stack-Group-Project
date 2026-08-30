import { Link } from 'react-router-dom'
import Column from '../components/Column/Column.jsx'
import FilterBar from '../components/FilterBar/FilterBar.jsx'
import StatusView from '../components/StatusView/StatusView.jsx'
import { columns } from '../data/columns.js'
import { useFilteredTasks } from '../hooks/useFilteredTasks.js'
import { useTasks } from '../hooks/useTasks.js'

export default function BoardPage() {
  const { state, actions } = useTasks()
  const filteredTasks = useFilteredTasks()
  const activeFilters = state.query || state.assignee !== 'all' || state.status !== 'all'

  if (state.loading) return <StatusView type="loading" title="Loading your board" message="Fetching tasks from the API…" />
  if (state.error) return <StatusView type="error" title="Something went sideways" message={state.error} actionLabel="Try again" onAction={() => actions.retry()} />

  return (
    <div className="page board-page">
      <section className="board-heading">
        <div><p className="eyebrow">Product workspace</p><h1>Launch board</h1><p>Plan, build, and ship the next version together.</p></div>
      </section>
      <FilterBar />
      {filteredTasks.length === 0 ? (
        <StatusView type="empty" title={activeFilters ? 'No matching tasks' : 'Your board is ready'} message={activeFilters ? 'Try a different search or clear your filters.' : 'Create the first task to get this sprint moving.'} actionLabel={activeFilters ? 'Clear filters' : 'Create a task'} onAction={activeFilters ? actions.clearFilters : undefined} />
      ) : (
        <div className="board-grid">{columns.map((column) => <Column key={column.id} column={column} tasks={filteredTasks.filter((task) => task.status === column.id)} />)}</div>
      )}
      {!activeFilters && <Link className="floating-add" to="/tasks/new" aria-label="Create a new task">+</Link>}
    </div>
  )
}
