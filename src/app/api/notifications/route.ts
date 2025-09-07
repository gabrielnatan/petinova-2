import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/notifications - Listar notificações
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || ''
    const read = searchParams.get('read')

    const skip = (page - 1) * limit

    const where: any = {
      userId: user.id
    }

    if (type) {
      where.type = type
    }

    if (read !== null && read !== undefined) {
      where.read = read === 'true'
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      notifications,
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
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Criar notificação
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { title, message, type, priority, data, recipients } = await request.json()

    if (!title || !message || !type) {
      return NextResponse.json({ error: 'Título, mensagem e tipo são obrigatórios' }, { status: 400 })
    }

    const notifications = []

    // Se recipients não foi especificado, enviar para o usuário atual
    const targetUsers = recipients || [user.id]

    for (const userId of targetUsers) {
      // Verificar se o usuário existe e pertence à mesma clínica
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          clinicId: user.clinicId
        }
      })

      if (targetUser) {
        const notification = await prisma.notification.create({
          data: {
            title,
            message,
            type,
            priority: priority || 'NORMAL',
            data: data || {},
            userId: targetUser.id,
            clinicId: user.clinicId
          }
        })

        notifications.push(notification)
      }
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'NOTIFICATION_CREATED',
        details: `Notificação criada: ${title} (${type})`,
        resourceType: 'NOTIFICATION',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      notifications,
      message: `${notifications.length} notificação(ões) criada(s) com sucesso`
    })

  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Marcar notificações como lidas
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { notificationIds, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Marcar todas as notificações do usuário como lidas
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'Todas as notificações foram marcadas como lidas'
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marcar notificações específicas como lidas
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: user.id
        },
        data: {
          read: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({
        message: `${notificationIds.length} notificação(ões) marcada(s) como lida(s)`
      })
    } else {
      return NextResponse.json({ error: 'IDs de notificação ou markAllAsRead são obrigatórios' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
