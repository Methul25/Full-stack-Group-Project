import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell/AppShell.jsx'
import BoardPage from './pages/BoardPage.jsx'
import NewTaskPage from './pages/NewTaskPage.jsx'
import TaskDetailPage from './pages/TaskDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import { useBoard } from './hooks/useBoard.js'

function EditorRoute({ children }) {
  const board = useBoard()
  if (board.loading && !board.board) return null
  return board.canEdit ? children : <Navigate to="/team" replace />
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/tasks/new" element={<ProtectedRoute><EditorRoute><NewTaskPage /></EditorRoute></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
