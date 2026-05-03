import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const faqItems = await prisma.faqItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(faqItems)
  } catch (error) {
    console.error('Error fetching FAQ items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ items' },
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
    const { question, answer, sortOrder, active } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const faqItem = await prisma.faqItem.create({
      data: {
        question,
        answer,
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    })

    return NextResponse.json(faqItem, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ item:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ item' },
      { status: 500 }
    )
  }
}
