import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { serializeCanonicalPayload } from '@/lib/audit/hashChain'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'VIEW_AUDIT_LOG')

    const logs = await prisma.auditLog.findMany({
      orderBy: { sequence: 'desc' },
      take: 2000,
      include: {
        actor: {
          select: { email: true },
        },
      },
    })

    const formattedLogs = logs.map((log) => {
      const canonicalPayload = serializeCanonicalPayload({
        sequence: log.sequence,
        actorId: log.actorId,
        actorRole: log.actorRole,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadataDiff: (log.metadataDiff || {}) as Record<string, unknown>,
        createdAt: log.createdAt.toISOString(),
      })

      return {
        sequence: log.sequence,
        id: log.id,
        timestamp: log.createdAt.toISOString(),
        actorId: log.actorId,
        actorEmail: log.actor.email,
        actorRole: log.actorRole,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        sha256Hash: log.entryHash,
        previousHash: log.prevHash,
        canonicalPayload,
        metadataDiff: log.metadataDiff as Record<string, unknown> | null,
      }
    })

    return NextResponse.json({
      success: true,
      total: formattedLogs.length,
      logs: formattedLogs,
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit records' },
      { status: error.statusCode || 500 }
    )
  }
}
