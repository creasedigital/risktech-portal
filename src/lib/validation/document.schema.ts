import { z } from 'zod'

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB limit

export const ALLOWED_DOCUMENT_TYPES = ['CV', 'IDENTIFICATION', 'CERTIFICATION', 'OTHER'] as const
export type DocumentTypeKey = (typeof ALLOWED_DOCUMENT_TYPES)[number]

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'] as const

/**
 * Validates file magic-byte binary signatures
 */
export function validateMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string; error?: string } {
  if (buffer.length < 4) {
    return { valid: false, error: 'File buffer too short to verify signature' }
  }

  // 1. PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, detectedMime: 'application/pdf' }
  }

  // 2. PNG Magic Bytes: \x89PNG (0x89 0x50 0x4E 0x47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, detectedMime: 'image/png' }
  }

  // 3. JPEG Magic Bytes: \xFF\xD8\xFF (0xFF 0xD8 0xFF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' }
  }

  return {
    valid: false,
    error: 'Spoofed MIME or unsupported file header detected. File is not a valid PDF, PNG, or JPEG.',
  }
}

export const documentUploadFormSchema = z.object({
  type: z.enum(ALLOWED_DOCUMENT_TYPES),
})
