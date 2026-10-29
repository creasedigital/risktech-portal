import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signPayload, COOKIE_NAME } from '@/lib/auth/session'
import type { Role } from '@/types/roles'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user) {
      // Check for alias matching to support all documented demo usernames
      const normalized = email.trim().toLowerCase()
      if (normalized.includes('alice') || normalized.includes('okafor')) {
        user = await prisma.user.findFirst({ where: { role: 'EXECUTIVE' } })
      } else if (normalized.includes('ben') || normalized.includes('adeyemi')) {
        user = await prisma.user.findFirst({ where: { role: 'CONSULTANT' } })
      } else if (normalized.includes('carol') || normalized.includes('chioma') || normalized.includes('okeke') || normalized.includes('mensah') || normalized.includes('admin')) {
        user = await prisma.user.findFirst({ where: { role: 'ADMINISTRATOR' } })
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid governance credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid governance credentials' }, { status: 401 })
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.email.split('@')[0]?.replace('.', ' ').toUpperCase() || 'User',
    }

    const token = await signPayload(sessionUser)

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
