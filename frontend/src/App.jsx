import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import ProtectedRoute from '@/components/ProtectedRoute'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import MealPlanner from '@/pages/MealPlanner'
import MyRecipes from '@/pages/MyRecipes'
import Pantry from '@/pages/Pantry'
import RecipeDetail from '@/pages/RecipeDetail'
import RecipeGenerator from '@/pages/RecipeGenerator'
import Settings from '@/pages/Settings'
import Signup from '@/pages/Signup'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <Pantry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <RecipeGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <MyRecipes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plan"
          element={
            <ProtectedRoute>
              <MealPlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
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
