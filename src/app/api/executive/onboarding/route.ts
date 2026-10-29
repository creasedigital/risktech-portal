import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { writeAuditLog } from '@/lib/audit'
import { Role, VettingStatus } from '@prisma/client'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'VIEW_OWN_PROFILE')

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
      include: { documents: true },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive record not found' }, { status: 404 })
    }

    // Decrypt sensitive PII for candidate view
    let profile = null
    let referees = []

    try {
      profile = {
        fullName: decrypt(executive.fullNameEnc),
        phone: decrypt(executive.phoneEnc),
        nationality: decrypt(executive.nationalityEnc),
        currentTitle: executive.currentTitle,
        currentOrg: executive.currentOrg,
      }
    } catch {
      profile = {
        fullName: '',
        phone: '',
        nationality: '',
        currentTitle: executive.currentTitle,
        currentOrg: executive.currentOrg,
      }
    }

    try {
      referees = JSON.parse(decrypt(executive.refereesEnc))
    } catch {
      referees = []
    }

    return NextResponse.json({
      executive: {
        id: executive.id,
        consentVersion: executive.consentVersion,
        consentGrantedAt: executive.consentGrantedAt,
        dataProcessConsent: executive.dataProcessConsent,
        marketingConsent: executive.marketingConsent,
        profile,
        boardExperience: executive.boardExperience,
        sectors: executive.sectors,
        qualifications: executive.qualifications,
        referees,
        vettingStatus: executive.vettingStatus,
        draftStep: executive.draftStep,
        draftCompletedSteps: executive.draftCompletedSteps,
        version: executive.version,
        documents: executive.documents,
      },
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch executive profile' },
      { status: error.statusCode || 500 }
    )
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'SUBMIT_ONBOARDING')

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
      include: { documents: true },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive record not found' }, { status: 404 })
    }

    if (executive.vettingStatus !== VettingStatus.DRAFT && executive.vettingStatus !== VettingStatus.MORE_INFO_REQUIRED) {
      return NextResponse.json(
        { error: `Cannot submit application in status '${executive.vettingStatus}'. Profile is already under review or locked.` },
        { status: 400 }
      )
    }

    // Verify CV document uploaded
    const hasCv = executive.documents.some((d) => d.type === 'CV')
    if (!hasCv) {
      return NextResponse.json(
        { error: 'Application cannot be submitted: Curriculum Vitae (CV) document must be uploaded.' },
        { status: 400 }
      )
    }

    const previousStatus = executive.vettingStatus
    const newStatus = VettingStatus.SUBMITTED

    const updated = await prisma.executive.update({
      where: { id: executive.id },
      data: {
        vettingStatus: newStatus,
        submittedAt: new Date(),
        draftStep: 6,
        version: { increment: 1 },
      },
    })

    // Write audit log
    await writeAuditLog({
      actorId: session!.id,
      actorRole: Role.EXECUTIVE,
      action: 'FSM_TRANSITION',
      targetType: 'Executive',
      targetId: executive.id,
      metadataDiff: {
        from: previousStatus,
        to: newStatus,
        event: 'APPLICATION_SUBMITTED',
      },
    })

    return NextResponse.json({
      success: true,
      status: updated.vettingStatus,
      message: 'Executive application submitted successfully for consultant review.',
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: error.statusCode || 500 }
    )
  }
}
