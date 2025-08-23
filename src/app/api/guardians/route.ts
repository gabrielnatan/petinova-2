import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const guardianCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  cpf: z.string().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }).optional(),
  notes: z.string().optional()
})

// GET /api/guardians - Listar guardians
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
    
    const skip = (page - 1) * limit

    const where = {
      clinicId: user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [guardians, total] = await Promise.all([
      prisma.guardian.findMany({
        where,
        include: {
          _count: {
            select: {
              pets: true
            }
          },
          pets: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true
            },
            take: 5
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.guardian.count({ where })
    ])

    return NextResponse.json({
      guardians: guardians.map(guardian => ({
        guardian_id: guardian.id,
        fullName: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
        cpf: guardian.cpf,
        address: guardian.address,
        notes: guardian.notes,
        clinic_id: guardian.clinicId,
        petsCount: guardian._count.pets,
        pets: guardian.pets.map(pet => ({
          pet_id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed
        })),
        created_at: guardian.createdAt,
        updated_at: guardian.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar guardians:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/guardians - Criar novo guardian
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = guardianCreateSchema.parse(body)

    // Verificar se já existe guardian com o mesmo email na clínica
    const existingGuardian = await prisma.guardian.findFirst({
      where: {
        email: validatedData.email,
        clinicId: user.clinicId
      }
    })

    if (existingGuardian) {
      return NextResponse.json(
        { error: 'Já existe um tutor com este email cadastrado na clínica' },
        { status: 400 }
      )
    }

    const guardian = await prisma.guardian.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        cpf: validatedData.cpf,
        address: validatedData.address,
        notes: validatedData.notes,
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            pets: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Tutor criado com sucesso',
      guardian: {
        guardian_id: guardian.id,
        fullName: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
        cpf: guardian.cpf,
        address: guardian.address,
        notes: guardian.notes,
        clinic_id: guardian.clinicId,
        petsCount: guardian._count.pets,
        created_at: guardian.createdAt,
        updated_at: guardian.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar guardian:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}