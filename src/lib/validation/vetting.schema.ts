import { z } from 'zod'
import type { VettingStatus } from '@/types/fsm'

export const VETTING_ACTIONS = [
  'START_REVIEW',       // SUBMITTED -> UNDER_REVIEW
  'REQUEST_MORE_INFO',  // UNDER_REVIEW -> MORE_INFO_REQUIRED
  'VERIFY',             // UNDER_REVIEW -> VERIFIED
  'REJECT',             // UNDER_REVIEW -> REJECTED
  'RESUBMIT',           // MORE_INFO_REQUIRED -> SUBMITTED
] as const

export type VettingAction = (typeof VETTING_ACTIONS)[number]

export const NOTE_REQUIRED_ACTIONS: VettingAction[] = ['REQUEST_MORE_INFO', 'REJECT']

export const FSM_TRANSITION_MAP: Record<string, VettingStatus> = {
  'SUBMITTED:START_REVIEW': 'UNDER_REVIEW',
  'UNDER_REVIEW:REQUEST_MORE_INFO': 'MORE_INFO_REQUIRED',
  'UNDER_REVIEW:VERIFY': 'VERIFIED',
  'UNDER_REVIEW:REJECT': 'REJECTED',
  'MORE_INFO_REQUIRED:RESUBMIT': 'SUBMITTED',
}

export const vettingTransitionSchema = z.object({
  action: z.enum(VETTING_ACTIONS),
  note: z.string().optional(),
}).refine(
  (data: { action: VettingAction; note?: string }) => {
    if (NOTE_REQUIRED_ACTIONS.includes(data.action)) {
      return !!data.note && data.note.trim().length >= 10
    }
    return true
  },
  {
    message: 'A mandatory reviewer note (min 10 characters) is required when requesting more information or rejecting an executive candidate.',
    path: ['note'],
  }
)

export type VettingTransitionInput = z.infer<typeof vettingTransitionSchema>
