'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react'

interface OrderItem {
  id: string
  product: { name: string }
  option: { name: string } | null
  playerType: { name: string } | null
  playerMac: string | null
  playerDeviceKey: string | null
  quantity: number
  price: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  subtotal: string
  taxAmount: string
  total: string
  notes: string | null
  stripePaymentId: string | null
  confirmedAt: string | null
  createdAt: string
  items: OrderItem[]
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [resending, setResending] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    async function load() {
      const { id } = await params
      setOrderId(id)

      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) {
          setError('Order not found')
          return
        }
        const data = await res.json()
        setOrder(data)
        setNotes(data.notes || '')
      } catch {
        setError('Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  async function handleConfirm() {
    if (!confirm('Confirm this order?')) return
    setConfirming(true)

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      })

      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (err) {
      console.error('Error confirming order:', err)
    } finally {
      setConfirming(false)
    }
  }

  async function handleResendInvoice() {
    setResending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-invoice`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Invoice sent!')
      } else {
        alert(data.error || 'Failed to send invoice')
      }
    } catch {
      alert('Failed to send invoice')
    } finally {
      setResending(false)
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (err) {
      console.error('Error saving notes:', err)
    } finally {
      setSavingNotes(false)
    }
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
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

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
        <Link href="/admin/orders" className="text-purple-600 hover:text-purple-700 font-medium">
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        {statusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/30">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        {item.option && (
                          <p className="text-xs text-gray-500">Option: {item.option.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.playerType && (
                          <p className="text-xs text-gray-600">Player: {item.playerType.name}</p>
                        )}
                        {item.playerMac && (
                          <p className="text-xs text-gray-500 font-mono">MAC: {item.playerMac}</p>
                        )}
                        {item.playerDeviceKey && (
                          <p className="text-xs text-gray-500 font-mono">Key: {item.playerDeviceKey}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        &euro;{Number(item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <div className="flex justify-end space-y-1 text-sm">
                <div className="w-48">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">&euro;{Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(order.taxAmount) > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Tax</span>
                      <span className="text-gray-900">&euro;{Number(order.taxAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-t border-gray-200 font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">&euro;{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-900 resize-y text-sm"
              placeholder="Internal notes about this order..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer</h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-500">{order.customerEmail}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                {statusBadge(order.status)}
              </div>
              {order.stripePaymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Stripe ID</span>
                  <span className="text-gray-900 font-mono text-xs">{order.stripePaymentId}</span>
                </div>
              )}
              {order.confirmedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Confirmed</span>
                  <span className="text-gray-900 text-xs">{new Date(order.confirmedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
            <div className="space-y-2">
              {order.status === 'PAID' && (
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all text-sm disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {confirming ? 'Confirming...' : 'Confirm Order'}
                </button>
              )}
              <button
                onClick={handleResendInvoice}
                disabled={resending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all text-sm disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                {resending ? 'Sending...' : 'Resend Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
