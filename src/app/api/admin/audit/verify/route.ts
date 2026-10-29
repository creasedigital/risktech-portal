import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { verifyAuditChain } from '@/lib/audit/verify'
import { writeAuditLog } from '@/lib/audit'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    // Layer 2: DAL RBAC Guard
    assertRolePermission(session, 'VERIFY_AUDIT_CHAIN')

    const result = await verifyAuditChain()

    // Log the verification action itself
    await writeAuditLog({
      actorId: session!.id,
      actorRole: Role.ADMINISTRATOR,
      action: 'AUDIT_VERIFY',
      targetType: 'AuditLedger',
      targetId: 'ALL',
      metadataDiff: { verifiedCount: result.totalChecked, intact: result.valid },
    })

    return NextResponse.json(result)
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Audit verification failed' },
      { status: error.statusCode || 500 }
    )
  }
}
