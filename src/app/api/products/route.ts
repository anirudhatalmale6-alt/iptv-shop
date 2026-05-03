import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    const isAdmin = token ? !!verifyToken(token) : false

    const products = await prisma.product.findMany({
      where: isAdmin ? {} : { active: true },
      include: {
        options: {
          where: isAdmin ? {} : { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image, images, price, active, options } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        image: image || null,
        images: images || [],
        price,
        active: active ?? true,
        options: options
          ? {
              create: options.map((opt: { name: string; price: number; screens?: number; duration?: number; popular?: boolean; sortOrder?: number; active?: boolean }) => ({
                name: opt.name,
                price: opt.price,
                screens: opt.screens ?? 1,
                duration: opt.duration ?? 1,
                popular: opt.popular ?? false,
                sortOrder: opt.sortOrder ?? 0,
                active: opt.active ?? true,
              })),
            }
          : undefined,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
