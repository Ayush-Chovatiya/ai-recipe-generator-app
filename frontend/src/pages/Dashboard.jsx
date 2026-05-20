import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChefHat, Clock, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import {
  getMealPlanStats,
  getPantryStats,
  getRecentRecipes,
  getRecipeStats,
  getUpcomingMeals,
} from '@/lib/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    pantryItems: 0,
    mealsThisWeek: 0,
  })
  const [recentRecipes, setRecentRecipes] = useState([])
  const [upcomingMeals, setUpcomingMeals] = useState([])

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const [recipeStats, pantryStats, mealStats, recent, upcoming] =
          await Promise.all([
            getRecipeStats(),
            getPantryStats(),
            getMealPlanStats(),
            getRecentRecipes(5),
            getUpcomingMeals(5),
          ])

        if (!isMounted) {
          return
        }

        setStats({
          totalRecipes: recipeStats?.stats?.total_recipes ?? 0,
          pantryItems: pantryStats?.stats?.total_items ?? 0,
          mealsThisWeek: mealStats?.stats?.this_week_count ?? 0,
        })
        setRecentRecipes(recent?.recipes ?? [])
        setUpcomingMeals(upcoming?.meals ?? [])
      } catch (error) {
        toast.error(
          error?.message ?? 'Unable to load dashboard. Please try again.',
        )
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back! Here&apos;s your cooking overview
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={<ChefHat className="h-6 w-6" />}
            label="Total Recipes"
            value={stats.totalRecipes}
            color="emerald"
          />
          <StatCard
            icon={<UtensilsCrossed className="h-6 w-6" />}
            label="Pantry Items"
            value={stats.pantryItems}
            color="blue"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="Meals This Week"
            value={stats.mealsThisWeek}
            color="purple"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            to="/generate"
            className="group rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 text-emerald-500 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white transition-transform group-hover:scale-110">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Generate Recipe</h3>
                <p className="text-sm text-emerald-800">
                  Create AI-powered recipes
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/pantry"
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 transition-transform group-hover:scale-110">
                <UtensilsCrossed className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Pantry
                </h3>
                <p className="text-sm text-gray-600">
                  Add and track ingredients
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Recipes
              </h2>
              <Link
                to="/recipes"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
              </Link>
            </div>

            {recentRecipes.length > 0 ? (
              <div className="space-y-3">
                {recentRecipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipes/${recipe.id}`}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                      <ChefHat className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-gray-900">
                        {recipe.name}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {recipe.cook_time} mins
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                No recipes yet. Generate your first one!
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Meals
              </h2>
              <Link
                to="/meal-plan"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View calendar
              </Link>
            </div>

            {upcomingMeals.length > 0 ? (
              <div className="space-y-3">
                {upcomingMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-gray-900">
                        {meal.recipe_name}
                      </h3>
                      <p className="text-sm capitalize text-gray-500">
                        {meal.meal_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                No meals planned yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
