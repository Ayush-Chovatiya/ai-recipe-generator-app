import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChefHat, Lock, Mail } from 'lucide-react'

import {
  requestPasswordReset,
  resetPassword as resetPasswordRequest,
} from '@/lib/api'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const isConfirming = Boolean(token)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const title = useMemo(
    () => (isConfirming ? 'Create New Password' : 'Reset Password'),
    [isConfirming],
  )

  const handleRequestReset = async (event) => {
    event.preventDefault()
    setLoading(true)
    setResetUrl('')

    try {
      const result = await requestPasswordReset({ email })
      if (result?.resetUrl) {
        setResetUrl(result.resetUrl)
      }
      toast.success('If an account exists, a reset link has been sent.')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to request password reset.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPasswordRequest({ token, password })
      toast.success('Password updated. Please sign in.')
      navigate('/login')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-50 to-white px-4 py-8 sm:items-center sm:justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500">
            <ChefHat className="h-9 w-9 text-white" />
          </div>
          <h1 className="page-heading">{title}</h1>
          <p className="mt-2 text-gray-600">
            {isConfirming
              ? 'Choose a new password for your account'
              : 'Enter your email and we will send reset instructions'}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
          {isConfirming ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="form-control pl-11"
                    placeholder="********"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="form-control pl-11"
                    placeholder="********"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tap-target w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="form-control pl-11"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tap-target w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {resetUrl && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-medium">Development reset link</p>
              <Link
                to={resetUrl.replace(window.location.origin, '')}
                className="mt-2 block break-all text-emerald-700 underline"
              >
                {resetUrl}
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
