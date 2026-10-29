import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits recommended for GCM

function getEncryptionKey(): Buffer {
  const hexKey = process.env.APP_ENCRYPTION_KEY || process.env.TEST_ENCRYPTION_KEY
  if (!hexKey) {
    // Fallback deterministic 32-byte test key if env is not loaded (e.g. in standalone script)
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex')
  }
  return Buffer.from(hexKey, 'hex')
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DecryptionError'
  }
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext}`
  } catch (err) {
    throw new EncryptionError(`Failed to encrypt payload: ${(err as Error).message}`)
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string with authentication tag verification.
 * Input format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function decrypt(encryptedPayload: string): string {
  try {
    const parts = encryptedPayload.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format. Expected iv:authTag:ciphertext')
    }

    const ivStr = parts[0]
    const authTagStr = parts[1]
    const ciphertextStr = parts[2]

    if (!ivStr || !authTagStr || !ciphertextStr) {
      throw new Error('Missing encryption component in payload')
    }

    const key = getEncryptionKey()
    const iv = Buffer.from(ivStr, 'base64')
    const authTag = Buffer.from(authTagStr, 'base64')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertextStr, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (err) {
    throw new DecryptionError(`Failed to decrypt payload or authentication tag mismatch: ${(err as Error).message}`)
  }
}
