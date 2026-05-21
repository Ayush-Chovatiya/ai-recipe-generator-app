import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChefHat, Clock, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import { deleteRecipe, getRecipes } from '@/lib/api'

const CUISINES = [
  'All',
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'Thai',
  'French',
  'Mediterranean',
  'American',
]
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard']

function MyRecipes() {
  const [recipes, setRecipes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [loading, setLoading] = useState(false)

  const loadRecipes = async (overrideFilters = {}) => {
    setLoading(true)
    try {
      const filters = {
        search: searchQuery,
        cuisine_type: selectedCuisine !== 'All' ? selectedCuisine : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        ...overrideFilters,
      }
      const result = await getRecipes(filters)
      setRecipes(result.recipes ?? [])
    } catch (error) {
      toast.error(
        error?.message ?? 'Unable to load recipes. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [selectedCuisine, selectedDifficulty])

  const handleSearch = (event) => {
    event.preventDefault()
    loadRecipes({ search: searchQuery })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return
    }

    try {
      await deleteRecipe(id)
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
      toast.success('Recipe deleted')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to delete recipe.')
    }
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-container">
        <div className="mb-6">
          <h1 className="page-heading">My Recipes</h1>
          <p className="mt-1 text-gray-600">
            Your collection of saved recipes
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <form className="flex flex-col gap-4 lg:flex-row" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search recipes..."
                className="form-control pl-10"
              />
            </div>

            <select
              value={selectedCuisine}
              onChange={(event) => setSelectedCuisine(event.target.value)}
              className="form-control lg:w-auto"
            >
              {CUISINES.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine === 'All' ? 'All Cuisines' : cuisine}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(event) => setSelectedDifficulty(event.target.value)}
              className="form-control lg:w-auto"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === 'All'
                    ? 'All Difficulties'
                    : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="tap-target rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {recipes.length} recipes
          </p>
        </div>

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 sm:p-12">
            Loading recipes...
          </div>
        ) : recipes.length > 0 ? (
          <div className="responsive-grid sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center sm:p-12">
            <ChefHat className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="mb-4 text-gray-500">No recipes yet</p>
            <Link
              to="/generate"
              className="tap-target inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Generate Your First Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function RecipeCard({ recipe, onDelete }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
        <ChefHat className="h-16 w-16 text-emerald-600" />
      </div>

      <div className="p-4 sm:p-5">
        <Link to={`/recipes/${recipe.id}`} className="mb-3 block">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-emerald-600">
            {recipe.name}
          </h3>
          {recipe.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {recipe.description}
            </p>
          ) : null}
        </Link>

        <div className="mb-4 flex flex-wrap gap-2">
          {recipe.cuisine_type ? (
            <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
              {recipe.cuisine_type}
            </span>
          ) : null}
          {recipe.difficulty ? (
            <span
              className={`rounded px-2 py-1 text-xs font-medium capitalize ${
                recipe.difficulty === 'easy'
                  ? 'bg-green-100 text-green-700'
                  : recipe.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {recipe.difficulty}
            </span>
          ) : null}
          {recipe.dietary_tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{totalTime} mins</span>
          </div>
          {recipe.calories ? <span>{recipe.calories} cal</span> : null}
        </div>

        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <Link
            to={`/recipes/${recipe.id}`}
            className="tap-target flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            View Recipe
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="tap-target flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyRecipes
