import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { PasswordService } from '@/lib/password'
import { z } from 'zod'

const veterinarianCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role: z.enum(['VETERINARIAN', 'ASSISTANT']).default('VETERINARIAN'),
  active: z.boolean().default(true)
})

// GET /api/veterinarians - Listar veterinários
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    // const specialty = searchParams.get('specialty')
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId,
      role: 'VETERINARIAN',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(isActive !== null && { active: isActive === 'true' })
    }

    const [veterinarians, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              appointments: {
                where: {
                  date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                  }
                }
              },
              consultations: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      veterinarians: veterinarians.map(vet => ({
        veterinarian_id: vet.id,
        fullName: vet.name,
        email: vet.email,
        role: vet.role,
        isActive: vet.active,
        clinic_id: vet.clinicId,
        stats: {
          todayAppointments: vet._count.appointments,
          totalConsultations: vet._count.consultations
        },
        created_at: vet.createdAt,
        updated_at: vet.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar veterinários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/veterinarians - Criar novo veterinário
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = veterinarianCreateSchema.parse(body)

    // Validar força da senha
    const passwordValidation = PasswordService.validatePasswordStrength(validatedData.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha não atende aos critérios de segurança', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Verificar se já existe usuário com o mesmo email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await PasswordService.hashPassword(validatedData.password)

    const veterinarian = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        active: validatedData.active,
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            appointments: true,
            consultations: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Veterinário criado com sucesso',
      veterinarian: {
        veterinarian_id: veterinarian.id,
        fullName: veterinarian.name,
        email: veterinarian.email,
        role: veterinarian.role,
        isActive: veterinarian.active,
        clinic_id: veterinarian.clinicId,
        stats: {
          todayAppointments: veterinarian._count.appointments,
          totalConsultations: veterinarian._count.consultations
        },
        created_at: veterinarian.createdAt,
        updated_at: veterinarian.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar veterinário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}