import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  ChefHat,
  Home,
  LogOut,
  Settings,
  UtensilsCrossed,
} from 'lucide-react'

import { useAuth } from '@/context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xl font-semibold text-gray-900"
        >
          <ChefHat className="h-7 w-7 text-emerald-500" />
          <span>AI Recipe Generator</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/dashboard" icon={<Home className="h-4 w-4" />} label="Dashboard" />
          <NavLink
            to="/pantry"
            icon={<UtensilsCrossed className="h-4 w-4" />}
            label="Pantry"
          />
          <NavLink to="/generate" icon={<ChefHat className="h-4 w-4" />} label="Generate" />
          <NavLink
            to="/recipes"
            icon={<UtensilsCrossed className="h-4 w-4" />}
            label="Recipes"
          />
          <NavLink
            to="/meal-plan"
            icon={<Calendar className="h-4 w-4" />}
            label="Meal Plan"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-600 sm:inline">
            {user?.name || user?.email}
          </span>
          <Link
            to="/settings"
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default Navbar
