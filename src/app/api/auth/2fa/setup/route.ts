import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// POST /api/auth/2fa/setup - Configurar 2FA
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Gerar secret único para o usuário
    const secret = authenticator.generateSecret()
    
    // Gerar URL para QR Code
    const otpauth = authenticator.keyuri(
      user.email,
      'Petinova Clinic',
      secret
    )

    // Gerar QR Code
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    // Salvar secret temporariamente (será confirmado após verificação)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false // Só será true após confirmação
      }
    })

    // Gerar backup codes
    const backupCodes = generateBackupCodes()

    return NextResponse.json({
      secret,
      qrCodeUrl,
      backupCodes,
      message: '2FA configurado com sucesso. Escaneie o QR Code e confirme com o código.'
    })

  } catch (error) {
    console.error('Erro ao configurar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/auth/2fa/setup/verify - Verificar e ativar 2FA
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { token, backupCodes } = await request.json()

    // Buscar usuário com secret
    const userWithSecret = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    })

    if (!userWithSecret?.twoFactorSecret) {
      return NextResponse.json({ error: '2FA não configurado' }, { status: 400 })
    }

    if (userWithSecret.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA já está ativo' }, { status: 400 })
    }

    // Verificar token
    const isValid = authenticator.verify({
      token,
      secret: userWithSecret.twoFactorSecret
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    // Ativar 2FA e salvar backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: '2FA_ENABLED',
        details: 'Two-factor authentication enabled',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: '2FA ativado com sucesso',
      backupCodes
    })

  } catch (error) {
    console.error('Erro ao verificar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/auth/2fa/setup - Desativar 2FA
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { token } = await request.json()

    // Buscar usuário com secret
    const userWithSecret = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    })

    if (!userWithSecret?.twoFactorSecret || !userWithSecret.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA não está ativo' }, { status: 400 })
    }

    // Verificar token
    const isValid = authenticator.verify({
      token,
      secret: userWithSecret.twoFactorSecret
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    // Desativar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: '2FA_DISABLED',
        details: 'Two-factor authentication disabled',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: '2FA desativado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao desativar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    // Gerar código de 8 dígitos
    const code = Math.random().toString().slice(2, 10)
    codes.push(code)
  }
  return codes
}
