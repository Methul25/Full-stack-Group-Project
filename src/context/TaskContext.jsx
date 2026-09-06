import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import * as tasksApi from '../api/tasks.js'
import { readConflicts, readLocalTasks, readOutbox, reconcileServerTasks } from '../db/pouch.js'
import { useAuth } from '../hooks/useAuth.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import { createOrQueue, deleteOrQueue, flushOutbox, isNetworkError, resolveTaskConflict, updateOrQueue } from '../sync/taskSync.js'
import { initialState, taskReducer } from './taskReducer.js'
import { TaskContext } from './task-context.js'

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { user } = useAuth()
  const online = useOnlineStatus()
  const syncing = useRef(false)

  const hydrate = useCallback(async () => {
    if (!user) return []
    const [tasks, outbox, conflicts] = await Promise.all([readLocalTasks(user.id), readOutbox(user.id), readConflicts(user.id)])
    dispatch({ type: 'hydrated', tasks, pendingCount: outbox.length, conflicts })
    return tasks
  }, [user])

  const syncNow = useCallback(async () => {
    if (!user || !navigator.onLine || syncing.current) return
    syncing.current = true
    dispatch({ type: 'sync_started' })
    try {
      await flushOutbox(user.id)
      const serverTasks = await tasksApi.getTasks()
      const tasks = await reconcileServerTasks(user.id, serverTasks)
      const [outbox, conflicts] = await Promise.all([readOutbox(user.id), readConflicts(user.id)])
      dispatch({ type: 'synced', tasks, pendingCount: outbox.length, conflicts })
      return tasks
    } catch (error) {
      dispatch({ type: 'sync_failed', message: error.message, offline: isNetworkError(error) })
    } finally {
      syncing.current = false
    }
  }, [user])

  useEffect(() => { dispatch({ type: 'connection_changed', online }) }, [online])
  useEffect(() => {
    if (!user) { dispatch({ type: 'reset' }); return }
    dispatch({ type: 'load_started' })
    hydrate().then(() => { if (navigator.onLine) syncNow() }).catch((error) => dispatch({ type: 'failed', message: error.message }))
  }, [user, hydrate, syncNow])
  useEffect(() => { if (online && user) syncNow() }, [online, user, syncNow])

  const actions = useMemo(() => ({
    async addTask(input) {
      dispatch({ type: 'saving' })
      try { const task = await createOrQueue(user.id, input); dispatch({ type: 'added', task }); return task }
      catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }); throw error }
    },
    async moveTask(id, status) {
      const current = state.tasks.find((task) => task.id === id)
      if (!current) return
      dispatch({ type: 'saving' })
      try {
        const result = await updateOrQueue(user.id, current, { status })
        if (result.task) dispatch({ type: 'updated', task: result.task })
        if (result.conflict) dispatch({ type: 'conflicts_changed', conflicts: [...state.conflicts.filter((item) => item.taskId !== id), result.conflict] })
        dispatch({ type: 'pending_changed', pendingCount: (await readOutbox(user.id)).length })
      } catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }) }
    },
    async removeTask(id) {
      const current = state.tasks.find((task) => task.id === id)
      if (!current) return
      dispatch({ type: 'saving' })
      try { await deleteOrQueue(user.id, current); dispatch({ type: 'deleted', id }); dispatch({ type: 'pending_changed', pendingCount: (await readOutbox(user.id)).length }) }
      catch (error) { dispatch({ type: 'failed', message: error.message, details: error.details }) }
    },
    async resolveConflict(taskId, choice) {
      const conflict = state.conflicts.find((item) => item.taskId === taskId)
      if (!conflict) return
      dispatch({ type: 'saving' })
      try {
        const task = await resolveTaskConflict(user.id, conflict, choice)
        dispatch({ type: 'updated', task })
        dispatch({ type: 'conflicts_changed', conflicts: state.conflicts.filter((item) => item.taskId !== taskId) })
      } catch (error) { dispatch({ type: 'failed', message: error.message }) }
    },
    setQuery: (query) => dispatch({ type: 'query_changed', query }),
    setAssignee: (assignee) => dispatch({ type: 'assignee_changed', assignee }),
    setStatus: (status) => dispatch({ type: 'status_changed', status }),
    clearFilters: () => dispatch({ type: 'filters_cleared' }),
    retry: syncNow,
  }), [state.tasks, state.conflicts, user, syncNow])

  return <TaskContext.Provider value={{ state, actions }}>{children}</TaskContext.Provider>
}
