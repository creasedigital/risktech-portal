import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'VIEW_REVIEWER_QUEUE')

    const executives = await prisma.executive.findMany({
      select: {
        id: true,
        fullNameEnc: true,
        currentTitle: true,
        currentOrg: true,
        vettingStatus: true,
        submittedAt: true,
        createdAt: true,
        _count: {
          select: { documents: true, vettingNotes: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 1000,
    })

    const decryptedList = executives.map((exec) => {
      let name = 'Candidate'
      try {
        name = decrypt(exec.fullNameEnc)
      } catch {
        name = 'Executive Candidate'
      }

      return {
        id: exec.id,
        name,
        currentTitle: exec.currentTitle || 'Senior Director',
        currentOrg: exec.currentOrg || 'Institutional Enterprise',
        vettingStatus: exec.vettingStatus,
        submittedAt: exec.submittedAt ? exec.submittedAt.toISOString() : exec.createdAt.toISOString(),
        documentsCount: exec._count.documents,
        notesCount: exec._count.vettingNotes,
      }
    })

    return NextResponse.json({
      success: true,
      total: decryptedList.length,
      executives: decryptedList,
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidate queue' },
      { status: error.statusCode || 500 }
    )
  }
}
