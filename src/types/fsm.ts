export const VETTING_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'MORE_INFO_REQUIRED',
  'VERIFIED',
  'REJECTED',
] as const

export type VettingStatus = (typeof VETTING_STATUSES)[number]

export const VETTING_STATUS_LABELS: Record<VettingStatus, string> = {
  DRAFT: 'Draft Profile',
  SUBMITTED: 'Submitted for Review',
  UNDER_REVIEW: 'Under Governance Review',
  MORE_INFO_REQUIRED: 'More Information Required',
  VERIFIED: 'Verified & Vetted',
  REJECTED: 'Application Rejected',
}
