import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { writeAuditLog } from '@/lib/audit'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'EXPORT_DATA')

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            sha256: true,
            uploadedAt: true,
          },
        },
        vettingNotes: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          where: { isPublic: true },
        },
      },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive record not found' }, { status: 404 })
    }

    let fullName = ''
    let phone = ''
    let nationality = ''
    let referees = []

    try {
      fullName = decrypt(executive.fullNameEnc)
      phone = decrypt(executive.phoneEnc)
      nationality = decrypt(executive.nationalityEnc)
      referees = JSON.parse(decrypt(executive.refereesEnc))
    } catch {
      // Fallback
    }

    const exportPackage = {
      complianceStandard: 'Nigeria Data Protection Act (NDPA) 2023 - Section 34 Right of Access',
      exportedAt: new Date().toISOString(),
      candidateId: executive.id,
      consentRecords: {
        consentVersion: executive.consentVersion,
        consentGrantedAt: executive.consentGrantedAt,
        consentWithdrawnAt: executive.consentWithdrawnAt,
        dataProcessConsent: executive.dataProcessConsent,
        marketingConsent: executive.marketingConsent,
      },
      profile: {
        fullName,
        phone,
        nationality,
        currentTitle: executive.currentTitle,
        currentOrg: executive.currentOrg,
      },
      governanceExperience: {
        boardExperience: executive.boardExperience,
        sectors: executive.sectors,
        qualifications: executive.qualifications,
      },
      referees,
      documentVaultMetadata: executive.documents,
      vettingHistory: {
        currentStatus: executive.vettingStatus,
        submittedAt: executive.submittedAt,
        verifiedAt: executive.verifiedAt,
        rejectedAt: executive.rejectedAt,
        publicVettingNotes: executive.vettingNotes,
      },
    }

    // Write audit log
    await writeAuditLog({
      actorId: session!.id,
      actorRole: session!.role as Role,
      action: 'EXPORT_DATA',
      targetType: 'Executive',
      targetId: executive.id,
      metadataDiff: {
        standard: 'NDPA 2023 DSAR',
        exportedRecordsCount: 1,
      },
    })

    return new NextResponse(JSON.stringify(exportPackage, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="risktech-executive-dsar-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to export personal data' },
      { status: error.statusCode || 500 }
    )
  }
}
