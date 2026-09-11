import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BoardProvider } from './context/BoardContext.jsx'
import './styles/index.css'
import { registerServiceWorker } from './utils/registerServiceWorker.js'

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
