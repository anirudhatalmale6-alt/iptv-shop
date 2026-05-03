'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Trash2, Save, Upload, X, Star } from 'lucide-react'

interface OptionRow {
  name: string
  price: string
  screens: number
  duration: number
  popular: boolean
  sortOrder: number
}

export default function NewProductPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [active, setActive] = useState(true)
  const [options, setOptions] = useState<OptionRow[]>([])

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    setSlug(generateSlug(value))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        if (!image) {
          setImage(data.url)
        }
        setImages(prev => [...prev, data.url])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(img => img !== url))
    if (image === url) {
      const remaining = images.filter(img => img !== url)
      setImage(remaining.length > 0 ? remaining[0] : '')
    }
  }

  function setAsPrimary(url: string) {
    setImage(url)
  }

  function addOption() {
    setOptions([...options, { name: '', price: '', screens: 1, duration: 1, popular: false, sortOrder: options.length }])
  }

  function updateOption(index: number, field: keyof OptionRow, value: string | number | boolean) {
    setOptions(prev => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)))
  }

  function removeOption(index: number) {
    setOptions(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        name, slug, description,
        price: parseFloat(price),
        image: image || (images.length > 0 ? images[0] : null),
        images,
        active,
        options: options.filter(opt => opt.name.trim()).map(opt => ({
          name: opt.name,
          price: parseFloat(opt.price) || 0,
          screens: opt.screens,
          duration: opt.duration,
          popular: opt.popular,
          sortOrder: opt.sortOrder,
          active: true,
        })),
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create product')
        return
      }
      router.push('/admin/products')
    } catch { setError('Network error. Please try again.') }
    finally { setSaving(false) }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900"

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required className={inputClass} placeholder="e.g. Basic Pakket, MegaHD Pakket" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className={`${inputClass} bg-gray-50`} placeholder="product-slug" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className={`${inputClass} resize-y`} placeholder="Product description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (&euro;)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className={`${inputClass} max-w-xs`} placeholder="0.00" />
            </div>

            {/* Multi Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <div className="space-y-3">
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className={`relative w-24 h-24 rounded-xl border-2 overflow-hidden bg-gray-50 group ${img === image ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}`}>
                        <Image src={img} alt={`Product ${idx + 1}`} fill className="object-contain p-1" sizes="96px" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {img !== image && (
                            <button type="button" onClick={() => setAsPrimary(img)} className="p-1 bg-white rounded-full text-purple-600 hover:bg-purple-50" title="Set as primary">
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(img)} className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50" title="Remove">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {img === image && (
                          <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[10px] text-center py-0.5">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-500 hover:text-purple-500 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </button>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP or GIF. Max 5MB each. Select multiple.</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setActive(!active)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-gray-700">Active</span>
            </div>
          </div>
        </div>

        {/* Product Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pricing Options</h2>
              <p className="text-sm text-gray-500 mt-0.5">Set up pricing per duration and screen count</p>
            </div>
            <button type="button" onClick={addOption} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>

          {options.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No options yet. Add pricing options for different durations and screen counts.</p>
              <button type="button" onClick={addOption} className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium">+ Add first option</button>
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                      <input type="text" value={option.name} onChange={(e) => updateOption(index, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900" placeholder="e.g. 1 Maand Basic" />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Price (&euro;)</label>
                      <input type="number" step="0.01" min="0" value={option.price} onChange={(e) => updateOption(index, 'price', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900" placeholder="0.00" />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Screens</label>
                      <select value={option.screens} onChange={(e) => updateOption(index, 'screens', parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900">
                        <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                      </select>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                      <select value={option.duration} onChange={(e) => updateOption(index, 'duration', parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm text-gray-900">
                        <option value={1}>1 Month</option><option value={3}>3 Months</option><option value={6}>6 Months</option><option value={12}>12 Months</option>
                      </select>
                    </div>
                    <div className="col-span-6 sm:col-span-1 flex items-end">
                      <button type="button" onClick={() => updateOption(index, 'popular', !option.popular)} className={`p-2 rounded-lg transition-colors ${option.popular ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-500'}`} title="Popular">
                        <Star className={`w-4 h-4 ${option.popular ? 'fill-yellow-500' : ''}`} />
                      </button>
                    </div>
                    <div className="col-span-6 sm:col-span-1 flex items-end justify-end">
                      <button type="button" onClick={() => removeOption(index)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Create Product'}
          </button>
          <Link href="/admin/products" className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
