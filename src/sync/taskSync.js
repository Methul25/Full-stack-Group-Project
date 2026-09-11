import * as tasksApi from '../api/tasks.js'
import { cacheTask, cancelQueuedCreate, enqueueMutation, readOutbox, removeCachedTask, removeConflict, removeOutboxItem, saveConflict, updateQueuedCreate } from '../db/pouch.js'

export const isNetworkError = (error) => error?.code === 'NETWORK_ERROR' || !navigator.onLine

function changedFields(base, current, changes) {
  return Object.keys(changes).filter((field) => JSON.stringify(base?.[field]) !== JSON.stringify(current?.[field]))
}

async function updateWithMerge(userId, task, changes) {
  try {
    const updated = await tasksApi.updateTask(task.id, changes, task.version)
    await cacheTask(userId, updated)
    return { task: updated }
  } catch (error) {
    if (error.code !== 'VERSION_CONFLICT') throw error
    const current = error.details?.current
    const collisions = changedFields(task, current, changes)
    if (current && collisions.length === 0) {
      const merged = await tasksApi.updateTask(task.id, changes, current.version)
      await cacheTask(userId, merged)
      return { task: merged, merged: true }
    }
    const conflict = { taskId: task.id, base: task, mine: changes, current, conflictingFields: collisions }
    await saveConflict(userId, conflict)
    await cacheTask(userId, { ...current, ...changes, id: task.id, syncState: 'conflict' })
    return { conflict }
  }
}

export async function createOrQueue(userId, input) {
  try {
    const task = await tasksApi.createTask(input)
    await cacheTask(userId, task)
    return task
  } catch (error) {
    if (!isNetworkError(error)) throw error
    const task = { id: `local-${crypto.randomUUID()}`, ...input, version: 0, syncState: 'pending' }
    await cacheTask(userId, task)
    await enqueueMutation(userId, { operation: 'create', taskId: task.id, changes: input })
    return task
  }
}

export async function updateOrQueue(userId, task, changes) {
  if (task.id.startsWith('local-')) {
    const pending = { ...task, ...changes, syncState: 'pending' }
    await cacheTask(userId, pending)
    await updateQueuedCreate(userId, task.id, changes)
    return { task: pending }
  }
  try { return await updateWithMerge(userId, task, changes) }
  catch (error) {
    if (!isNetworkError(error)) throw error
    const pending = { ...task, ...changes, syncState: 'pending' }
    await cacheTask(userId, pending)
    await enqueueMutation(userId, { operation: 'update', taskId: task.id, base: task, changes, baseVersion: task.version })
    return { task: pending }
  }
}

export async function deleteOrQueue(userId, task) {
  if (task.id.startsWith('local-')) {
    await removeCachedTask(userId, task.id)
    await cancelQueuedCreate(userId, task.id)
    return
  }
  try {
    await tasksApi.deleteTask(task.id)
    await removeCachedTask(userId, task.id)
  }
  catch (error) {
    if (!isNetworkError(error)) throw error
    await removeCachedTask(userId, task.id)
    await enqueueMutation(userId, { operation: 'delete', taskId: task.id, base: task })
  }
}

export async function flushOutbox(userId) {
  const items = await readOutbox(userId)
  for (const item of items) {
    try {
      if (item.operation === 'create') {
        const created = await tasksApi.createTask(item.changes)
        await removeCachedTask(userId, item.taskId)
        await cacheTask(userId, created)
      } else if (item.operation === 'update') {
        await updateWithMerge(userId, { ...item.base, version: item.baseVersion }, item.changes)
      } else if (item.operation === 'delete') {
        await tasksApi.deleteTask(item.taskId)
      }
      await removeOutboxItem(userId, item)
    } catch (error) {
      if (error.status === 404 && item.operation === 'delete') await removeOutboxItem(userId, item)
      else if (isNetworkError(error)) break
      else throw error
    }
  }
}

export async function resolveTaskConflict(userId, conflict, choice) {
  if (choice === 'server') {
    await cacheTask(userId, conflict.current)
    await removeConflict(userId, conflict.taskId)
    return conflict.current
  }
  const updated = await tasksApi.updateTask(conflict.taskId, conflict.mine, conflict.current.version)
  await cacheTask(userId, updated)
  await removeConflict(userId, conflict.taskId)
  return updated
}
