'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

interface FieldRow {
  name: string
  label: string
  placeholder: string
  required: boolean
}

export default function NewPlayerTypePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [fields, setFields] = useState<FieldRow[]>([])
  const [guideTitle, setGuideTitle] = useState('')
  const [guideText, setGuideText] = useState('')
  const [guideImages, setGuideImages] = useState<string[]>([])

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    setSlug(generateSlug(value))
  }

  function addField() {
    setFields([...fields, { name: '', label: '', placeholder: '', required: false }])
  }

  function updateField(index: number, field: keyof FieldRow, value: string | boolean) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    )
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  function addGuideImage() {
    setGuideImages([...guideImages, ''])
  }

  function updateGuideImage(index: number, value: string) {
    setGuideImages((prev) => prev.map((img, i) => (i === index ? value : img)))
  }

  function removeGuideImage(index: number) {
    setGuideImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const body = {
        name,
        slug,
        fields: fields.filter((f) => f.name.trim()),
        guideTitle: guideTitle || null,
        guideText: guideText || null,
        guideImages: guideImages.filter((img) => img.trim()),
        sortOrder: 0,
        active: true,
      }

      const res = await fetch('/api/player-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create player type')
        return
      }

      router.push('/admin/player-types')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/player-types"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Player Type</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900"
                placeholder="e.g., MAG Box"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900 bg-gray-50"
                placeholder="mag-box"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
              <p className="text-sm text-gray-500 mt-0.5">Fields customers fill in during checkout</p>
            </div>
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-gray-500">No custom fields. Click &quot;Add Field&quot; to add fields like MAC address.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Field Name (key)</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900"
                        placeholder="mac"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900"
                        placeholder="MAC Address"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900"
                        placeholder="00:1A:79:XX:XX:XX"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.required}
                        onChange={(e) => updateField(index, 'required', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={`required-${index}`} className="text-sm text-gray-600">Required</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2 mt-5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guide Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Guide</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guide Title</label>
              <input
                type="text"
                value={guideTitle}
                onChange={(e) => setGuideTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900"
                placeholder="How to set up your MAG Box"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guide Text</label>
              <textarea
                value={guideText}
                onChange={(e) => setGuideText(e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900 resize-y"
                placeholder="Step-by-step instructions..."
              />
            </div>

            {/* Guide Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Guide Images</label>
                <button
                  type="button"
                  onClick={addGuideImage}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + Add Image
                </button>
              </div>
              {guideImages.length === 0 ? (
                <p className="text-sm text-gray-500">No guide images added.</p>
              ) : (
                <div className="space-y-2">
                  {guideImages.map((img, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => updateGuideImage(index, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900"
                        placeholder="https://example.com/guide-image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => removeGuideImage(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Create Player Type'}
          </button>
          <Link
            href="/admin/player-types"
            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
