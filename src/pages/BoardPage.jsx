import { Link } from 'react-router-dom'
import Column from '../components/Column/Column.jsx'
import FilterBar from '../components/FilterBar/FilterBar.jsx'
import StatusView from '../components/StatusView/StatusView.jsx'
import SyncStatus from '../components/SyncStatus/SyncStatus.jsx'
import ConflictResolver from '../components/ConflictResolver/ConflictResolver.jsx'
import { columns } from '../data/columns.js'
import { useFilteredTasks } from '../hooks/useFilteredTasks.js'
import { useTasks } from '../hooks/useTasks.js'
import { useBoard } from '../hooks/useBoard.js'

export default function BoardPage() {
  const { state, actions } = useTasks()
  const board = useBoard()
  const filteredTasks = useFilteredTasks()
  const activeFilters = state.query || state.assignee !== 'all' || state.status !== 'all'

  if (state.loading && state.tasks.length === 0) return <StatusView type="loading" title="Opening your board" message="Reading saved tasks from this device…" />
  if (state.error && state.tasks.length === 0) return <StatusView type="error" title="Something went sideways" message={state.error} actionLabel="Try again" onAction={() => actions.retry()} />

  return (
    <div className="page board-page">
      <section className="board-heading">
        <div><p className="eyebrow">Product workspace</p><h1>Launch board</h1><p>Plan, build, and ship the next version together.</p></div>
        <SyncStatus online={state.online} syncing={state.syncing} pendingCount={state.pendingCount} syncError={state.syncError} lastSyncedAt={state.lastSyncedAt} onRetry={actions.retry} />
      </section>
      {!state.online && <p className="offline-banner">You are offline. The board is running from PouchDB and changes will sync automatically.</p>}
      <ConflictResolver conflicts={state.conflicts} onResolve={actions.resolveConflict} disabled={state.saving} />
      <FilterBar />
      {filteredTasks.length === 0 ? (
        <StatusView type="empty" title={activeFilters ? 'No matching tasks' : 'Your board is ready'} message={activeFilters ? 'Try a different search or clear your filters.' : 'Create the first task to get this sprint moving.'} actionLabel={activeFilters ? 'Clear filters' : 'Create a task'} onAction={activeFilters ? actions.clearFilters : undefined} />
      ) : (
        <div className="board-grid">{columns.map((column) => <Column key={column.id} column={column} tasks={filteredTasks.filter((task) => task.status === column.id)} />)}</div>
      )}
      {!activeFilters && board.canEdit && <Link className="floating-add" to="/tasks/new" aria-label="Create a new task">+</Link>}
    </div>
  )
}
