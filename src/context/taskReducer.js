export const initialState = {
  tasks: [], loading: false, error: null, validationErrors: [], query: '', assignee: 'all', status: 'all', saving: false,
}

export function taskReducer(state, action) {
  switch (action.type) {
    case 'load_started': return { ...state, loading: true, error: null, validationErrors: [] }
    case 'loaded': return { ...state, tasks: action.tasks, loading: false, error: null, validationErrors: [] }
    case 'failed': return { ...state, loading: false, saving: false, error: action.message, validationErrors: action.details ?? [] }
    case 'saving': return { ...state, saving: true, error: null, validationErrors: [] }
    case 'added': return { ...state, saving: false, tasks: [...state.tasks, action.task] }
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
