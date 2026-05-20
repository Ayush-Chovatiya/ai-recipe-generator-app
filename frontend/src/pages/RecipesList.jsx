import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getRecipes } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import AppHeader from '@/components/AppHeader'

function formatDietaryTags(tags) {
  if (!tags) {
    return []
  }

  if (Array.isArray(tags)) {
    return tags.filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

function RecipesListPage() {
  const [recipes, setRecipes] = useState([])
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadRecipes = async (query = '') => {
    setServerError('')
    setIsLoading(true)

    try {
      const result = await getRecipes(query ? { search: query } : {})
      setRecipes(result.recipes ?? [])
    } catch (error) {
      setServerError(
        error?.message ?? 'Unable to load recipes. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    loadRecipes(search)
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AppHeader />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Saved recipes
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage recipes you have saved.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find recipes</CardTitle>
            <CardDescription>
              Search by name or description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSearch}
              className="flex flex-wrap gap-3"
            >
              <Input
                type="text"
                placeholder="Search recipes"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-[220px] flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {serverError ? (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 py-6">
              <p className="text-sm text-muted-foreground">
                No recipes saved yet.
              </p>
              <Button asChild>
                <Link to="/app">Generate a recipe</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => {
              const tags = formatDietaryTags(recipe.dietary_tags)
              return (
                <Card key={recipe.id} className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle>{recipe.name}</CardTitle>
                    <CardDescription>
                      {recipe.description || 'No description provided.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {recipe.cuisine_type ? (
                        <span className="rounded-full bg-muted px-3 py-1">
                          {recipe.cuisine_type}
                        </span>
                      ) : null}
                      {recipe.cook_time ? (
                        <span className="rounded-full bg-muted px-3 py-1">
                          {recipe.cook_time} mins
                        </span>
                      ) : null}
                      {recipe.calories ? (
                        <span className="rounded-full bg-muted px-3 py-1">
                          {recipe.calories} kcal
                        </span>
                      ) : null}
                      {tags.map((tag) => (
                        <span
                          key={`${recipe.id}-${tag}`}
                          className="rounded-full bg-muted px-3 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button asChild variant="secondary" className="w-full">
                      <Link to={`/app/recipes/${recipe.id}`}>View details</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default RecipesListPage
