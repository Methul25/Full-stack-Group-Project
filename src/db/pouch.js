import PouchDB from 'pouchdb-browser'

const databases = new Map()
const taskKey = (id) => `task:${id}`

function dbFor(userId) {
  const safeUserId = userId.replace(/[^a-z0-9_-]/gi, '_')
  if (!databases.has(safeUserId)) databases.set(safeUserId, new PouchDB(`syncboard-${safeUserId}`))
  return databases.get(safeUserId)
}

async function upsert(db, id, build) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await db.get(id).catch((error) => error.status === 404 ? null : Promise.reject(error))
    try { return await db.put({ ...(current ?? { _id: id }), ...build(current) }) }
    catch (error) { if (error.status !== 409 || attempt === 2) throw error }
  }
}

async function range(db, prefix) {
  const result = await db.allDocs({ include_docs: true, startkey: prefix, endkey: `${prefix}\ufff0` })
  return result.rows.map((row) => row.doc)
}

export async function readLocalTasks(userId) {
  return (await range(dbFor(userId), 'task:')).map((document) => document.task)
}

export async function cacheTask(userId, task) {
  await upsert(dbFor(userId), taskKey(task.id), () => ({ type: 'task', task }))
  return task
}

export async function removeCachedTask(userId, taskId) {
  const db = dbFor(userId)
  const document = await db.get(taskKey(taskId)).catch((error) => error.status === 404 ? null : Promise.reject(error))
  if (document) await db.remove(document)
}

export async function reconcileServerTasks(userId, serverTasks) {
  const db = dbFor(userId)
  const localDocuments = await range(db, 'task:')
  const serverIds = new Set(serverTasks.map((task) => task.id))
  const dirtyIds = new Set(localDocuments.filter((document) => document.task.syncState).map((document) => document.task.id))
  await Promise.all(serverTasks.filter((task) => !dirtyIds.has(task.id)).map((task) => cacheTask(userId, task)))
  await Promise.all(localDocuments
    .filter((document) => !serverIds.has(document.task.id) && !dirtyIds.has(document.task.id))
    .map((document) => db.remove(document)))
  return readLocalTasks(userId)
}

export async function enqueueMutation(userId, mutation) {
  const id = `outbox:${Date.now()}:${crypto.randomUUID()}`
  await dbFor(userId).put({ _id: id, type: 'outbox', createdAt: new Date().toISOString(), ...mutation })
  return id
}

export async function readOutbox(userId) {
  return (await range(dbFor(userId), 'outbox:')).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function updateQueuedCreate(userId, taskId, changes) {
  const item = (await readOutbox(userId)).find((entry) => entry.operation === 'create' && entry.taskId === taskId)
  if (!item) return false
  await dbFor(userId).put({ ...item, changes: { ...item.changes, ...changes } })
  return true
}

export async function cancelQueuedCreate(userId, taskId) {
  const item = (await readOutbox(userId)).find((entry) => entry.operation === 'create' && entry.taskId === taskId)
  if (!item) return false
  await dbFor(userId).remove(item)
  return true
}

export async function removeOutboxItem(userId, item) {
  await dbFor(userId).remove(item)
}

export async function saveConflict(userId, conflict) {
  await upsert(dbFor(userId), `conflict:${conflict.taskId}`, () => ({ type: 'conflict', conflict }))
}

export async function readConflicts(userId) {
  return (await range(dbFor(userId), 'conflict:')).map((document) => document.conflict)
}

export async function removeConflict(userId, taskId) {
  const db = dbFor(userId)
  const document = await db.get(`conflict:${taskId}`).catch((error) => error.status === 404 ? null : Promise.reject(error))
  if (document) await db.remove(document)
}
