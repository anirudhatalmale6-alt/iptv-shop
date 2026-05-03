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

    const playerType = await prisma.playerType.findUnique({
      where: { id },
    })

    if (!playerType) {
      return NextResponse.json({ error: 'Player type not found' }, { status: 404 })
    }

    return NextResponse.json(playerType)
  } catch (error) {
    console.error('Error fetching player type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player type' },
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
    const { name, slug, fields, guideTitle, guideText, guideImages, sortOrder, active } = body

    const playerType = await prisma.playerType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(fields !== undefined && { fields }),
        ...(guideTitle !== undefined && { guideTitle }),
        ...(guideText !== undefined && { guideText }),
        ...(guideImages !== undefined && { guideImages }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(playerType)
  } catch (error) {
    console.error('Error updating player type:', error)
    return NextResponse.json(
      { error: 'Failed to update player type' },
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

    await prisma.playerType.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting player type:', error)
    return NextResponse.json(
      { error: 'Failed to delete player type' },
      { status: 500 }
    )
  }
}
