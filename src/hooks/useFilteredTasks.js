import { useMemo } from 'react'
import { useTasks } from './useTasks.js'

export function useFilteredTasks() {
  const { state } = useTasks()
  return useMemo(
    () =>
      state.tasks.filter((task) => {
        const query = state.query.trim().toLowerCase()
        const matchesQuery = !query || task.title.toLowerCase().includes(query)
        const matchesAssignee =
          state.assignee === 'all' || task.assignee === state.assignee
        const matchesStatus =
          state.status === 'all' || task.status === state.status
        return matchesQuery && matchesAssignee && matchesStatus
      }),
    [state.tasks, state.query, state.assignee, state.status],
  )
}
