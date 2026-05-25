import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import MealPlanner from '@/pages/MealPlanner'
import MyRecipes from '@/pages/MyRecipes'
import Pantry from '@/pages/Pantry'
import RecipeDetail from '@/pages/RecipeDetail'
import RecipeGenerator from '@/pages/RecipeGenerator'
import ResetPassword from '@/pages/ResetPassword'
import Settings from '@/pages/Settings'
import Signup from '@/pages/Signup'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/generate" element={<RecipeGenerator />} />
          <Route path="/recipes" element={<MyRecipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/meal-plan" element={<MealPlanner />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App
