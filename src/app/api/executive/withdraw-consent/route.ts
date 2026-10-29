import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import { Role, VettingStatus } from '@prisma/client'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'WITHDRAW_CONSENT')

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    const previousStatus = executive.vettingStatus
    const previousConsent = executive.dataProcessConsent

    // Freeze candidate vetting and withdraw consent
    const updated = await prisma.executive.update({
      where: { id: executive.id },
      data: {
        dataProcessConsent: false,
        consentWithdrawnAt: new Date(),
        vettingStatus: VettingStatus.DRAFT,
        version: { increment: 1 },
      },
    })

    // Write tamper-evident audit log
    await writeAuditLog({
      actorId: session!.id,
      actorRole: session!.role as Role,
      action: 'WITHDRAW_CONSENT',
      targetType: 'Executive',
      targetId: executive.id,
      metadataDiff: {
        previousConsent,
        newConsent: false,
        previousVettingStatus: previousStatus,
        newVettingStatus: 'DRAFT',
        statutoryBasis: 'NDPA 2023 Section 34 Consent Revocation',
      },
    })

    return NextResponse.json({
      success: true,
      dataProcessConsent: updated.dataProcessConsent,
      consentWithdrawnAt: updated.consentWithdrawnAt,
      vettingStatus: updated.vettingStatus,
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to withdraw consent' },
      { status: error.statusCode || 500 }
    )
  }
}
