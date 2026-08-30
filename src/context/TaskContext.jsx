import { useCallback, useEffect, useMemo, useReducer } from 'react'
import * as tasksApi from '../api/tasks.js'
import { initialState, taskReducer } from './taskReducer.js'
import { TaskContext } from './task-context.js'
import { useAuth } from '../hooks/useAuth.js'

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { user } = useAuth()

  const loadTasks = useCallback(async () => {
    dispatch({ type: 'load_started' })
    try { dispatch({ type: 'loaded', tasks: await tasksApi.getTasks() }) }
    catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }) }
  }, [])

  useEffect(() => { if (user) loadTasks(); else dispatch({ type: 'reset' }) }, [user, loadTasks])

  const actions = useMemo(() => ({
    async addTask(task) {
      dispatch({ type: 'saving' })
      try { const created = await tasksApi.createTask(task); dispatch({ type: 'added', task: created }); return created }
      catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }); throw error }
    },
    async moveTask(id, status) {
      dispatch({ type: 'saving' })
      try { dispatch({ type: 'updated', task: await tasksApi.updateTask(id, { status }) }) }
      catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }) }
    },
    async removeTask(id) {
      dispatch({ type: 'saving' })
      try { await tasksApi.deleteTask(id); dispatch({ type: 'deleted', id }) }
      catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }) }
    },
    setQuery: (query) => dispatch({ type: 'query_changed', query }),
    setAssignee: (assignee) => dispatch({ type: 'assignee_changed', assignee }),
    setStatus: (status) => dispatch({ type: 'status_changed', status }),
    clearFilters: () => dispatch({ type: 'filters_cleared' }),
    retry: loadTasks,
  }), [loadTasks])

  return <TaskContext.Provider value={{ state, actions }}>{children}</TaskContext.Provider>
}
