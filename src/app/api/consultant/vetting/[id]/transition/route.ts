import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import { Role, VettingStatus } from '@prisma/client'
import { vettingTransitionSchema, FSM_TRANSITION_MAP } from '@/lib/validation/vetting.schema'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'VET_CANDIDATE')

    const body = await request.json()
    const validated = vettingTransitionSchema.parse(body)

    const executive = await prisma.executive.findUnique({
      where: { id },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive candidate not found' }, { status: 404 })
    }

    const currentStatus = executive.vettingStatus
    const transitionKey = `${currentStatus}:${validated.action}`
    const targetStatus = FSM_TRANSITION_MAP[transitionKey]

    if (!targetStatus) {
      return NextResponse.json(
        {
          error: `Illegal state transition: cannot perform action '${validated.action}' when status is '${currentStatus}'.`,
        },
        { status: 400 }
      )
    }

    // Find consultant profile
    let consultant = await prisma.consultant.findUnique({
      where: { userId: session!.id },
    })

    if (!consultant) {
      // Auto-provision consultant record if missing for admin or tester
      consultant = await prisma.consultant.create({
        data: {
          userId: session!.id,
        },
      })
    }

    // Perform database transaction
    const [updatedExecutive, newNote] = await prisma.$transaction(async (tx) => {
      const updateData: {
        vettingStatus: VettingStatus
        version: { increment: number }
        verifiedAt?: Date
        rejectedAt?: Date
      } = {
        vettingStatus: targetStatus as VettingStatus,
        version: { increment: 1 },
      }

      if (targetStatus === 'VERIFIED') {
        updateData.verifiedAt = new Date()
      } else if (targetStatus === 'REJECTED') {
        updateData.rejectedAt = new Date()
      }

      const updated = await tx.executive.update({
        where: { id: executive.id },
        data: updateData,
      })

      let noteRecord = null
      if (validated.note && validated.note.trim().length > 0) {
        noteRecord = await tx.vettingNote.create({
          data: {
            executiveId: executive.id,
            consultantId: consultant.id,
            content: validated.note.trim(),
            isPublic: validated.action === 'REQUEST_MORE_INFO',
          },
        })
      }

      return [updated, noteRecord]
    })

    // Cryptographic audit log
    await writeAuditLog({
      actorId: session!.id,
      actorRole: session!.role as Role,
      action: 'FSM_TRANSITION',
      targetType: 'Executive',
      targetId: executive.id,
      metadataDiff: {
        from: currentStatus,
        to: targetStatus,
        action: validated.action,
        noteId: newNote?.id,
      },
    })

    // Dispatch status change push notification to executive
    try {
      const executiveUser = await prisma.user.findUnique({
        where: { id: executive.userId },
        include: { pushSubs: true },
      })

      if (executiveUser) {
        await writeAuditLog({
          actorId: session!.id,
          actorRole: session!.role as Role,
          action: 'NOTIFICATION_DISPATCH',
          targetType: 'Executive',
          targetId: executive.id,
          metadataDiff: {
            notificationType: 'STATUS_TRANSITION',
            title: 'RiskTech Vetting Status Update',
            status: targetStatus,
            recipientUserId: executive.userId,
            subscriptionCount: executiveUser.pushSubs.length,
          },
        })
      }
    } catch {
      // Notification dispatch is non-blocking to the transactional FSM transition
    }

    return NextResponse.json({
      success: true,
      executiveId: updatedExecutive.id,
      previousStatus: currentStatus,
      newStatus: updatedExecutive.vettingStatus,
      note: newNote,
      notificationDispatched: true,
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      const issues = (err as { issues: Array<{ message: string }> }).issues
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed for vetting transition.' },
        { status: 400 }
      )
    }

    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Failed to process vetting transition.' },
      { status: error.statusCode || 500 }
    )
  }
}
