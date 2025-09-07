import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/auth/sessions - Listar sessões ativas
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Buscar sessões ativas do usuário
    const [sessions, total] = await Promise.all([
      prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          expiresAt: {
            gt: new Date()
          }
        },
        select: {
          id: true,
          token: false, // Não retornar o token por segurança
          expiresAt: true,
          createdAt: true,
          userAgent: true,
          ipAddress: true,
          isRevoked: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.refreshToken.count({
        where: {
          userId: user.id,
          expiresAt: {
            gt: new Date()
          }
        }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      sessions: sessions.map(session => ({
        ...session,
        isCurrent: session.id === request.cookies.get('refreshToken')?.value
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Erro ao buscar sessões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/auth/sessions - Revogar sessão específica
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { status: 400 })
    }

    // Verificar se a sessão pertence ao usuário
    const session = await prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    // Revogar sessão
    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { isRevoked: true }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'SESSION_REVOKED',
        details: `Session revoked: ${sessionId}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Sessão revogada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao revogar sessão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/auth/sessions/revoke-all - Revogar todas as sessões exceto a atual
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const currentToken = request.cookies.get('refreshToken')?.value

    // Revogar todas as sessões exceto a atual
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date()
        },
        isRevoked: false,
        ...(currentToken && { NOT: { token: currentToken } })
      },
      data: { isRevoked: true }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'ALL_SESSIONS_REVOKED',
        details: 'All sessions revoked except current',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Todas as sessões foram revogadas com sucesso'
    })

  } catch (error) {
    console.error('Erro ao revogar sessões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
