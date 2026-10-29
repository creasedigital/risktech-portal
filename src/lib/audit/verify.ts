import { prisma } from '@/lib/db'
import { GENESIS_HASH, computeEntryHash, type CanonicalAuditPayload } from './hashChain'

export interface VerifyChainResult {
  valid: boolean
  totalChecked: number
  firstTamperedSequence?: number
  error?: string
}

/**
 * Traverses the entire audit ledger from sequence 1 to N,
 * re-computing each SHA-256 hash to verify cryptographic chain integrity.
 */
export async function verifyAuditChain(): Promise<VerifyChainResult> {
  const records = await prisma.auditLog.findMany({
    orderBy: { sequence: 'asc' },
  })

  if (records.length === 0) {
    return { valid: true, totalChecked: 0 }
  }

  let expectedPrevHash = GENESIS_HASH

  for (const record of records) {
    // 1. Check previous hash pointer
    if (record.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        totalChecked: records.length,
        firstTamperedSequence: record.sequence,
        error: `Broken link at sequence #${record.sequence}: prevHash does not match predecessor entryHash`,
      }
    }

    // 2. Re-compute canonical payload and hash
    const payload: CanonicalAuditPayload = {
      sequence: record.sequence,
      actorId: record.actorId,
      actorRole: record.actorRole,
      action: record.action,
      targetType: record.targetType,
      targetId: record.targetId,
      metadataDiff: record.metadataDiff as Record<string, unknown>,
      createdAt: record.createdAt.toISOString(),
    }

    const computedHash = computeEntryHash(expectedPrevHash, payload)

    // 3. Compare with stored entryHash
    if (record.entryHash !== computedHash) {
      return {
        valid: false,
        totalChecked: records.length,
        firstTamperedSequence: record.sequence,
        error: `Cryptographic mismatch at sequence #${record.sequence}: stored hash does not match computed hash`,
      }
    }

    expectedPrevHash = record.entryHash
  }

  return {
    valid: true,
    totalChecked: records.length,
  }
}
