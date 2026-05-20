import { createContext, useContext, useMemo, useState } from 'react'

import {
  clearAuthSession,
  getAuthSession,
  login as loginRequest,
  saveAuthSession,
  signup as signupRequest,
} from '@/lib/api'

const AuthContext = createContext(null)

function normalizeSession(session) {
  if (!session?.token) {
    return null
  }

  return { token: session.token, user: session.user ?? null }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getAuthSession())
  const [loading, setLoading] = useState(false)

  const value = useMemo(() => {
    const isAuthenticated = Boolean(session?.token)

    return {
      session,
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated,
      loading,
      login: async (email, password) => {
        setLoading(true)
        try {
          const nextSession = await loginRequest({ email, password })
          const normalized = normalizeSession(nextSession)
          if (normalized) {
            saveAuthSession(normalized)
            setSession(normalized)
          }
          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error?.message ?? 'Unable to sign in. Please try again.',
          }
        } finally {
          setLoading(false)
        }
      },
      register: async (name, email, password) => {
        setLoading(true)
        try {
          const nextSession = await signupRequest({ name, email, password })
          const normalized = normalizeSession(nextSession)
          if (normalized) {
            saveAuthSession(normalized)
            setSession(normalized)
          }
          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error?.message ?? 'Unable to sign up. Please try again.',
          }
        } finally {
          setLoading(false)
        }
      },
      setAuthSession: (nextSession) => {
        const normalized = normalizeSession(nextSession)
        if (normalized) {
          saveAuthSession(normalized)
          setSession(normalized)
        } else {
          clearAuthSession()
          setSession(null)
        }
      },
      signOut: () => {
        clearAuthSession()
        setSession(null)
      },
      logout: () => {
        clearAuthSession()
        setSession(null)
      },
    }
  }, [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
