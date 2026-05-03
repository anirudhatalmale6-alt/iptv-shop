import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    const source = await prisma.product.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!source) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const baseName = `${source.name} (Copy)`
    const baseSlug = `${source.slug}-copy`

    let slug = baseSlug
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const copy = await prisma.product.create({
      data: {
        name: baseName,
        slug,
        description: source.description,
        image: source.image,
        images: source.images,
        price: source.price,
        active: false,
        options: {
          create: source.options.map(opt => ({
            name: opt.name,
            price: opt.price,
            screens: opt.screens,
            duration: opt.duration,
            popular: opt.popular,
            sortOrder: opt.sortOrder,
            active: opt.active,
          })),
        },
      },
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json(copy, { status: 201 })
  } catch (error) {
    console.error('Error duplicating product:', error)
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 })
  }
}
