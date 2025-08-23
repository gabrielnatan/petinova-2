import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const veterinarianCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  crmv: z.object({
    number: z.string().min(1, 'Número do CRMV é obrigatório'),
    state: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    issueDate: z.string().transform((str) => new Date(str)),
    expirationDate: z.string().transform((str) => new Date(str))
  }),
  specialty: z.string().optional(),
  yearsOfExperience: z.number().min(0, 'Anos de experiência deve ser positivo').optional(),
  availabilitySchedule: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  isActive: z.boolean().default(true)
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
    const specialty = searchParams.get('specialty')
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { specialty: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(specialty && { specialty: { contains: specialty, mode: 'insensitive' as const } }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [veterinarians, total] = await Promise.all([
      prisma.veterinarian.findMany({
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
      prisma.veterinarian.count({ where })
    ])

    return NextResponse.json({
      veterinarians: veterinarians.map(vet => ({
        veterinarian_id: vet.id,
        fullName: vet.name,
        email: vet.email,
        phoneNumber: vet.phone,
        crmv: vet.crmv,
        specialty: vet.specialty,
        yearsOfExperience: vet.yearsOfExperience,
        availabilitySchedule: vet.availabilitySchedule,
        avatarUrl: vet.avatarUrl,
        notes: vet.notes,
        isActive: vet.isActive,
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

    // Verificar se já existe veterinário com o mesmo email na clínica
    const existingByEmail = await prisma.veterinarian.findFirst({
      where: {
        email: validatedData.email,
        clinicId: user.clinicId
      }
    })

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Já existe um veterinário com este email cadastrado na clínica' },
        { status: 400 }
      )
    }

    // Verificar se já existe veterinário com o mesmo CRMV
    const existingByCrmv = await prisma.veterinarian.findFirst({
      where: {
        crmv: {
          path: ['number'],
          equals: validatedData.crmv.number
        }
      }
    })

    if (existingByCrmv) {
      return NextResponse.json(
        { error: 'Já existe um veterinário com este CRMV cadastrado' },
        { status: 400 }
      )
    }

    const veterinarian = await prisma.veterinarian.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        crmv: validatedData.crmv,
        specialty: validatedData.specialty,
        yearsOfExperience: validatedData.yearsOfExperience,
        availabilitySchedule: validatedData.availabilitySchedule || [],
        avatarUrl: validatedData.avatarUrl,
        notes: validatedData.notes,
        isActive: validatedData.isActive,
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
        phoneNumber: veterinarian.phone,
        crmv: veterinarian.crmv,
        specialty: veterinarian.specialty,
        yearsOfExperience: veterinarian.yearsOfExperience,
        availabilitySchedule: veterinarian.availabilitySchedule,
        avatarUrl: veterinarian.avatarUrl,
        notes: veterinarian.notes,
        isActive: veterinarian.isActive,
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