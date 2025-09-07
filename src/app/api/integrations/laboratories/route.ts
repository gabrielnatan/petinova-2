import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/integrations/laboratories - Listar laboratórios integrados
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Buscar laboratórios da clínica
    const where: any = {
      clinicId: user.clinicId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [laboratories, total] = await Promise.all([
      prisma.laboratory.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.laboratory.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      laboratories,
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
    console.error('Erro ao buscar laboratórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/integrations/laboratories - Adicionar laboratório
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, code, email, phone, address, apiKey, apiUrl, isActive } = await request.json()

    if (!name || !code || !email) {
      return NextResponse.json({ error: 'Nome, código e email são obrigatórios' }, { status: 400 })
    }

    // Verificar se já existe laboratório com mesmo código
    const existingLab = await prisma.laboratory.findFirst({
      where: {
        clinicId: user.clinicId,
        code
      }
    })

    if (existingLab) {
      return NextResponse.json({ error: 'Já existe um laboratório com este código' }, { status: 400 })
    }

    const laboratory = await prisma.laboratory.create({
      data: {
        name,
        code,
        email,
        phone,
        address,
        apiKey,
        apiUrl,
        isActive: isActive ?? true,
        clinicId: user.clinicId
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        action: 'LABORATORY_CREATED',
        details: `Laboratório criado: ${name} (${code})`,
        resourceId: laboratory.id,
        resourceType: 'LABORATORY',
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      laboratory,
      message: 'Laboratório adicionado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar laboratório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
