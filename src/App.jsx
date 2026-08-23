import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell/AppShell.jsx'
import BoardPage from './pages/BoardPage.jsx'
import NewTaskPage from './pages/NewTaskPage.jsx'
import TaskDetailPage from './pages/TaskDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<BoardPage />} />
        <Route path="/tasks/new" element={<NewTaskPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
