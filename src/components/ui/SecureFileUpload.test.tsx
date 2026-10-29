import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecureFileUpload } from './SecureFileUpload'

describe('SecureFileUpload Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders upload dropzone with labels', () => {
    render(
      <SecureFileUpload
        type="CV"
        label="Executive Curriculum Vitae"
        description="PDF up to 10MB"
      />
    )

    expect(screen.getByText('Executive Curriculum Vitae')).toBeInTheDocument()
    expect(screen.getByText('PDF up to 10MB')).toBeInTheDocument()
    expect(screen.getByText('Drop document here or click to browse')).toBeInTheDocument()
  })

  it('rejects client-side file exceeding 10MB limit', async () => {
    const user = userEvent.setup()
    render(
      <SecureFileUpload
        type="CV"
        label="Executive CV"
      />
    )

    // Create a mock 11MB file
    const oversizedFile = new File(['a'.repeat(100)], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 })

    const input = screen.getByTestId('file-input-CV')
    await user.upload(input, oversizedFile)

    expect(await screen.findByText('File exceeds maximum size of 10MB.')).toBeInTheDocument()
  })

  it('displays uploaded document info on upload success', async () => {
    const mockSuccess = vi.fn()
    const user = userEvent.setup()

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        document: {
          id: 'doc-123',
          originalName: 'Board_CV.pdf',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          type: 'CV',
        },
      }),
    } as unknown as Response)

    render(
      <SecureFileUpload
        type="CV"
        label="Executive CV"
        onUploadSuccess={mockSuccess}
      />
    )

    const validFile = new File(['%PDF-test'], 'Board_CV.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input-CV')
    await user.upload(input, validFile)

    await waitFor(() => {
      expect(screen.getByText('Board_CV.pdf')).toBeInTheDocument()
      expect(screen.getByText(/SHA-256:/)).toBeInTheDocument()
      expect(mockSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 'doc-123' }))
    })
  })
})
