import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { writeAuditLog } from '@/lib/audit'
import { Role } from '@prisma/client'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'REVEAL_PII')

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    // Write audit log entry for compliance
    await writeAuditLog({
      actorId: session!.id,
      actorRole: session!.role as Role,
      action: 'PII_REVEAL',
      targetType: 'Executive',
      targetId: executive.id,
      metadataDiff: {
        reason: 'User triggered temporary unmasking in Executive Privacy Center',
        durationSeconds: 30,
      },
    })

    return NextResponse.json({
      success: true,
      pii: {
        fullName: decrypt(executive.fullNameEnc),
        phone: decrypt(executive.phoneEnc),
        nationality: decrypt(executive.nationalityEnc),
        referees: JSON.parse(decrypt(executive.refereesEnc)),
      },
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to reveal sensitive PII' },
      { status: error.statusCode || 500 }
    )
  }
}
