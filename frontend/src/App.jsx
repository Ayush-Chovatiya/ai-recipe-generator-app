import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/pages/Login.jsx'
import SignupPage from '@/pages/Signup.jsx'

function App() {
  return (
    <div className="min-h-screen bg-muted/40">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  )
}

export default App
