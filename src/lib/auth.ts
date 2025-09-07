import { NextRequest } from 'next/server'
import { verifyAccessToken, JWTPayload } from './jwt'

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('accessToken')?.value
  if (cookieToken) return cookieToken
  
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  return verifyAccessToken(token)
}

export { verifyAccessToken as verifyToken }

export async function verifyAuth(request: NextRequest): Promise<string | null> {
  const user = getUserFromRequest(request)
  return user?.userId || null
}