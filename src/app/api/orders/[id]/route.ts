import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mail'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            option: true,
            playerType: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (notes !== undefined) data.notes = notes
    if (status === 'CONFIRMED') data.confirmedAt = new Date()

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
            option: true,
            playerType: true,
          },
        },
      },
    })

    // Send confirmation email when status is set to CONFIRMED
    if (status === 'CONFIRMED') {
      const settings = await prisma.siteSettings.findFirst()
      const siteName = settings?.siteName || 'IPTV Shop'
      const currencySymbol = settings?.currencySymbol || '€'
      const confirmText = settings?.confirmEmailText || 'Your order has been confirmed! Thank you for your purchase.'

      const itemsHtml = order.items
        .map(
          (item) =>
            `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product.name}${item.option ? ` - ${item.option.name}` : ''}${item.playerType ? ` (${item.playerType.name})` : ''}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${Number(item.price).toFixed(2)}</td>
            </tr>`
        )
        .join('')

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmed!</h2>
          <p>Hi ${order.customerName},</p>
          <p>${confirmText}</p>

          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> Confirmed</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 16px;">
            <p style="margin: 4px 0;">Subtotal: ${currencySymbol}${Number(order.subtotal).toFixed(2)}</p>
            ${Number(order.taxAmount) > 0 ? `<p style="margin: 4px 0;">Tax: ${currencySymbol}${Number(order.taxAmount).toFixed(2)}</p>` : ''}
            <p style="margin: 4px 0; font-size: 18px;"><strong>Total: ${currencySymbol}${Number(order.total).toFixed(2)}</strong></p>
          </div>

          ${order.notes ? `<div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0;"><strong>Notes:</strong> ${order.notes}</p></div>` : ''}

          <p style="color: #999; font-size: 12px;">— ${siteName}</p>
        </div>
      `

      try {
        await sendMail({
          to: order.customerEmail,
          subject: `Order Confirmed - ${order.orderNumber}`,
          html: emailHtml,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
