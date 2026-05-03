'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface PlayerType {
  id: string
  name: string
  slug: string
  fields: { name: string; label: string }[]
  guideTitle: string | null
  sortOrder: number
  active: boolean
}

export default function AdminPlayerTypesPage() {
  const [playerTypes, setPlayerTypes] = useState<PlayerType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayerTypes()
  }, [])

  async function fetchPlayerTypes() {
    try {
      const res = await fetch('/api/player-types')
      if (res.ok) {
        const data = await res.json()
        setPlayerTypes(data)
      }
    } catch (error) {
      console.error('Error fetching player types:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(pt: PlayerType) {
    try {
      const res = await fetch(`/api/player-types/${pt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !pt.active }),
      })
      if (res.ok) {
        setPlayerTypes((prev) =>
          prev.map((p) => (p.id === pt.id ? { ...p, active: !p.active } : p))
        )
      }
    } catch (error) {
      console.error('Error toggling player type:', error)
    }
  }

  async function deletePlayerType(id: string) {
    if (!confirm('Are you sure you want to delete this player type?')) return

    try {
      const res = await fetch(`/api/player-types/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlayerTypes((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting player type:', error)
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Player Types</h1>
        <Link
          href="/admin/player-types/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Player Type
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {playerTypes.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No player types yet. Create your first player type.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Has Guide
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {playerTypes.map((pt) => (
                  <tr key={pt.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{pt.name}</p>
                      <p className="text-xs text-gray-500">{pt.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {Array.isArray(pt.fields) ? pt.fields.length : 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          pt.guideTitle
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {pt.guideTitle ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(pt)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pt.active ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pt.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/player-types/${pt.id}/edit`}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deletePlayerType(pt.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
