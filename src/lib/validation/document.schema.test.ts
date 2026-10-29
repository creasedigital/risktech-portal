import { describe, it, expect } from 'vitest'
import {
  validateMagicBytes,
  documentUploadFormSchema,
  MAX_FILE_SIZE_BYTES,
} from './document.schema'

describe('Document Upload Validation & Magic Bytes', () => {
  it('validates authentic PDF magic bytes (%PDF)', () => {
    // 0x25 0x50 0x44 0x46 ("%PDF")
    const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35])
    const res = validateMagicBytes(pdfHeader)
    expect(res.valid).toBe(true)
    expect(res.detectedMime).toBe('application/pdf')
  })

  it('validates authentic PNG magic bytes', () => {
    // 0x89 0x50 0x4E 0x47 ("\x89PNG")
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const res = validateMagicBytes(pngHeader)
    expect(res.valid).toBe(true)
    expect(res.detectedMime).toBe('image/png')
  })

  it('validates authentic JPEG magic bytes', () => {
    // 0xFF 0xD8 0xFF
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
    const res = validateMagicBytes(jpegHeader)
    expect(res.valid).toBe(true)
    expect(res.detectedMime).toBe('image/jpeg')
  })

  it('rejects spoofed file with malicious/invalid binary header', () => {
    // An executable or HTML disguised as PDF
    const spoofedHeader = Buffer.from('<!DOCTYPE html><html><body>malicious</body></html>')
    const res = validateMagicBytes(spoofedHeader)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Spoofed MIME')
  })

  it('rejects buffer shorter than 4 bytes', () => {
    const tinyBuffer = Buffer.from([0x25, 0x50])
    const res = validateMagicBytes(tinyBuffer)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('buffer too short')
  })

  it('enforces 10MB maximum file size limit', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024)
  })

  it('validates allowed document upload types', () => {
    expect(documentUploadFormSchema.safeParse({ type: 'CV' }).success).toBe(true)
    expect(documentUploadFormSchema.safeParse({ type: 'IDENTIFICATION' }).success).toBe(true)
    expect(documentUploadFormSchema.safeParse({ type: 'CERTIFICATION' }).success).toBe(true)
    expect(documentUploadFormSchema.safeParse({ type: 'MALICIOUS_TYPE' }).success).toBe(false)
  })
})
