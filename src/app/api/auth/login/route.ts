import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PasswordService } from '@/lib/password'
import { z } from 'zod'
import { generateAccessToken, createRefreshToken } from '@/lib/jwt'
import { AuditLogger } from '@/lib/audit-log'

// Rate limiting simples em memória (em produção, usar Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutos

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedData = loginSchema.parse(body)
    
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const attempts = loginAttempts.get(clientIP)
    
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = now - attempts.lastAttempt
      if (timeSinceLastAttempt < LOCKOUT_TIME) {
        return NextResponse.json(
          { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
          { status: 429 }
        )
      } else {
        // Reset attempts after lockout period
        loginAttempts.delete(clientIP)
      }
    }
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        clinic: true
      }
    })
    
    if (!user || !user.active) {
      // Registrar tentativa falhada
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientIP, { 
        count: currentAttempts.count + 1, 
        lastAttempt: now 
      })
      
      // Log de auditoria
      await AuditLogger.logLoginFailed(validatedData.email, 'Usuário inativo', clientIP, request.headers.get('user-agent'))
      
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    const passwordMatch = await PasswordService.comparePassword(validatedData.password, user.password)
    
    if (!passwordMatch) {
      // Registrar tentativa falhada
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientIP, { 
        count: currentAttempts.count + 1, 
        lastAttempt: now 
      })
      
      // Log de auditoria
      await AuditLogger.logLoginFailed(validatedData.email, 'Senha incorreta', clientIP, request.headers.get('user-agent'))
      
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Login bem-sucedido - limpar tentativas
    loginAttempts.delete(clientIP)
    
    // Log de auditoria de sucesso
    await AuditLogger.logLoginSuccess(user.id, user.email, clientIP, request.headers.get('user-agent'))
    
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId
    })
    
    const refreshToken = await createRefreshToken(user.id)
    
    const response = NextResponse.json(
      { 
        message: 'Login realizado com sucesso',
        user: {
          user_id: user.id,
          fullName: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          active: user.active,
          clinic_id: user.clinicId,
          created_at: user.createdAt
        },
        clinic: {
          clinic_id: user.clinic.id,
          legalName: user.clinic.legalName,
          tradeName: user.clinic.tradeName,
          cnpj: user.clinic.cnpj,
          email: user.clinic.email,
          address: user.clinic.address,
          isActive: user.clinic.isActive,
          created_at: user.clinic.createdAt
        },
        accessToken,
        refreshToken
      },
      { status: 200 }
    )
    
    // Set access token cookie (15 minutes)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    
    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth' // Only send to auth endpoints
    })
    
    return response
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}