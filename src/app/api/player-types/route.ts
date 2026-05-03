import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const playerTypes = await prisma.playerType.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(playerTypes)
  } catch (error) {
    console.error('Error fetching player types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player types' },
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
    const { name, slug, fields, guideTitle, guideText, guideImages, sortOrder, active } = body

    const playerType = await prisma.playerType.create({
      data: {
        name,
        slug,
        fields: fields || [],
        guideTitle: guideTitle || null,
        guideText: guideText || null,
        guideImages: guideImages || [],
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    })

    return NextResponse.json(playerType, { status: 201 })
  } catch (error) {
    console.error('Error creating player type:', error)
    return NextResponse.json(
      { error: 'Failed to create player type' },
      { status: 500 }
    )
  }
}
