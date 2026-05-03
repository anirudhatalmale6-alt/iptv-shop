import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { sendMail } from '@/lib/mail'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const orderId = session.metadata?.orderId
      if (!orderId) {
        console.error('No orderId in session metadata')
        return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
      }

      // Update order status to PAID
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          stripePaymentId: session.payment_intent as string,
        },
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

      // Fetch site settings for email template
      const settings = await prisma.siteSettings.findFirst()
      const siteName = settings?.siteName || 'IPTV Shop'
      const currencySymbol = settings?.currencySymbol || '€'

      // Build order items HTML
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

      // Send confirmation email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Hi ${order.customerName},</p>
          <p>Thank you for your order! Your payment has been received.</p>

          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> Paid</p>
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

          <p style="margin-top: 24px; color: #666;">We will process your order and send you the activation details shortly.</p>
          <p style="color: #999; font-size: 12px;">— ${siteName}</p>
        </div>
      `

      try {
        await sendMail({
          to: order.customerEmail,
          subject: `Order Confirmation - ${order.orderNumber}`,
          html: emailHtml,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the webhook if email fails
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
