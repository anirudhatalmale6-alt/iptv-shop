import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        options: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Also fetch player types for the product detail page
    const playerTypes = await prisma.playerType.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ ...product, playerTypes })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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
    const { name, slug, description, image, images, price, active, options } = body

    // Update product fields
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(images !== undefined && { images }),
        ...(price !== undefined && { price }),
        ...(active !== undefined && { active }),
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // If options are provided, replace them
    if (options) {
      await prisma.productOption.deleteMany({ where: { productId: id } })
      await prisma.productOption.createMany({
        data: options.map((opt: { name: string; price: number; screens?: number; duration?: number; popular?: boolean; sortOrder?: number; active?: boolean }) => ({
          productId: id,
          name: opt.name,
          price: opt.price,
          screens: opt.screens ?? 1,
          duration: opt.duration ?? 1,
          popular: opt.popular ?? false,
          sortOrder: opt.sortOrder ?? 0,
          active: opt.active ?? true,
        })),
      })

      // Refetch with updated options
      const updated = await prisma.product.findUnique({
        where: { id },
        include: {
          options: { orderBy: { sortOrder: 'asc' } },
        },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
