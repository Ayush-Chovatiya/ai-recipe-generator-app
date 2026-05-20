const DEFAULT_API_BASE_URL = 'http://localhost:5000'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getAuthSession() {
  const token = getAuthToken()
  if (!token) {
    return null
  }

  const rawUser = localStorage.getItem(AUTH_USER_KEY)
  let user = null
  if (rawUser) {
    try {
      user = JSON.parse(rawUser)
    } catch {
      user = null
    }
  }

  return { token, user }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

async function request(path, options = {}) {
  const authToken = getAuthToken()
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload?.message || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return payload
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export async function login(payload) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function signup(payload) {
  const result = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function generateRecipe(payload) {
  const result = await request('/api/recipes/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function getPantrySuggestions() {
  const result = await request('/api/recipes/suggestions')

  return result.data
}

export async function saveRecipe(payload) {
  const result = await request('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function getRecipes(params = {}) {
  const result = await request(`/api/recipes${buildQuery(params)}`)

  return result.data
}

export async function getRecipe(id) {
  const result = await request(`/api/recipes/${id}`)

  return result.data
}

export async function deleteRecipe(id) {
  const result = await request(`/api/recipes/${id}`, {
    method: 'DELETE',
  })

  return result.data
}

export async function getRecipeStats() {
  const result = await request('/api/recipes/stats')

  return result.data
}

export async function getRecentRecipes(limit = 5) {
  const result = await request(`/api/recipes/recent${buildQuery({ limit })}`)

  return result.data
}

export async function getProfile() {
  const result = await request('/api/user/profile')

  return result.data
}

export async function updateProfile(payload) {
  const result = await request('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function updatePreferences(payload) {
  const result = await request('/api/user/preferences', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function changePassword(payload) {
  const result = await request('/api/user/change-password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function deleteAccount() {
  const result = await request('/api/user/account', {
    method: 'DELETE',
  })

  return result.data
}

export async function getPantryItems(params = {}) {
  const result = await request(`/api/pantry${buildQuery(params)}`)

  return result.data
}

export async function getPantryStats() {
  const result = await request('/api/pantry/stats')

  return result.data
}

export async function getExpiringPantryItems(days = 7) {
  const result = await request(
    `/api/pantry/expiring-soon${buildQuery({ days })}`,
  )

  return result.data
}

export async function addPantryItem(payload) {
  const result = await request('/api/pantry', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function updatePantryItem(id, payload) {
  const result = await request(`/api/pantry/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function deletePantryItem(id) {
  const result = await request(`/api/pantry/${id}`, {
    method: 'DELETE',
  })

  return result.data
}

export async function getWeeklyMealPlan(startDate) {
  const result = await request(
    `/api/meal-plans/weekly${buildQuery({ start_date: startDate })}`,
  )

  return result.data
}

export async function getUpcomingMeals(limit = 5) {
  const result = await request(`/api/meal-plans/upcoming${buildQuery({ limit })}`)

  return result.data
}

export async function getMealPlanStats() {
  const result = await request('/api/meal-plans/stats')

  return result.data
}

export async function addMealPlan(payload) {
  const result = await request('/api/meal-plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return result.data
}

export async function deleteMealPlan(id) {
  const result = await request(`/api/meal-plans/${id}`, {
    method: 'DELETE',
  })

  return result.data
}

export function saveAuthSession(session) {
  if (!session?.token) {
    clearAuthSession()
    return null
  }

  localStorage.setItem(AUTH_TOKEN_KEY, session.token)
  if (session.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user))
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
  }

  return { token: session.token, user: session.user ?? null }
}
