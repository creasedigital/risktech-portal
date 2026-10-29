import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, DecryptionError, EncryptionError } from './index'

describe('AES-256-GCM Encryption Module', () => {
  it('successfully encrypts and decrypts a sensitive plaintext string', () => {
    const sensitiveData = 'Alice Folashade Okafor — National ID: A092837482'
    const encrypted = encrypt(sensitiveData)

    expect(encrypted).not.toBe(sensitiveData)
    expect(encrypted.split(':')).toHaveLength(3) // iv:authTag:ciphertext

    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(sensitiveData)
  })

  it('generates unique initialization vectors (IVs) for the same plaintext', () => {
    const sensitiveData = '+234 803 555 0192'
    const enc1 = encrypt(sensitiveData)
    const enc2 = encrypt(sensitiveData)

    expect(enc1).not.toBe(enc2) // Different IV and authTag
    expect(decrypt(enc1)).toBe(sensitiveData)
    expect(decrypt(enc2)).toBe(sensitiveData)
  })

  it('rejects tampered ciphertext with DecryptionError', () => {
    const sensitiveData = 'High-Value Board Director Referees'
    const encrypted = encrypt(sensitiveData)
    const [iv, authTag, ciphertext] = encrypted.split(':')

    // Tamper with ciphertext by corrupting a character
    const corruptedCiphertext = (ciphertext?.slice(0, -2) ?? '') + 'XX'
    const tamperedPayload = `${iv}:${authTag}:${corruptedCiphertext}`

    expect(() => decrypt(tamperedPayload)).toThrow(DecryptionError)
  })

  it('rejects tampered authentication tag with DecryptionError', () => {
    const sensitiveData = 'Confidential Remuneration Committee Data'
    const encrypted = encrypt(sensitiveData)
    const [iv, authTag, ciphertext] = encrypted.split(':')

    // Tamper with authentication tag
    const corruptedTag = (authTag?.slice(0, -2) ?? '') + 'ZZ'
    const tamperedPayload = `${iv}:${corruptedTag}:${ciphertext}`

    expect(() => decrypt(tamperedPayload)).toThrow(DecryptionError)
  })

  it('rejects malformed encrypted payloads', () => {
    expect(() => decrypt('not-a-valid-encrypted-string')).toThrow(DecryptionError)
    expect(() => decrypt('only:two-parts')).toThrow(DecryptionError)
    expect(() => decrypt('::')).toThrow(DecryptionError)
  })

  it('verifies custom error types can be instantiated', () => {
    const err = new EncryptionError('Test encryption failure')
    expect(err.name).toBe('EncryptionError')
    expect(err.message).toBe('Test encryption failure')

    const decErr = new DecryptionError('Test decryption failure')
    expect(decErr.name).toBe('DecryptionError')
    expect(decErr.message).toBe('Test decryption failure')
  })
})
