import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    // Check if the request is from an admin
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    const isAdmin = token ? !!verifyToken(token) : false

    if (isAdmin) {
      // Return all fields for admin
      return NextResponse.json(settings)
    }

    // Return only public fields for non-admin
    return NextResponse.json({
      siteName: settings.siteName,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      seoKeywords: settings.seoKeywords,
      favicon: settings.favicon,
      taxEnabled: settings.taxEnabled,
      taxRate: settings.taxRate,
      taxName: settings.taxName,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      stripePublicKey: settings.stripePublicKey,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: body,
      create: {
        id: 'default',
        ...body,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
