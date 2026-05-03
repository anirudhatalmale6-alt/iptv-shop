'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
  sortOrder: number
  active: boolean
}

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)

  // Form state
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch('/api/faq')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching FAQ:', error)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(item: FaqItem) {
    setEditingId(item.id)
    setQuestion(item.question)
    setAnswer(item.answer)
    setSortOrder(item.sortOrder)
    setShowNew(false)
  }

  function startNew() {
    setShowNew(true)
    setEditingId(null)
    setQuestion('')
    setAnswer('')
    setSortOrder(items.length)
  }

  function cancelEdit() {
    setEditingId(null)
    setShowNew(false)
    setQuestion('')
    setAnswer('')
    setSortOrder(0)
  }

  async function handleSave() {
    if (!question.trim() || !answer.trim()) return
    setSaving(true)

    try {
      if (editingId) {
        const res = await fetch(`/api/faq/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, answer, sortOrder }),
        })
        if (res.ok) {
          const updated = await res.json()
          setItems((prev) => prev.map((item) => (item.id === editingId ? updated : item)))
          cancelEdit()
        }
      } else {
        const res = await fetch('/api/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, answer, sortOrder }),
        })
        if (res.ok) {
          const newItem = await res.json()
          setItems((prev) => [...prev, newItem])
          cancelEdit()
        }
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this FAQ item?')) return

    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        if (editingId === id) cancelEdit()
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* New / Edit Form */}
      {(showNew || editingId) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit FAQ Item' : 'New FAQ Item'}
            </h2>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900"
                placeholder="What is your question?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900 resize-y"
                placeholder="The answer to the question..."
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !question.trim() || !answer.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {items.length === 0 && !showNew ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
            No FAQ items yet. Click &quot;Add FAQ&quot; to create one.
          </div>
        ) : (
          items
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-colors ${
                  editingId === item.id ? 'border-purple-300 bg-purple-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {item.sortOrder}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{item.question}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
