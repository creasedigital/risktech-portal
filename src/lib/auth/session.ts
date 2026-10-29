import type { Role } from '@/types/roles'

export interface SessionUser {
  id: string
  email: string
  role: Role
  name: string
}

const COOKIE_NAME = 'risktech_session'
const SECRET = process.env.NEXTAUTH_SECRET || 'risktech-development-secret-entropy-32-chars-long'

function bytesToBase64Url(bytes: Uint8Array): string {
  let binString = ''
  for (let i = 0; i < bytes.length; i++) {
    binString += String.fromCharCode(bytes[i]!)
  }
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4 !== 0) {
    b64 += '='
  }
  const binString = atob(b64)
  const bytes = new Uint8Array(binString.length)
  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i)
  }
  return bytes
}

let cachedKey: CryptoKey | null = null

async function getHmacKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  const enc = new TextEncoder()
  cachedKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
  return cachedKey
}

export async function signPayload(payload: SessionUser): Promise<string> {
  const enc = new TextEncoder()
  const data = bytesToBase64Url(enc.encode(JSON.stringify(payload)))
  const key = await getHmacKey()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  const signature = bytesToBase64Url(new Uint8Array(sig))
  return `${data}.${signature}`
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null

    const key = await getHmacKey()
    const enc = new TextEncoder()
    const sigBytes = base64UrlToBytes(signature)
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as unknown as BufferSource, enc.encode(data))
    if (!isValid) return null

    const json = new TextDecoder().decode(base64UrlToBytes(data))
    const user = JSON.parse(json) as SessionUser
    if (!user.id || !user.role || !user.email) return null

    return user
  } catch {
    return null
  }
}

export { COOKIE_NAME }
