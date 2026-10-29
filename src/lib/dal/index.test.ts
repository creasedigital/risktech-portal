import { describe, it, expect } from 'vitest'
import { assertRolePermission, hasRolePermission, ForbiddenError, UnauthorizedError } from './index'
import type { SessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { verifyAuditChain } from '@/lib/audit/verify'

describe('Data Access Layer (DAL) RBAC Security Boundary', () => {
  const executiveSession: SessionUser = {
    id: 'user_exec',
    name: 'Alice Okafor',
    email: 'alice.okafor@synthetic-risktech.internal',
    role: 'EXECUTIVE',
  }

  const consultantSession: SessionUser = {
    id: 'user_cons',
    name: 'Ben Adeyemi',
    email: 'ben.adeyemi@synthetic-risktech.internal',
    role: 'CONSULTANT',
  }

  const adminSession: SessionUser = {
    id: 'user_admin',
    name: 'Carol Mensah',
    email: 'carol.mensah@synthetic-risktech.internal',
    role: 'ADMINISTRATOR',
  }

  describe('Unauthenticated Rejection', () => {
    it('throws UnauthorizedError when session is null', () => {
      expect(() => assertRolePermission(null, 'VIEW_OWN_PROFILE')).toThrow(UnauthorizedError)
      expect(hasRolePermission(null, 'VIEW_OWN_PROFILE')).toBe(false)
    })
  })

  describe('Executive Role Boundaries (Negative Testing)', () => {
    it('allows EXECUTIVE to submit onboarding and reveal own PII', () => {
      expect(() => assertRolePermission(executiveSession, 'SUBMIT_ONBOARDING')).not.toThrow()
      expect(() => assertRolePermission(executiveSession, 'REVEAL_PII')).not.toThrow()
      expect(() => assertRolePermission(executiveSession, 'WITHDRAW_CONSENT')).not.toThrow()
    })

    it('PROVES EXECUTIVE CANNOT access reviewer queue (throws 403 Forbidden)', () => {
      expect(() => assertRolePermission(executiveSession, 'VIEW_REVIEWER_QUEUE')).toThrow(ForbiddenError)
      expect(hasRolePermission(executiveSession, 'VIEW_REVIEWER_QUEUE')).toBe(false)
    })

    it('PROVES EXECUTIVE CANNOT transition vetting state or vet candidates', () => {
      expect(() => assertRolePermission(executiveSession, 'VET_CANDIDATE')).toThrow(ForbiddenError)
      expect(hasRolePermission(executiveSession, 'VET_CANDIDATE')).toBe(false)
    })

    it('PROVES EXECUTIVE CANNOT inspect audit ledger or verify audit chain', () => {
      expect(() => assertRolePermission(executiveSession, 'VIEW_AUDIT_LOG')).toThrow(ForbiddenError)
      expect(() => assertRolePermission(executiveSession, 'VERIFY_AUDIT_CHAIN')).toThrow(ForbiddenError)
    })
  })

  describe('Consultant Role Boundaries (Negative Testing)', () => {
    it('allows CONSULTANT to view queue and vet candidates', () => {
      expect(() => assertRolePermission(consultantSession, 'VIEW_REVIEWER_QUEUE')).not.toThrow()
      expect(() => assertRolePermission(consultantSession, 'VET_CANDIDATE')).not.toThrow()
      expect(() => assertRolePermission(consultantSession, 'DOWNLOAD_DOCUMENT')).not.toThrow()
    })

    it('PROVES CONSULTANT CANNOT submit onboarding drafts', () => {
      expect(() => assertRolePermission(consultantSession, 'SUBMIT_ONBOARDING')).toThrow(ForbiddenError)
    })

    it('PROVES CONSULTANT CANNOT access administrator audit log or chain verify endpoints', () => {
      expect(() => assertRolePermission(consultantSession, 'VIEW_AUDIT_LOG')).toThrow(ForbiddenError)
      expect(() => assertRolePermission(consultantSession, 'VERIFY_AUDIT_CHAIN')).toThrow(ForbiddenError)
      expect(() => assertRolePermission(consultantSession, 'MANAGE_USERS')).toThrow(ForbiddenError)
    })
  })

  describe('Administrator Role Omniscience', () => {
    it('allows ADMINISTRATOR full access across all operations', () => {
      expect(() => assertRolePermission(adminSession, 'VIEW_REVIEWER_QUEUE')).not.toThrow()
      expect(() => assertRolePermission(adminSession, 'VET_CANDIDATE')).not.toThrow()
      expect(() => assertRolePermission(adminSession, 'VIEW_AUDIT_LOG')).not.toThrow()
      expect(() => assertRolePermission(adminSession, 'VERIFY_AUDIT_CHAIN')).not.toThrow()
      expect(() => assertRolePermission(adminSession, 'MANAGE_USERS')).not.toThrow()
    })
  })

  describe('Cryptographic Tamper Detection Test', () => {
    it('verifies that mutating one database audit row triggers chain verification failure', async () => {
      // 1. Initial seeded chain must verify as valid
      const initialVerification = await verifyAuditChain()
      expect(initialVerification.valid).toBe(true)

      // 2. Locate an audit log record
      const targetLog = await prisma.auditLog.findFirst({
        where: { sequence: 10 },
      })

      if (!targetLog) {
        throw new Error('Audit log record with sequence 10 not found. Check seed.')
      }

      const originalHash = targetLog.entryHash

      // 3. Simulate unauthorized database tampering by corrupting the entryHash
      await prisma.auditLog.update({
        where: { sequence: 10 },
        data: { entryHash: 'deadbeef00000000000000000000000000000000000000000000000000000000' },
      })

      // 4. Verify that audit chain verification now immediately FAILS
      const tamperedVerification = await verifyAuditChain()
      expect(tamperedVerification.valid).toBe(false)
      expect(tamperedVerification.firstTamperedSequence).toBe(10)

      // 5. Restore the original hash to keep test state pristine
      await prisma.auditLog.update({
        where: { sequence: 10 },
        data: { entryHash: originalHash },
      })

      // 6. Verify chain is restored
      const restoredVerification = await verifyAuditChain()
      expect(restoredVerification.valid).toBe(true)
    })
  })
})
