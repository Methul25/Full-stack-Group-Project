import { useContext } from 'react'
import { BoardContext } from '../context/board-context.js'

export function useBoard() {
  const value = useContext(BoardContext)
  if (!value) throw new Error('useBoard must be used inside BoardProvider')
  return value
}
