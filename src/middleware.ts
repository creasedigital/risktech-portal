import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected paths
  const isExecutivePath =
    pathname.startsWith('/executive') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/privacy')

  const isConsultantPath =
    pathname.startsWith('/consultant') ||
    pathname.startsWith('/vetting') ||
    pathname.startsWith('/api/consultant')

  const isAdminPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin')

  if (!isExecutivePath && !isConsultantPath && !isAdminPath) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const user = token ? await verifySessionToken(token) : null

  // 1. Not Authenticated
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Administrators have access to all portals
  if (user.role === 'ADMINISTRATOR') {
    return NextResponse.next()
  }

  // 2. Role Boundary Checks
  if (isExecutivePath && user.role !== 'EXECUTIVE') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden: Executive role required.' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (isConsultantPath && user.role !== 'CONSULTANT') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden: Consultant role required.' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (isAdminPath) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden: Administrator role required.' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/403', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/executive/:path*',
    '/consultant/:path*',
    '/admin/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/privacy',
    '/privacy/:path*',
    '/vetting',
    '/vetting/:path*',
    '/api/consultant/:path*',
    '/api/admin/:path*',
  ],
}
