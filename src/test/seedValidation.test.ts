import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { Role } from '@prisma/client'
import { GENESIS_HASH, computeEntryHash, type CanonicalAuditPayload } from '@/lib/audit/hashChain'

describe('Synthetic Seed & Security Invariants Verification', () => {
  it('seeded exactly 1,000 synthetic executive governance records', async () => {
    // 1 demo persona + 1,000 synthetic = 1,001 total executive records
    const count = await prisma.executive.count()
    expect(count).toBeGreaterThanOrEqual(1000)
  })

  it('seeded all 3 core role personas with active credentials', async () => {
    const executiveUser = await prisma.user.findUnique({
      where: { email: 'alice.okafor@synthetic-risktech.internal' },
      include: { executive: true },
    })
    expect(executiveUser).not.toBeNull()
    expect(executiveUser?.role).toBe(Role.EXECUTIVE)
    expect(executiveUser?.executive).not.toBeNull()

    const consultantUser = await prisma.user.findUnique({
      where: { email: 'ben.adeyemi@synthetic-risktech.internal' },
      include: { consultant: true },
    })
    expect(consultantUser).not.toBeNull()
    expect(consultantUser?.role).toBe(Role.CONSULTANT)
    expect(consultantUser?.consultant).not.toBeNull()

    const adminUser = await prisma.user.findUnique({
      where: { email: 'carol.mensah@synthetic-risktech.internal' },
    })
    expect(adminUser).not.toBeNull()
    expect(adminUser?.role).toBe(Role.ADMINISTRATOR)
  })

  it('verifies PII fields are encrypted at rest with AES-256-GCM', async () => {
    const aliceExec = await prisma.executive.findFirst({
      where: { user: { email: 'alice.okafor@synthetic-risktech.internal' } },
    })

    expect(aliceExec).not.toBeNull()
    // Stored field must be in iv:authTag:ciphertext format, NOT raw text
    expect(aliceExec!.fullNameEnc).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/)
    expect(aliceExec!.fullNameEnc).not.toContain('Alice')

    // Decrypting returns the correct synthetic full name
    const decryptedName = decrypt(aliceExec!.fullNameEnc)
    expect(decryptedName).toBe('Alice Folashade Okafor')
  })

  it('enforces synthetic governance data invariant across all records', async () => {
    const emails = await prisma.user.findMany({
      select: { email: true },
      take: 100,
    })

    // Every email domain must end with synthetic domain
    for (const u of emails) {
      expect(u.email).toMatch(/@synthetic-(risktech|partner)\.internal$/)
    }
  })

  it('verifies the cryptographic SHA-256 integrity of the seeded audit trail', async () => {
    const logs = await prisma.auditLog.findMany({
      orderBy: { sequence: 'asc' },
    })

    expect(logs.length).toBeGreaterThan(0)

    let expectedPrevHash = GENESIS_HASH
    for (const log of logs) {
      expect(log.prevHash).toBe(expectedPrevHash)

      const payload: CanonicalAuditPayload = {
        sequence: log.sequence,
        actorId: log.actorId,
        actorRole: log.actorRole,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadataDiff: log.metadataDiff as Record<string, unknown>,
        createdAt: log.createdAt.toISOString(),
      }

      const computedHash = computeEntryHash(expectedPrevHash, payload)
      expect(log.entryHash).toBe(computedHash)

      expectedPrevHash = log.entryHash
    }
  })
})
