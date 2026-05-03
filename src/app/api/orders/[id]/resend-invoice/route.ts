import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mail'

export async function POST(
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

    const settings = await prisma.siteSettings.findFirst()
    const siteName = settings?.siteName || 'IPTV Shop'
    const currencySymbol = settings?.currencySymbol || '€'

    const statusLabel =
      order.status === 'CONFIRMED'
        ? 'Confirmed'
        : order.status === 'PAID'
          ? 'Paid'
          : order.status

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
        <h2 style="color: #333;">Order Invoice</h2>
        <p>Hi ${order.customerName},</p>
        <p>Here is your order invoice.</p>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 8px 0 0;"><strong>Status:</strong> ${statusLabel}</p>
          <p style="margin: 8px 0 0;"><strong>Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
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

    await sendMail({
      to: order.customerEmail,
      subject: `Order Invoice - ${order.orderNumber}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true, message: 'Invoice email sent' })
  } catch (error) {
    console.error('Error resending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to resend invoice' },
      { status: 500 }
    )
  }
}
