import { describe, it, expect } from 'vitest'
import {
  vettingTransitionSchema,
  FSM_TRANSITION_MAP,
} from './vetting.schema'

describe('Vetting FSM & Validation Schema', () => {
  it('allows START_REVIEW without note', () => {
    const valid = vettingTransitionSchema.safeParse({ action: 'START_REVIEW' })
    expect(valid.success).toBe(true)
  })

  it('allows VERIFY with or without note', () => {
    const withoutNote = vettingTransitionSchema.safeParse({ action: 'VERIFY' })
    expect(withoutNote.success).toBe(true)

    const withNote = vettingTransitionSchema.safeParse({
      action: 'VERIFY',
      note: 'Primary credentials fully verified via regulatory source.',
    })
    expect(withNote.success).toBe(true)
  })

  it('rejects REQUEST_MORE_INFO when note is missing or under 10 chars', () => {
    const noNote = vettingTransitionSchema.safeParse({ action: 'REQUEST_MORE_INFO' })
    expect(noNote.success).toBe(false)
    if (!noNote.success) {
      expect(noNote.error.issues[0]?.message).toContain('min 10 characters')
    }

    const shortNote = vettingTransitionSchema.safeParse({
      action: 'REQUEST_MORE_INFO',
      note: 'Need ID',
    })
    expect(shortNote.success).toBe(false)

    const validNote = vettingTransitionSchema.safeParse({
      action: 'REQUEST_MORE_INFO',
      note: 'Please provide updated proof of executive directorship.',
    })
    expect(validNote.success).toBe(true)
  })

  it('rejects REJECT when note is missing or under 10 chars', () => {
    const noNote = vettingTransitionSchema.safeParse({ action: 'REJECT' })
    expect(noNote.success).toBe(false)

    const validNote = vettingTransitionSchema.safeParse({
      action: 'REJECT',
      note: 'Does not meet minimum institutional board tenure criteria.',
    })
    expect(validNote.success).toBe(true)
  })

  it('maps valid state transitions deterministically', () => {
    expect(FSM_TRANSITION_MAP['SUBMITTED:START_REVIEW']).toBe('UNDER_REVIEW')
    expect(FSM_TRANSITION_MAP['UNDER_REVIEW:REQUEST_MORE_INFO']).toBe('MORE_INFO_REQUIRED')
    expect(FSM_TRANSITION_MAP['UNDER_REVIEW:VERIFY']).toBe('VERIFIED')
    expect(FSM_TRANSITION_MAP['UNDER_REVIEW:REJECT']).toBe('REJECTED')
    expect(FSM_TRANSITION_MAP['MORE_INFO_REQUIRED:RESUBMIT']).toBe('SUBMITTED')

    // Disallowed transitions
    expect(FSM_TRANSITION_MAP['SUBMITTED:VERIFY']).toBeUndefined()
    expect(FSM_TRANSITION_MAP['VERIFIED:START_REVIEW']).toBeUndefined()
    expect(FSM_TRANSITION_MAP['REJECTED:VERIFY']).toBeUndefined()
  })
})
