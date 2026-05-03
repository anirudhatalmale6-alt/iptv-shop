import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me'
const COOKIE_NAME = 'admin_token'

interface TokenPayload {
  adminId: string
  iat: number
  exp: number
}

export function signToken(adminId: string): string {
  return jwt.sign({ adminId }, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
    })
    return admin
  } catch {
    return null
  }
}

export { COOKIE_NAME }
