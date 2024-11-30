import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from '@/lib/definitions'
import { redirect } from 'next/navigation'

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  throw new Error('SESSION_SECRET is not set in environment variables')
}

const encodedKey = new TextEncoder().encode(secretKey)

// Mã hóa payload thành JWT
export async function encrypt(payload: SessionPayload) {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(encodedKey)
  } catch (error) {
    console.error('Error encrypting the payload:', error)
    throw new Error('Failed to encrypt the payload')
  }
}

// Giải mã JWT thành payload
export async function decrypt(session: string | undefined = '') {
  if (!session) {
    console.error('No session token provided for decryption')
    return null
  }
  
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    console.error('Failed to verify session:', error)
    return null
  }
}

// Tạo session và lưu trong cookie
export async function createSession(email: string, role: string,room_ids: Number[]) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày
    const session = await encrypt({
      email,
      room_ids,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    })

    cookies().set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Cookie bảo mật chỉ cho HTTPS trong production
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })

    return session
  } catch (error) {
    console.error('Failed to create session:', error)
    throw new Error('Failed to create session')
  }
}

// Cập nhật session cookie nếu session còn hiệu lực
export async function updateSession() {
  const session = cookies().get('session')?.value
  
  if (!session) {
    console.warn('No session found for updating')
    return null
  }

  const payload = await decrypt(session)
  
  if (!payload) {
    console.warn('Invalid session payload, skipping update')
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  })

  return session
}

// Xóa session cookie
export function deleteSession() {
  cookies().delete('session');
}
