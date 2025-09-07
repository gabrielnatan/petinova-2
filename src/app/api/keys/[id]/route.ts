import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/keys/[id] - Obter detalhes da API key
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode ver detalhes de API keys
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        isActive: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ apiKey })

  } catch (error) {
    console.error('Erro ao buscar API key:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/keys/[id] - Atualizar API key
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode atualizar API keys
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { name, permissions, isActive, expiresAt } = await request.json()

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key não encontrada' }, { status: 404 })
    }

    const updatedApiKey = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(permissions && { permissions }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) })
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        isActive: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'API_KEY_UPDATED',
        details: `API key atualizada: ${updatedApiKey.name}`,
        resourceId: updatedApiKey.id,
        resourceType: 'API_KEY',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      apiKey: updatedApiKey,
      message: 'API key atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar API key:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/keys/[id] - Revogar API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode revogar API keys
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        clinicId: user.clinicId
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key não encontrada' }, { status: 404 })
    }

    // Revogar API key (soft delete)
    await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: user.id
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'API_KEY_REVOKED',
        details: `API key revogada: ${apiKey.name}`,
        resourceId: apiKey.id,
        resourceType: 'API_KEY',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'API key revogada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao revogar API key:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
