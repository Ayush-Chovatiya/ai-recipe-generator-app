import { useEffect, useState } from 'react'
import { ChefHat, Plus, X } from 'lucide-react'
import { addDays, format, startOfWeek } from 'date-fns'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import { addMealPlan, deleteMealPlan, getRecipes, getWeeklyMealPlan } from '@/lib/api'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function MealPlanner() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()))
  const [mealPlan, setMealPlan] = useState({})
  const [recipes, setRecipes] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const startDate = format(weekStart, 'yyyy-MM-dd')
        const [mealResult, recipeResult] = await Promise.all([
          getWeeklyMealPlan(startDate),
          getRecipes({ limit: 100 }),
        ])

        const organized = {}
        ;(mealResult.mealPlans ?? []).forEach((meal) => {
          const dateKey = meal.meal_date
          if (!organized[dateKey]) {
            organized[dateKey] = {}
          }
          organized[dateKey][meal.meal_type] = meal
        })

        setMealPlan(organized)
        setRecipes(recipeResult.recipes ?? [])
      } catch (error) {
        toast.error(
          error?.message ?? 'Unable to load meal plan. Please try again.',
        )
      }
    }

    loadMealPlan()
  }, [weekStart])

  const handleAddMeal = (date, mealType) => {
    setSelectedSlot({ date, mealType })
    setShowAddModal(true)
  }

  const handleRemoveMeal = async (mealId) => {
    if (!window.confirm('Remove this meal from your plan?')) {
      return
    }

    try {
      await deleteMealPlan(mealId)
      const updatedPlan = { ...mealPlan }
      Object.keys(updatedPlan).forEach((date) => {
        Object.keys(updatedPlan[date]).forEach((type) => {
          if (updatedPlan[date][type].id === mealId) {
            delete updatedPlan[date][type]
          }
        })
      })
      setMealPlan(updatedPlan)
      toast.success('Meal removed')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to remove meal.')
    }
  }

  const getDayMeals = (dayIndex) => {
    const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd')
    return mealPlan[date] || {}
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-container">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="page-heading">Meal Planner</h1>
            <p className="mt-1 text-gray-600">Plan your weekly meals</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="tap-target rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Previous Week
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="tap-target rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600"
            >
              This Week
            </button>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="tap-target rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Next Week
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-sm text-gray-600">Week of</p>
          <p className="text-lg font-semibold text-gray-900">
            {format(weekStart, 'MMMM d')} -{' '}
            {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="table-scroll rounded-xl border border-gray-200 bg-white">
          <div className="min-w-[56rem] lg:min-w-0">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="border-r border-gray-200 p-4 font-semibold text-gray-700">
              Meal
            </div>
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={day}
                className="border-r border-gray-200 p-3 text-center last:border-r-0 sm:p-4"
              >
                <div className="font-semibold text-gray-900">{day}</div>
                <div className="text-sm text-gray-500">
                  {format(addDays(weekStart, index), 'MMM d')}
                </div>
              </div>
            ))}
          </div>

          {MEAL_TYPES.map((mealType) => (
            <div
              key={mealType}
              className="grid grid-cols-8 border-b border-gray-200 last:border-b-0"
            >
              <div className="border-r border-gray-200 bg-gray-50 p-4 font-medium capitalize text-gray-700">
                {mealType}
              </div>
              {DAYS_OF_WEEK.map((_, dayIndex) => {
                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd')
                const dayMeals = getDayMeals(dayIndex)
                const meal = dayMeals[mealType]

                return (
                  <div
                    key={`${mealType}-${dayIndex}`}
                    className="min-h-[100px] border-r border-gray-200 p-2 transition-colors hover:bg-gray-50 last:border-r-0 sm:p-3"
                  >
                    {meal ? (
                      <div className="group relative">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <p className="line-clamp-2 text-sm font-medium text-emerald-900">
                            {meal.recipe_name}
                          </p>
                          <button
                            onClick={() => handleRemoveMeal(meal.id)}
                            className="tap-target absolute right-1 top-1 flex items-center justify-center rounded bg-white p-1 text-gray-400 opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 sm:min-h-8 sm:min-w-8 lg:opacity-0 lg:group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddMeal(date, mealType)}
                        className="tap-target flex h-full w-full items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Plus className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Meals Planned</p>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(mealPlan).reduce(
                (acc, day) => acc + Object.keys(day).length,
                0,
              )}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Total Recipes</p>
            <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {format(weekStart, 'MMM d')} -{' '}
              {format(addDays(weekStart, 6), 'MMM d')}
            </p>
          </div>
        </div>
      </div>

      {showAddModal && selectedSlot ? (
        <AddMealModal
          date={selectedSlot.date}
          mealType={selectedSlot.mealType}
          recipes={recipes}
          onClose={() => {
            setShowAddModal(false)
            setSelectedSlot(null)
          }}
          onSuccess={(newMeal) => {
            const updatedPlan = { ...mealPlan }
            const date = selectedSlot.date
            if (!updatedPlan[date]) {
              updatedPlan[date] = {}
            }
            updatedPlan[date][selectedSlot.mealType] = newMeal
            setMealPlan(updatedPlan)
            setShowAddModal(false)
            setSelectedSlot(null)
          }}
        />
      ) : null}
    </div>
  )
}

function AddMealModal({ date, mealType, recipes, onClose, onSuccess }) {
  const [selectedRecipe, setSelectedRecipe] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedRecipe) {
      toast.error('Please select a recipe')
      return
    }

    setLoading(true)
    try {
      const result = await addMealPlan({
        recipe_id: selectedRecipe,
        meal_date: date,
        meal_type: mealType,
      })

      const recipe = recipes.find((item) => item.id === selectedRecipe)
      const newMeal = {
        ...result.mealPlan,
        recipe_name: recipe?.name ?? result.mealPlan.recipe_name,
      }

      toast.success('Meal added to plan')
      onSuccess(newMeal)
    } catch (error) {
      toast.error(error?.message ?? 'Unable to add meal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="custom-scrollbar max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
            <p className="text-sm capitalize text-gray-600">
              {format(new Date(date), 'EEEE, MMM d')} - {mealType}
            </p>
          </div>
          <button onClick={onClose} className="tap-target flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search recipes..."
              className="form-control"
            />
          </div>

          <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <label
                  key={recipe.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedRecipe === recipe.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="recipe"
                    value={recipe.id}
                    checked={selectedRecipe === recipe.id}
                    onChange={(event) => setSelectedRecipe(event.target.value)}
                    className="h-5 w-5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{recipe.name}</p>
                    {recipe.cuisine_type ? (
                      <p className="text-xs text-gray-500">
                        {recipe.cuisine_type}
                      </p>
                    ) : null}
                  </div>
                </label>
              ))
            ) : (
              <div className="py-8 text-center">
                <ChefHat className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No recipes found</p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="tap-target flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRecipe}
              className="tap-target flex-1 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MealPlanner
