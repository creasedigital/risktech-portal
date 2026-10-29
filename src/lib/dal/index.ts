import type { Role } from '@/types/roles'
import type { SessionUser } from '@/lib/auth/session'

export type PermissionKey =
  | 'SUBMIT_ONBOARDING'
  | 'VIEW_OWN_PROFILE'
  | 'REVEAL_PII'
  | 'WITHDRAW_CONSENT'
  | 'EXPORT_DATA'
  | 'VIEW_REVIEWER_QUEUE'
  | 'VET_CANDIDATE'
  | 'DOWNLOAD_DOCUMENT'
  | 'VIEW_AUDIT_LOG'
  | 'VERIFY_AUDIT_CHAIN'
  | 'MANAGE_USERS'
  | 'VIEW_ADMIN_ANALYTICS'

const PERMISSION_MATRIX: Record<PermissionKey, Role[]> = {
  SUBMIT_ONBOARDING: ['EXECUTIVE'],
  VIEW_OWN_PROFILE: ['EXECUTIVE', 'ADMINISTRATOR'],
  REVEAL_PII: ['EXECUTIVE', 'ADMINISTRATOR'],
  WITHDRAW_CONSENT: ['EXECUTIVE', 'ADMINISTRATOR'],
  EXPORT_DATA: ['EXECUTIVE', 'ADMINISTRATOR'],
  VIEW_REVIEWER_QUEUE: ['CONSULTANT', 'ADMINISTRATOR'],
  VET_CANDIDATE: ['CONSULTANT', 'ADMINISTRATOR'],
  DOWNLOAD_DOCUMENT: ['CONSULTANT', 'ADMINISTRATOR'],
  VIEW_AUDIT_LOG: ['ADMINISTRATOR'],
  VERIFY_AUDIT_CHAIN: ['ADMINISTRATOR'],
  MANAGE_USERS: ['ADMINISTRATOR'],
  VIEW_ADMIN_ANALYTICS: ['ADMINISTRATOR'],
}

export class ForbiddenError extends Error {
  public code = 'FORBIDDEN'
  public statusCode = 403

  constructor(message = 'Access Denied: You do not possess the requisite governance role to execute this action.') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class UnauthorizedError extends Error {
  public code = 'UNAUTHORIZED'
  public statusCode = 401

  constructor(message = 'Authentication Required: Please sign in.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Asserts that the current session user has permission to execute the specified action.
 * Throws ForbiddenError or UnauthorizedError if not authorized.
 */
export function assertRolePermission(session: SessionUser | null | undefined, action: PermissionKey): void {
  if (!session) {
    throw new UnauthorizedError()
  }

  const allowedRoles = PERMISSION_MATRIX[action]
  if (!allowedRoles || !allowedRoles.includes(session.role)) {
    throw new ForbiddenError(
      `Access Denied: Role '${session.role}' is not authorized for action '${action}'. Required: ${allowedRoles?.join(', ')}`
    )
  }
}

export function hasRolePermission(session: SessionUser | null | undefined, action: PermissionKey): boolean {
  if (!session) return false
  const allowedRoles = PERMISSION_MATRIX[action]
  return !!allowedRoles && allowedRoles.includes(session.role)
}
