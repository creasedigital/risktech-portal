import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GrcBadge, type GrcStatusType } from './GrcBadge'

describe('GrcBadge Component', () => {
  const statuses: GrcStatusType[] = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'MORE_INFO_REQUIRED',
    'VERIFIED',
    'REJECTED',
  ]

  statuses.forEach((status) => {
    it(`renders correctly for status: ${status}`, () => {
      const { container } = render(<GrcBadge status={status} size="md" />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('supports small size variant', () => {
    render(<GrcBadge status="VERIFIED" size="sm" />)
    expect(screen.getByText('Verified & Vetted')).toBeInTheDocument()
  })

  it('handles unknown or default status gracefully', () => {
    // @ts-expect-error Testing fallback
    render(<GrcBadge status="UNKNOWN_STATUS" />)
    expect(screen.getByText('Draft Application')).toBeInTheDocument()
  })
})
