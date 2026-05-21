import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import { deleteRecipe, getRecipe } from '@/lib/api'

const normalizeList = (value) => {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // fall through
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [servings, setServings] = useState(4)
  const [checkedIngredients, setCheckedIngredients] = useState(new Set())

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const result = await getRecipe(id)
        if (result?.recipe) {
          setRecipe(result.recipe)
          setServings(result.recipe.servings || 4)
        } else {
          toast.error('Recipe not found')
          navigate('/recipes')
        }
      } catch (error) {
        toast.error(error?.message ?? 'Unable to load recipe.')
        navigate('/recipes')
      }
    }

    loadRecipe()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return
    }

    try {
      await deleteRecipe(id)
      toast.success('Recipe deleted')
      navigate('/recipes')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to delete recipe.')
    }
  }

  const toggleIngredient = (index) => {
    const updated = new Set(checkedIngredients)
    if (updated.has(index)) {
      updated.delete(index)
    } else {
      updated.add(index)
    }
    setCheckedIngredients(updated)
  }

  const adjustQuantity = (originalQty, originalServings) => {
    if (!originalQty || !originalServings) {
      return originalQty
    }
    return ((originalQty * servings) / originalServings).toFixed(2)
  }

  if (!recipe) {
    return null
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const originalServings = recipe.servings || 4
  const instructions = normalizeList(recipe.instructions)
  const dietaryTags = normalizeList(recipe.dietary_tags)
  const userNotes = normalizeList(recipe.user_notes)

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-container-detail">
        <Link
          to="/recipes"
          className="tap-target mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Recipes
        </Link>

        <div className="responsive-card mb-6 sm:p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {recipe.name}
              </h1>
              {recipe.description ? (
                <p className="text-lg text-gray-600">{recipe.description}</p>
              ) : null}
            </div>
            <button
              onClick={handleDelete}
              className="tap-target flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {recipe.cuisine_type ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                {recipe.cuisine_type}
              </span>
            ) : null}
            {recipe.difficulty ? (
              <span
                className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
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
            {dietaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-gray-600 sm:gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">{totalTime} minutes</span>
            </div>
            {recipe.prep_time ? (
              <div className="text-sm">Prep: {recipe.prep_time} min</div>
            ) : null}
            {recipe.cook_time ? (
              <div className="text-sm">Cook: {recipe.cook_time} min</div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="responsive-card lg:sticky lg:top-24">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ingredients
                </h2>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Servings:</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="tap-target flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 font-medium transition-colors hover:bg-gray-200 sm:h-8 sm:w-8 sm:min-h-8 sm:min-w-8"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold text-gray-900">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="tap-target flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 font-medium transition-colors hover:bg-gray-200 sm:h-8 sm:w-8 sm:min-h-8 sm:min-w-8"
                  >
                    +
                  </button>
                  {servings !== originalServings ? (
                    <button
                      onClick={() => setServings(originalServings)}
                      className="tap-target inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                {(recipe.ingredients || []).map((ingredient, index) => {
                  const adjustedQty = adjustQuantity(
                    ingredient.quantity,
                    originalServings,
                  )
                  const isChecked = checkedIngredients.has(index)

                  return (
                    <label
                      key={`${ingredient.name}-${index}`}
                      className="group flex cursor-pointer items-start gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleIngredient(index)}
                        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span
                        className={`flex-1 ${
                          isChecked ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{adjustedQty}</span>{' '}
                        {ingredient.unit} {ingredient.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="responsive-card">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Instructions
              </h2>
              <ol className="space-y-4">
                {instructions.map((step, index) => (
                  <li key={`${index}-${step}`} className="flex gap-3 sm:gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="flex-1 pt-1 text-gray-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {recipe.nutrition ? (
              <div className="responsive-card">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Nutrition (per serving)
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <NutritionCard
                    label="Calories"
                    value={recipe.nutrition.calories}
                    unit="kcal"
                  />
                  <NutritionCard
                    label="Protein"
                    value={recipe.nutrition.protein}
                    unit="g"
                  />
                  <NutritionCard
                    label="Carbs"
                    value={recipe.nutrition.carbs}
                    unit="g"
                  />
                  <NutritionCard
                    label="Fats"
                    value={recipe.nutrition.fats}
                    unit="g"
                  />
                  <NutritionCard
                    label="Fiber"
                    value={recipe.nutrition.fiber}
                    unit="g"
                  />
                </div>
              </div>
            ) : null}

            {userNotes.length > 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
                <h3 className="mb-2 font-semibold text-emerald-900">
                  Notes
                </h3>
                <p className="text-emerald-800">{userNotes.join(' ')}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const NutritionCard = ({ label, value, unit }) => (
  <div className="rounded-lg bg-gray-50 p-3 text-center sm:p-4">
    <div className="text-xl font-bold text-gray-900 sm:text-2xl">
      {value}
      {unit}
    </div>
    <div className="mt-1 text-sm text-gray-600">{label}</div>
  </div>
)

export default RecipeDetail
