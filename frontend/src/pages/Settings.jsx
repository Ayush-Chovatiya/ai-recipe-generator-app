import { useEffect, useState } from 'react'
import { Lock, Save, Trash2, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import {
  changePassword,
  deleteAccount,
  getProfile,
  updatePreferences,
  updateProfile,
} from '@/lib/api'

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
]
const CUISINES = [
  'Any',
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

function Settings() {
  const { logout, updateAuthUser } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  })

  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    allergies: [],
    preferred_cuisines: [],
    default_servings: 4,
    measurement_unit: 'metric',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getProfile()
        setProfile({
          name: result.user?.name ?? '',
          email: result.user?.email ?? '',
        })
        setPreferences({
          dietary_restrictions: result.preferences?.dietary_restrictions || [],
          allergies: result.preferences?.allergies || [],
          preferred_cuisines: result.preferences?.preferred_cuisines || [],
          default_servings: result.preferences?.default_servings || 4,
          measurement_unit: result.preferences?.measurement_unit || 'metric',
        })
      } catch (error) {
        toast.error(error?.message ?? 'Unable to load profile.')
      }
    }

    loadProfile()
  }, [])

  const handleProfileUpdate = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const result = await updateProfile({
        name: profile.name,
        email: profile.email,
      })
      if (result?.user) {
        setProfile({
          name: result.user.name,
          email: result.user.email,
        })
        updateAuthUser(result.user)
      }
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesUpdate = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await updatePreferences(preferences)
      toast.success('Preferences updated successfully')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to update preferences.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      await changePassword({
        currPass: passwordData.currentPassword,
        newPass: passwordData.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error?.message ?? 'Unable to change password.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.',
      )
    ) {
      return
    }

    const confirmation = window.prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      await deleteAccount()
      toast.success('Account deleted successfully')
      logout()
      navigate('/login')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to delete account.')
    }
  }

  const toggleDietary = (option) => {
    setPreferences((prev) => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(option)
        ? prev.dietary_restrictions.filter((item) => item !== option)
        : [...prev.dietary_restrictions, option],
    }))
  }

  const toggleCuisine = (cuisine) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
        ? prev.preferred_cuisines.filter((item) => item !== cuisine)
        : [...prev.preferred_cuisines, cuisine],
    }))
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-container-narrow">
        <div className="mb-6 sm:mb-8">
          <h1 className="page-heading">Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          <div className="responsive-card">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile({ ...profile, name: event.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="form-control"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="responsive-card">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(event) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: event.target.value,
                    })
                  }
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(event) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: event.target.value,
                    })
                  }
                  className="form-control"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(event) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: event.target.value,
                    })
                  }
                  className="form-control"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50 sm:w-auto"
              >
                <Lock className="h-4 w-4" />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="responsive-card">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Dietary Preferences
            </h2>

            <form onSubmit={handlePreferencesUpdate} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDietary(option)}
                      className={`tap-target rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        preferences.dietary_restrictions.includes(option)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={preferences.allergies.join(', ')}
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      allergies: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g., peanuts, shellfish, soy"
                  className="form-control"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Preferred Cuisines
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`tap-target rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        preferences.preferred_cuisines.includes(cuisine)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Default Servings: {preferences.default_servings}
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={preferences.default_servings}
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      default_servings: parseInt(event.target.value, 10),
                    })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-emerald-500"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>12</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Measurement Unit
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences({ ...preferences, measurement_unit: 'metric' })
                    }
                    className={`tap-target rounded-lg px-4 py-2 font-medium transition-colors ${
                      preferences.measurement_unit === 'metric'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Metric (kg, L)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        measurement_unit: 'imperial',
                      })
                    }
                    className={`tap-target rounded-lg px-4 py-2 font-medium transition-colors ${
                      preferences.measurement_unit === 'imperial'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Imperial (lb, gal)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
            </div>

            <p className="mb-4 text-gray-600">
              Once you delete your account, there is no going back. All your
              recipes, meal plans, and data will be permanently deleted.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
