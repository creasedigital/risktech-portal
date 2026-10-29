import { prisma } from '@/lib/db'
import type { Role, Prisma } from '@prisma/client'
import { GENESIS_HASH, computeEntryHash, type CanonicalAuditPayload } from './hashChain'

export interface AuditLogInput {
  actorId: string
  actorRole: Role
  action: string
  targetType: string
  targetId: string
  metadataDiff: Record<string, unknown>
}

/**
 * Appends an audit log record with SHA-256 cryptographic hash chaining.
 */
export async function writeAuditLog(input: AuditLogInput) {
  // Find latest entry by sequence to chain from
  const lastEntry = await prisma.auditLog.findFirst({
    orderBy: { sequence: 'desc' },
  })

  const prevHash = lastEntry ? lastEntry.entryHash : GENESIS_HASH
  const nextSequence = lastEntry ? lastEntry.sequence + 1 : 1
  const createdAtIso = new Date().toISOString()

  const payload: CanonicalAuditPayload = {
    sequence: nextSequence,
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadataDiff: input.metadataDiff,
    createdAt: createdAtIso,
  }

  const entryHash = computeEntryHash(prevHash, payload)

  return prisma.auditLog.create({
    data: {
      sequence: nextSequence,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadataDiff: input.metadataDiff as Prisma.InputJsonValue,
      prevHash,
      entryHash,
      createdAt: new Date(createdAtIso),
    },
  })
}
