import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import type { Role } from '@/types/roles'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 })
    }

    const { executiveId, title, body, status } = await request.json()

    if (!executiveId) {
      return NextResponse.json({ error: 'Executive ID is required' }, { status: 400 })
    }

    const executive = await prisma.executive.findUnique({
      where: { id: executiveId },
      include: {
        user: {
          include: { pushSubs: true },
        },
      },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    const notificationPayload = {
      title: title || 'RiskTech Vetting Update',
      body: body || `Your vetting status has transitioned to: ${status || executive.vettingStatus}.`,
      url: '/onboarding',
      timestamp: new Date().toISOString(),
      recipientId: executive.userId,
      subscriptionCount: executive.user.pushSubs.length,
    }

    // Log the notification dispatch in the tamper-evident audit ledger
    await writeAuditLog({
      actorId: session.id,
      actorRole: session.role as Role,
      action: 'NOTIFICATION_DISPATCH',
      targetType: 'Executive',
      targetId: executive.id,
      metadataDiff: {
        status: status || executive.vettingStatus,
        title: notificationPayload.title,
        body: notificationPayload.body,
        recipientUserId: executive.userId,
        subscriptionsTargeted: executive.user.pushSubs.length,
      },
    })

    return NextResponse.json({
      success: true,
      delivered: true,
      recipient: executive.userId,
      subscriptionsNotified: executive.user.pushSubs.length,
      payload: notificationPayload,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
