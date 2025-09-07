import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'
import { generateTokens } from '@/lib/auth'

// POST /api/auth/2fa/verify - Verificar 2FA durante login
export async function POST(request: NextRequest) {
  try {
    const { email, token, backupCode } = await request.json()

    if (!email || (!token && !backupCode)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clinicId: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA não está ativo para este usuário' }, { status: 400 })
    }

    let isValid = false

    if (backupCode) {
      // Verificar backup code
      const backupCodes = user.twoFactorBackupCodes as string[] || []
      const codeIndex = backupCodes.indexOf(backupCode)
      
      if (codeIndex !== -1) {
        // Remover backup code usado
        backupCodes.splice(codeIndex, 1)
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: backupCodes }
        })
        isValid = true
      }
    } else if (token && user.twoFactorSecret) {
      // Verificar token TOTP
      isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret
      })
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    // Gerar tokens de acesso
    const { accessToken, refreshToken } = await generateTokens(user)

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'LOGIN_2FA',
        details: `Login successful with ${backupCode ? 'backup code' : '2FA token'}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // Configurar cookies
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId
      },
      message: 'Login realizado com sucesso'
    })

    // HttpOnly cookies para tokens
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutos
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    return response

  } catch (error) {
    console.error('Erro ao verificar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
