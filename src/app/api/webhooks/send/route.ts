import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import crypto from 'crypto'

// POST /api/webhooks/send - Enviar webhook
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { eventType, data, webhookId } = await request.json()

    if (!eventType || !data) {
      return NextResponse.json({ error: 'Tipo de evento e dados são obrigatórios' }, { status: 400 })
    }

    let webhooks

    if (webhookId) {
      // Enviar para webhook específico
      const webhook = await prisma.webhook.findFirst({
        where: {
          id: webhookId,
          clinicId: user.clinicId,
          isActive: true
        }
      })

      if (!webhook) {
        return NextResponse.json({ error: 'Webhook não encontrado' }, { status: 404 })
      }

      webhooks = [webhook]
    } else {
      // Enviar para todos os webhooks do tipo de evento
      webhooks = await prisma.webhook.findMany({
        where: {
          clinicId: user.clinicId,
          eventType,
          isActive: true
        }
      })
    }

    if (webhooks.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum webhook configurado para este evento',
        sent: 0
      })
    }

    const results = []

    for (const webhook of webhooks) {
      try {
        // Preparar payload
        const payload = {
          event: eventType,
          timestamp: new Date().toISOString(),
          data,
          clinicId: user.clinicId
        }

        // Gerar assinatura se secret estiver configurado
        let signature = ''
        if (webhook.secret) {
          signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(JSON.stringify(payload))
            .digest('hex')
        }

        // Preparar headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Petinova-Webhook/1.0'
        }

        if (signature) {
          headers['X-Petinova-Signature'] = `sha256=${signature}`
        }

        // Adicionar headers customizados
        if (webhook.headers && typeof webhook.headers === 'object') {
          Object.assign(headers, webhook.headers)
        }

        // Enviar webhook
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          timeout: 10000 // 10 segundos
        })

        const success = response.ok
        const statusCode = response.status
        const responseText = await response.text()

        // Registrar tentativa
        await prisma.webhookAttempt.create({
          data: {
            webhookId: webhook.id,
            eventType,
            payload: payload,
            responseStatus: statusCode,
            responseBody: responseText,
            success,
            clinicId: user.clinicId
          }
        })

        results.push({
          webhookId: webhook.id,
          webhookName: webhook.name,
          url: webhook.url,
          success,
          statusCode,
          response: responseText
        })

      } catch (error) {
        console.error(`Erro ao enviar webhook ${webhook.id}:`, error)

        // Registrar tentativa falhada
        await prisma.webhookAttempt.create({
          data: {
            webhookId: webhook.id,
            eventType,
            payload: { event: eventType, data },
            responseStatus: 0,
            responseBody: error instanceof Error ? error.message : 'Erro desconhecido',
            success: false,
            clinicId: user.clinicId
          }
        })

        results.push({
          webhookId: webhook.id,
          webhookName: webhook.name,
          url: webhook.url,
          success: false,
          statusCode: 0,
          response: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.length - successful

    return NextResponse.json({
      message: `Webhooks enviados: ${successful} sucesso, ${failed} falhas`,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    })

  } catch (error) {
    console.error('Erro ao enviar webhooks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/send/attempts - Listar tentativas de webhook
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const webhookId = searchParams.get('webhookId') || ''
    const eventType = searchParams.get('eventType') || ''
    const success = searchParams.get('success')

    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId
    }

    if (webhookId) {
      where.webhookId = webhookId
    }

    if (eventType) {
      where.eventType = eventType
    }

    if (success !== null && success !== undefined) {
      where.success = success === 'true'
    }

    const [attempts, total] = await Promise.all([
      prisma.webhookAttempt.findMany({
        where,
        include: {
          webhook: {
            select: {
              name: true,
              url: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.webhookAttempt.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      attempts,
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
    console.error('Erro ao buscar tentativas de webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
