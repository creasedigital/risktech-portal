import crypto from 'crypto'
import type { Role } from '@prisma/client'

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'

export interface CanonicalAuditPayload {
  sequence: number
  actorId: string
  actorRole: Role
  action: string
  targetType: string
  targetId: string
  metadataDiff: Record<string, unknown>
  createdAt: string // ISO-8601 string for deterministic serialization
}

/**
 * Computes deterministic canonical payload string
 */
export function serializeCanonicalPayload(payload: CanonicalAuditPayload): string {
  // Sort keys alphabetically for determinism
  const sortedObj: Record<string, unknown> = {
    action: payload.action,
    actorId: payload.actorId,
    actorRole: payload.actorRole,
    createdAt: payload.createdAt,
    metadataDiff: payload.metadataDiff,
    sequence: payload.sequence,
    targetId: payload.targetId,
    targetType: payload.targetType,
  }
  return JSON.stringify(sortedObj)
}

/**
 * Computes SHA-256 hash of prevHash + canonicalPayload
 */
export function computeEntryHash(prevHash: string, payload: CanonicalAuditPayload): string {
  const canonical = serializeCanonicalPayload(payload)
  return crypto.createHash('sha256').update(prevHash + canonical).digest('hex')
}
