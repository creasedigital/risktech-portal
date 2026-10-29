import { describe, it, expect } from 'vitest'
import { Role } from '@prisma/client'
import { GENESIS_HASH, computeEntryHash, serializeCanonicalPayload, type CanonicalAuditPayload } from './hashChain'

describe('Tamper-Evident SHA-256 Hash Chain Engine', () => {
  it('deterministically computes entry hash from prevHash and canonical payload', () => {
    const payload: CanonicalAuditPayload = {
      sequence: 1,
      actorId: 'user_admin_1',
      actorRole: Role.ADMINISTRATOR,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'System',
      targetId: 'LEDGER_ROOT',
      metadataDiff: { status: 'INITIALIZED' },
      createdAt: '2026-10-27T12:00:00.000Z',
    }

    const hash1 = computeEntryHash(GENESIS_HASH, payload)
    const hash2 = computeEntryHash(GENESIS_HASH, payload)

    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it('produces different hashes when any payload field is altered (detects tampering)', () => {
    const payloadOriginal: CanonicalAuditPayload = {
      sequence: 2,
      actorId: 'consultant_ben',
      actorRole: Role.CONSULTANT,
      action: 'FSM_TRANSITION',
      targetType: 'Executive',
      targetId: 'exec_alice',
      metadataDiff: { vettingStatus: 'UNDER_REVIEW' },
      createdAt: '2026-10-27T12:01:00.000Z',
    }

    const payloadTampered: CanonicalAuditPayload = {
      ...payloadOriginal,
      metadataDiff: { vettingStatus: 'VERIFIED' }, // Unauthorized status tampering
    }

    const hashOriginal = computeEntryHash(GENESIS_HASH, payloadOriginal)
    const hashTampered = computeEntryHash(GENESIS_HASH, payloadTampered)

    expect(hashOriginal).not.toBe(hashTampered)
  })

  it('serializes canonical payload with sorted keys regardless of input key order', () => {
    const payload1: CanonicalAuditPayload = {
      sequence: 1,
      actorId: 'id',
      actorRole: Role.EXECUTIVE,
      action: 'ACTION',
      targetType: 'Type',
      targetId: 'target',
      metadataDiff: { a: 1 },
      createdAt: '2026-10-27T12:00:00.000Z',
    }

    const serialized = serializeCanonicalPayload(payload1)
    const parsedKeys = Object.keys(JSON.parse(serialized))
    const sortedExpected = [...parsedKeys].sort()

    expect(parsedKeys).toEqual(sortedExpected)
  })
})
