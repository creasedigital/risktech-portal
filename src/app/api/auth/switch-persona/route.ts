import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signPayload, COOKIE_NAME } from '@/lib/auth/session'
import { SYNTHETIC_PERSONAS, type Role } from '@/types/roles'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const role = body.role as Role

    if (!role || !['EXECUTIVE', 'CONSULTANT', 'ADMINISTRATOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role requested' }, { status: 400 })
    }

    const persona = SYNTHETIC_PERSONAS[role]
    const user = await prisma.user.findUnique({
      where: { email: persona.email },
      include: { executive: true, consultant: true },
    })

    if (!user) {
      return NextResponse.json({ error: `Synthetic user for role ${role} not found. Please run seed.` }, { status: 404 })
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: persona.name,
    }

    const token = await signPayload(sessionUser)

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      message: `Switched persona to ${persona.name} (${persona.role})`,
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
