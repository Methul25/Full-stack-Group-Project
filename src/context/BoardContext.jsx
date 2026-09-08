import { useCallback, useEffect, useMemo, useState } from 'react'
import * as boardsApi from '../api/boards.js'
import { useAuth } from '../hooks/useAuth.js'
import { BoardContext } from './board-context.js'

const cacheKey = (userId) => `syncboard_board_${userId}`
const readCachedBoard = (userId) => {
  try { return JSON.parse(localStorage.getItem(cacheKey(userId))) }
  catch { return null }
}

export function BoardProvider({ children }) {
  const { user } = useAuth()
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) return null
    setLoading(true)
    setError(null)
    try {
      const nextBoard = await boardsApi.getCurrentBoard()
      setBoard(nextBoard)
      localStorage.setItem(cacheKey(user.id), JSON.stringify(nextBoard))
      return nextBoard
    } catch (caught) {
      setError(caught)
      throw caught
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) { setBoard(null); setError(null); return }
    setBoard(readCachedBoard(user.id))
    refresh().catch(() => {})
  }, [user, refresh])

  const changeMembers = useCallback(async (operation) => {
    setLoading(true)
    setError(null)
    try {
      const nextBoard = await operation()
      setBoard(nextBoard)
      localStorage.setItem(cacheKey(user.id), JSON.stringify(nextBoard))
      return nextBoard
    } catch (caught) {
      setError(caught)
      throw caught
    } finally {
      setLoading(false)
    }
  }, [user])

  const value = useMemo(() => ({
    board,
    loading,
    error,
    isOwner: board?.currentUserRole === 'owner',
    canEdit: board?.currentUserRole === 'owner' || board?.currentUserRole === 'editor',
    refresh,
    addMember: (input) => changeMembers(() => boardsApi.addMember(input)),
    updateMember: (userId, role) => changeMembers(() => boardsApi.updateMember(userId, role)),
    removeMember: (userId) => changeMembers(() => boardsApi.removeMember(userId)),
  }), [board, loading, error, refresh, changeMembers])

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}
