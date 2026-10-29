import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/encryption'
import type { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'SUBMIT_ONBOARDING')

    const body = await request.json()
    const { step, data } = body

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    const updatePayload: Record<string, unknown> = {
      draftStep: Math.max(executive.draftStep, step),
      version: { increment: 1 },
    }

    if (step === 1 && data) {
      updatePayload.dataProcessConsent = data.dataProcessConsent
      updatePayload.marketingConsent = data.marketingConsent ?? false
      updatePayload.consentVersion = data.consentVersion || '2024-01-v1'
      updatePayload.consentGrantedAt = new Date()
    } else if (step === 2 && data) {
      if (data.fullName) updatePayload.fullNameEnc = encrypt(data.fullName)
      if (data.phone) updatePayload.phoneEnc = encrypt(data.phone)
      if (data.nationality) updatePayload.nationalityEnc = encrypt(data.nationality)
      if (data.currentTitle) updatePayload.currentTitle = data.currentTitle
      if (data.currentOrg) updatePayload.currentOrg = data.currentOrg
    } else if (step === 3 && data) {
      updatePayload.boardExperience = data.boardPositions as Prisma.InputJsonValue
    } else if (step === 4 && data) {
      updatePayload.sectors = data.sectors as Prisma.InputJsonValue
      updatePayload.qualifications = data.qualifications as Prisma.InputJsonValue
    } else if (step === 5 && data) {
      updatePayload.refereesEnc = encrypt(JSON.stringify(data.referees))
    }

    const updated = await prisma.executive.update({
      where: { id: executive.id },
      data: updatePayload,
    })

    return NextResponse.json({
      success: true,
      draftStep: updated.draftStep,
      version: updated.version,
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Draft save failed' },
      { status: error.statusCode || 500 }
    )
  }
}
