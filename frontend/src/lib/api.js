const DEFAULT_API_BASE_URL = 'http://localhost:5000'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

export function saveAuthSession(session) {
  if (!session?.token) {
    return
  }

  localStorage.setItem('auth_token', session.token)
  if (session.user) {
    localStorage.setItem('auth_user', JSON.stringify(session.user))
  }
}
