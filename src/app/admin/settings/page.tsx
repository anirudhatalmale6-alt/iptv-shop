'use client'

import { useState, useEffect } from 'react'
import { Save, TestTube } from 'lucide-react'

interface Settings {
  siteName: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  favicon: string
  taxEnabled: boolean
  taxRate: number
  taxName: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  smtpFrom: string
  smtpFromName: string
  stripePublicKey: string
  stripeSecretKey: string
  confirmEmailText: string
  currency: string
  currencySymbol: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setMessage('Settings saved!')
      } else {
        setMessage('Error saving settings')
      }
    } catch {
      setMessage('Error saving settings')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleTestEmail = async () => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: settings?.smtpFrom || 'test@test.com',
          subject: 'SMTP Test',
          message: 'This is a test email from the admin panel.',
        }),
      })
      if (res.ok) {
        setMessage('Test email sent!')
      } else {
        setMessage('Test email failed - check SMTP settings')
      }
    } catch {
      setMessage('Test email failed')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const update = (field: keyof Settings, value: string | number | boolean) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!settings) return <div className="p-6">Failed to load settings</div>

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'seo', label: 'SEO' },
    { id: 'tax', label: 'Tax' },
    { id: 'smtp', label: 'SMTP' },
    { id: 'stripe', label: 'Stripe' },
    { id: 'email-templates', label: 'Email Templates' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-100 text-purple-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input type="text" value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" value={settings.currency} onChange={(e) => update('currency', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input type="text" value={settings.currencySymbol} onChange={(e) => update('currencySymbol', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
              <input type="text" value={settings.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea rows={3} value={settings.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input type="text" value={settings.seoKeywords} onChange={(e) => update('seoKeywords', e.target.value)} placeholder="iptv, abonnement, live tv" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
              <input type="text" value={settings.favicon || ''} onChange={(e) => update('favicon', e.target.value)} placeholder="/favicon.ico" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Tax Settings</h2>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={settings.taxEnabled} onChange={(e) => update('taxEnabled', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
              <label className="text-sm font-medium text-gray-700">Enable Tax</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                <input type="text" value={settings.taxName} onChange={(e) => update('taxName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={(e) => update('taxRate', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'smtp' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">SMTP / Email Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input type="text" value={settings.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <input type="number" value={settings.smtpPort} onChange={(e) => update('smtpPort', parseInt(e.target.value) || 587)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP User</label>
                <input type="text" value={settings.smtpUser} onChange={(e) => update('smtpUser', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                <input type="password" value={settings.smtpPass} onChange={(e) => update('smtpPass', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input type="email" value={settings.smtpFrom} onChange={(e) => update('smtpFrom', e.target.value)} placeholder="info@iptv-shop.nl" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input type="text" value={settings.smtpFromName} onChange={(e) => update('smtpFromName', e.target.value)} placeholder="IPTV Shop" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <button
              onClick={handleTestEmail}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <TestTube className="w-4 h-4" />
              Send Test Email
            </button>
          </div>
        )}

        {activeTab === 'stripe' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Stripe Payment Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
              <input type="text" value={settings.stripePublicKey} onChange={(e) => update('stripePublicKey', e.target.value)} placeholder="pk_live_..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
              <input type="password" value={settings.stripeSecretKey} onChange={(e) => update('stripeSecretKey', e.target.value)} placeholder="sk_live_..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm" />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800"><strong>Important:</strong> Use test keys (pk_test_ / sk_test_) during development. Switch to live keys only when going to production.</p>
            </div>
          </div>
        )}

        {activeTab === 'email-templates' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Email Templates</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Email Text</label>
              <p className="text-xs text-gray-500 mb-2">This text is included in the order confirmation email sent to customers.</p>
              <textarea rows={6} value={settings.confirmEmailText} onChange={(e) => update('confirmEmailText', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
