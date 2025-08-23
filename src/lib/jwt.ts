import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import crypto from 'crypto'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'VETERINARIAN' | 'ASSISTANT'
  clinicId: string
  type: 'access' | 'refresh'
}

const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh'

// Duração dos tokens
const ACCESS_TOKEN_EXPIRY = '15m'  // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'  // 7 dias

export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  )
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (decoded.type !== 'access') return null
    return decoded
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JWTPayload
    if (decoded.type !== 'refresh') return null
    return decoded
  } catch {
    return null
  }
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  })
  
  return token
}

export async function validateRefreshToken(token: string): Promise<{ userId: string } | null> {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  })
  
  if (!refreshToken || refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
    return null
  }
  
  return { userId: refreshToken.userId }
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true }
    })
    return true
  } catch {
    return false
  }
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true }
  })
}

export async function cleanupExpiredTokens(): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true }
      ]
    }
  })
}