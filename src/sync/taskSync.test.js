import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/tasks.js', () => ({ deleteTask: vi.fn() }))
vi.mock('../db/pouch.js', () => ({
  cacheTask: vi.fn(),
  cancelQueuedCreate: vi.fn(),
  enqueueMutation: vi.fn(),
  readOutbox: vi.fn(),
  removeCachedTask: vi.fn(),
  removeConflict: vi.fn(),
  removeOutboxItem: vi.fn(),
  saveConflict: vi.fn(),
  updateQueuedCreate: vi.fn(),
}))

import * as tasksApi from '../api/tasks.js'
import { enqueueMutation, removeCachedTask } from '../db/pouch.js'
import { deleteOrQueue } from './taskSync.js'

const task = { id: '507f1f77bcf86cd799439011', title: 'Keep me', version: 0 }

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('navigator', { onLine: true })
})

describe('offline deletion', () => {
  it('keeps the cached task when the server rejects an online deletion', async () => {
    tasksApi.deleteTask.mockRejectedValue({ status: 403, code: 'FORBIDDEN' })
    await expect(deleteOrQueue('user-1', task)).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(removeCachedTask).not.toHaveBeenCalled()
    expect(enqueueMutation).not.toHaveBeenCalled()
  })

  it('removes the cache after a confirmed server deletion', async () => {
    tasksApi.deleteTask.mockResolvedValue(task.id)
    await deleteOrQueue('user-1', task)
    expect(removeCachedTask).toHaveBeenCalledWith('user-1', task.id)
  })

  it('queues and removes a task when the server is unreachable', async () => {
    tasksApi.deleteTask.mockRejectedValue({ code: 'NETWORK_ERROR' })
    await deleteOrQueue('user-1', task)
    expect(removeCachedTask).toHaveBeenCalledWith('user-1', task.id)
    expect(enqueueMutation).toHaveBeenCalledWith('user-1', { operation: 'delete', taskId: task.id, base: task })
  })
})
