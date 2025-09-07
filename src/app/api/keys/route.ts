import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import crypto from 'crypto'

// GET /api/keys - Listar API keys
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode gerenciar API keys
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const active = searchParams.get('active')

    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId
    }

    if (active !== null && active !== undefined) {
      where.isActive = active === 'true'
    }

    const [apiKeys, total] = await Promise.all([
      prisma.apiKey.findMany({
        where,
        select: {
          id: true,
          name: true,
          keyPrefix: true, // Não retornar a chave completa por segurança
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.apiKey.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      apiKeys,
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
    console.error('Erro ao buscar API keys:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/keys - Criar API key
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode criar API keys
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { name, permissions, expiresAt } = await request.json()

    if (!name || !permissions) {
      return NextResponse.json({ error: 'Nome e permissões são obrigatórios' }, { status: 400 })
    }

    // Gerar API key única
    const apiKey = `pk_${crypto.randomBytes(32).toString('hex')}`
    const keyPrefix = apiKey.substring(0, 8) // Prefixo para identificação

    // Verificar se já existe uma key com o mesmo nome
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        clinicId: user.clinicId,
        name
      }
    })

    if (existingKey) {
      return NextResponse.json({ error: 'Já existe uma API key com este nome' }, { status: 400 })
    }

    const newApiKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        keyPrefix,
        permissions: permissions || [],
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        clinicId: user.clinicId,
        createdBy: user.id
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'API_KEY_CREATED',
        details: `API key criada: ${name}`,
        resourceId: newApiKey.id,
        resourceType: 'API_KEY',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      apiKey: {
        id: newApiKey.id,
        name: newApiKey.name,
        key: apiKey, // Retornar apenas na criação
        keyPrefix: newApiKey.keyPrefix,
        permissions: newApiKey.permissions,
        isActive: newApiKey.isActive,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt
      },
      message: 'API key criada com sucesso. Guarde-a em um local seguro.'
    })

  } catch (error) {
    console.error('Erro ao criar API key:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
