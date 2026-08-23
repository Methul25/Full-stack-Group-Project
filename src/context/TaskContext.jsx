import { useCallback, useEffect, useMemo, useReducer } from 'react'
import * as tasksApi from '../api/tasks.js'
import { initialState, taskReducer } from './taskReducer.js'
import { TaskContext } from './task-context.js'

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const loadTasks = useCallback(async (fail = false) => {
    dispatch({ type: 'load_started' })
    try { dispatch({ type: 'loaded', tasks: await tasksApi.getTasks({ fail }) }) }
    catch (error) { dispatch({ type: 'failed', message: error.message }) }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const actions = useMemo(() => ({
    async addTask(task) {
      dispatch({ type: 'saving' })
      try { const created = await tasksApi.createTask(task); dispatch({ type: 'added', task: created }); return created }
      catch (error) { dispatch({ type: 'failed', message: error.message }); throw error }
    },
    async moveTask(id, status) {
      dispatch({ type: 'saving' })
      try { dispatch({ type: 'updated', task: await tasksApi.updateTask(id, { status }) }) }
      catch (error) { dispatch({ type: 'failed', message: error.message }) }
    },
    async removeTask(id) {
      dispatch({ type: 'saving' })
      try { await tasksApi.deleteTask(id); dispatch({ type: 'deleted', id }) }
      catch (error) { dispatch({ type: 'failed', message: error.message }) }
    },
    setQuery: (query) => dispatch({ type: 'query_changed', query }),
    setAssignee: (assignee) => dispatch({ type: 'assignee_changed', assignee }),
    setStatus: (status) => dispatch({ type: 'status_changed', status }),
    clearFilters: () => dispatch({ type: 'filters_cleared' }),
    retry: loadTasks,
    simulateError: () => loadTasks(true),
  }), [loadTasks])

  return <TaskContext.Provider value={{ state, actions }}>{children}</TaskContext.Provider>
}
