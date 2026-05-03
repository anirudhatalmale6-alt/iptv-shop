import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerEmail, customerName } = body

    if (!items || !items.length || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: items, customerEmail, customerName' },
        { status: 400 }
      )
    }

    const settings = await prisma.siteSettings.findFirst()
    const taxEnabled = settings?.taxEnabled ?? false
    const taxRate = settings ? Number(settings.taxRate) : 0
    const currency = settings?.currency?.toLowerCase() || 'eur'

    let subtotal = 0
    const orderItems: {
      productId: string
      optionId: string | null
      playerTypeId: string | null
      playerMac: string | null
      playerDeviceKey: string | null
      quantity: number
      price: number
    }[] = []

    const stripeLineItems: {
      price_data: {
        currency: string
        product_data: { name: string }
        unit_amount: number
      }
      quantity: number
    }[] = []

    for (const item of items) {
      const { productId, optionId, playerTypeId, playerMac, playerDeviceKey, quantity } = item

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 400 })
      }

      let itemPrice = Number(product.price)
      let itemName = product.name

      if (optionId) {
        const option = await prisma.productOption.findUnique({ where: { id: optionId } })
        if (!option) {
          return NextResponse.json({ error: `Product option not found: ${optionId}` }, { status: 400 })
        }
        itemPrice = Number(option.price)
        itemName = `${product.name} - ${option.name}`
      }

      if (playerTypeId) {
        const playerType = await prisma.playerType.findUnique({ where: { id: playerTypeId } })
        if (playerType) {
          itemName += ` (${playerType.name})`
        }
      }

      const qty = quantity || 1
      subtotal += itemPrice * qty

      orderItems.push({
        productId,
        optionId: optionId || null,
        playerTypeId: playerTypeId || null,
        playerMac: playerMac || null,
        playerDeviceKey: playerDeviceKey || null,
        quantity: qty,
        price: itemPrice,
      })

      stripeLineItems.push({
        price_data: {
          currency,
          product_data: { name: itemName },
          unit_amount: Math.round(itemPrice * 100),
        },
        quantity: qty,
      })
    }

    const taxAmount = taxEnabled ? subtotal * taxRate / 100 : 0
    const total = subtotal + taxAmount

    if (taxEnabled && taxAmount > 0) {
      const taxName = settings?.taxName || 'Tax'
      stripeLineItems.push({
        price_data: {
          currency,
          product_data: { name: `${taxName} (${taxRate}%)` },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      })
    }

    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail,
        customerName,
        status: 'PENDING',
        subtotal,
        taxAmount,
        total,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const stripe = await getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: stripeLineItems,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${baseUrl}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancelled`,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
