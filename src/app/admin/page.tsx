'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, DollarSign, CheckCircle, Clock } from 'lucide-react'

interface OrderStats {
  totalOrders: number
  paidCount: number
  confirmedCount: number
  totalRevenue: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  total: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    paidCount: 0,
    confirmedCount: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/orders?limit=10')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentOrders(data.orders)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      gradient: 'from-purple-500 to-purple-700',
    },
    {
      label: 'New Orders',
      value: stats.paidCount,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-700',
      subtitle: 'Paid, awaiting confirmation',
    },
    {
      label: 'Confirmed',
      value: stats.confirmedCount,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-700',
    },
    {
      label: 'Revenue',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-indigo-500 to-indigo-700',
    },
  ]

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm opacity-80 mt-1">{card.label}</p>
              {card.subtitle && (
                <p className="text-xs opacity-60 mt-0.5">{card.subtitle}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      &euro;{Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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
