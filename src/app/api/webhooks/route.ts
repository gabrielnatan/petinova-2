import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/webhooks - Listar webhooks configurados
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const eventType = searchParams.get('eventType') || ''

    const skip = (page - 1) * limit

    // Buscar webhooks da clínica
    const where: any = {
      clinicId: user.clinicId
    }

    if (eventType) {
      where.eventType = eventType
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.webhook.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      webhooks,
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
    console.error('Erro ao buscar webhooks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/webhooks - Criar webhook
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, url, eventType, secret, isActive, headers } = await request.json()

    if (!name || !url || !eventType) {
      return NextResponse.json({ error: 'Nome, URL e tipo de evento são obrigatórios' }, { status: 400 })
    }

    // Validar URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        eventType,
        secret,
        isActive: isActive ?? true,
        headers: headers || {},
        clinicId: user.clinicId
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'WEBHOOK_CREATED',
        details: `Webhook criado: ${name} (${eventType})`,
        resourceId: webhook.id,
        resourceType: 'WEBHOOK',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      webhook,
      message: 'Webhook criado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
