import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'VIEW_REVIEWER_QUEUE')

    const executive = await prisma.executive.findUnique({
      where: { id },
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
          include: {
            consultant: {
              include: {
                user: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive candidate not found' }, { status: 404 })
    }

    let fullName = 'Executive Candidate'
    let phone = 'Restricted'
    let nationality = 'Restricted'
    let referees = []

    try {
      fullName = decrypt(executive.fullNameEnc)
      phone = decrypt(executive.phoneEnc)
      nationality = decrypt(executive.nationalityEnc)
    } catch {
      // PII decryption fallback
    }

    try {
      referees = JSON.parse(decrypt(executive.refereesEnc))
    } catch {
      referees = []
    }

    return NextResponse.json({
      success: true,
      executive: {
        id: executive.id,
        fullName,
        phone,
        nationality,
        currentTitle: executive.currentTitle,
        currentOrg: executive.currentOrg,
        vettingStatus: executive.vettingStatus,
        dataProcessConsent: executive.dataProcessConsent,
        consentVersion: executive.consentVersion,
        consentGrantedAt: executive.consentGrantedAt,
        boardExperience: executive.boardExperience,
        sectors: executive.sectors,
        qualifications: executive.qualifications,
        referees,
        documents: executive.documents.map((d) => ({
          id: d.id,
          type: d.type,
          filename: d.originalName,
          mimeType: d.mimeType,
          sizeBytes: d.sizeBytes,
          sha256Checksum: d.sha256,
          createdAt: d.uploadedAt.toISOString(),
        })),
        vettingNotes: executive.vettingNotes.map((n) => ({
          id: n.id,
          note: n.content,
          createdAt: n.createdAt.toISOString(),
          authorName: n.consultant.user.email,
        })),
        submittedAt: executive.submittedAt,
        createdAt: executive.createdAt,
      },
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidate details' },
      { status: error.statusCode || 500 }
    )
  }
}
