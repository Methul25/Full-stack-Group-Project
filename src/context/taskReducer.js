export const initialState = {
  tasks: [], loading: false, error: null, validationErrors: [], query: '', assignee: 'all', status: 'all', saving: false,
  online: navigator.onLine, syncing: false, pendingCount: 0, conflicts: [], syncError: null, lastSyncedAt: null, source: 'local',
}

export function taskReducer(state, action) {
  switch (action.type) {
    case 'load_started': return { ...state, loading: true, error: null, validationErrors: [] }
    case 'loaded': return { ...state, tasks: action.tasks, loading: false, error: null, validationErrors: [] }
    case 'hydrated': return { ...state, tasks: action.tasks, loading: false, source: 'local', pendingCount: action.pendingCount, conflicts: action.conflicts }
    case 'connection_changed': return { ...state, online: action.online }
    case 'sync_started': return { ...state, syncing: true, syncError: null }
    case 'synced': return { ...state, tasks: action.tasks, syncing: false, online: true, source: 'server', pendingCount: action.pendingCount, conflicts: action.conflicts, lastSyncedAt: new Date().toISOString() }
    case 'sync_failed': return { ...state, syncing: false, online: action.offline ? false : state.online, syncError: action.message }
    case 'conflicts_changed': return { ...state, conflicts: action.conflicts, saving: false }
    case 'pending_changed': return { ...state, pendingCount: action.pendingCount }
    case 'failed': return { ...state, loading: false, saving: false, error: action.message, validationErrors: action.details ?? [] }
    case 'saving': return { ...state, saving: true, error: null, validationErrors: [] }
    case 'added': return { ...state, saving: false, tasks: [...state.tasks, action.task], pendingCount: state.pendingCount + (action.task.syncState === 'pending' ? 1 : 0) }
    case 'updated': return { ...state, saving: false, tasks: state.tasks.map((task) => task.id === action.task.id ? action.task : task) }
    case 'deleted': return { ...state, saving: false, tasks: state.tasks.filter((task) => task.id !== action.id) }
    case 'query_changed': return { ...state, query: action.query }
    case 'assignee_changed': return { ...state, assignee: action.assignee }
    case 'status_changed': return { ...state, status: action.status }
    case 'filters_cleared': return { ...state, query: '', assignee: 'all', status: 'all' }
    case 'reset': return { ...initialState }
    default: throw new Error(`Unknown task action: ${action.type}`)
  }
}
