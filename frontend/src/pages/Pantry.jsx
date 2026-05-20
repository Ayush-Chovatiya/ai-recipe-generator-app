import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, Plus, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import Navbar from '@/components/Navbar'
import {
  addPantryItem,
  deletePantryItem,
  getExpiringPantryItems,
  getPantryItems,
} from '@/lib/api'

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat',
  'Grains',
  'Spices',
  'Other',
]

function Pantry() {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expiringItems, setExpiringItems] = useState([])

  const loadPantry = async () => {
    try {
      const [itemsResult, expiringResult] = await Promise.all([
        getPantryItems(),
        getExpiringPantryItems(7),
      ])
      setItems(itemsResult.items ?? [])
      setExpiringItems(expiringResult.items ?? [])
    } catch (error) {
      toast.error(error?.message ?? 'Unable to load pantry items.')
    }
  }

  useEffect(() => {
    loadPantry()
  }, [])

  useEffect(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await deletePantryItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      getExpiringPantryItems(7)
        .then((result) => setExpiringItems(result.items ?? []))
        .catch(() => {})
      toast.success('Item deleted')
    } catch (error) {
      toast.error(error?.message ?? 'Unable to delete item.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pantry</h1>
            <p className="mt-1 text-gray-600">
              Manage your ingredients and track expiry dates
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>

        {expiringItems.length > 0 ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-900">
                  Items Expiring Soon
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  {expiringItems.length} item
                  {expiringItems.length > 1 ? 's' : ''} expiring within 7 days
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search ingredients..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <CategoryButton
                label="All"
                active={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')}
              />
              {CATEGORIES.map((category) => (
                <CategoryButton
                  key={category}
                  label={category}
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <PantryItemCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                isExpiring={expiringItems.some((exp) => exp.id === item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>

      {showAddModal ? (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newItem) => {
            setItems((prev) => [...prev, newItem])
            getExpiringPantryItems(7)
              .then((result) => setExpiringItems(result.items ?? []))
              .catch(() => {})
            setShowAddModal(false)
          }}
        />
      ) : null}
    </div>
  )
}

function CategoryButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

function PantryItemCard({ item, onDelete, isExpiring }) {
  const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date()

  return (
    <div
      className={`rounded-lg border bg-white p-4 transition-shadow hover:shadow-md ${
        isExpiring ? 'border-amber-300' : 'border-gray-200'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm capitalize text-gray-500">{item.category}</p>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-gray-400 transition-colors hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium text-gray-900">
            {item.quantity} {item.unit}
          </span>
        </div>

        {item.expiry_date ? (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span
              className={`${
                isExpired
                  ? 'font-medium text-red-600'
                  : isExpiring
                    ? 'font-medium text-amber-600'
                    : 'text-gray-600'
              }`}
            >
              {isExpired ? 'Expired' : 'Expires'}:{' '}
              {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
            </span>
          </div>
        ) : null}

        {item.is_running_low ? (
          <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            Running Low
          </span>
        ) : null}
      </div>
    </div>
  )
}

function AddItemModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pieces',
    category: 'Other',
    expiry_date: '',
    is_running_low: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        expiry_date: formData.expiry_date || null,
        is_running_low: formData.is_running_low,
      }
      const result = await addPantryItem(payload)
      toast.success('Item added to pantry')
      onSuccess(result.item)
    } catch (error) {
      toast.error(error?.message ?? 'Unable to add item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Pantry Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(event) =>
                  setFormData({ ...formData, quantity: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(event) =>
                  setFormData({ ...formData, unit: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="cups">Cups</option>
                <option value="tbsp">Tablespoons</option>
                <option value="tsp">Teaspoons</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(event) =>
                setFormData({ ...formData, category: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(event) =>
                setFormData({ ...formData, expiry_date: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="running-low"
              checked={formData.is_running_low}
              onChange={(event) =>
                setFormData({ ...formData, is_running_low: event.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="running-low" className="text-sm text-gray-700">
              Mark as running low
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Pantry
