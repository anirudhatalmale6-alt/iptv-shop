import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = status ? { status: status as 'PENDING' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' } : {}

    const [orders, counts] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
              option: true,
              playerType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { total: true },
      }),
    ])

    const totalOrders = counts.reduce((sum, c) => sum + c._count.id, 0)
    const totalRevenue = counts.reduce((sum, c) => sum + Number(c._sum.total || 0), 0)
    const paidCount = counts.find(c => c.status === 'PAID')?._count.id || 0
    const confirmedCount = counts.find(c => c.status === 'CONFIRMED')?._count.id || 0

    return NextResponse.json({
      orders,
      stats: {
        totalOrders,
        paidCount,
        confirmedCount,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
