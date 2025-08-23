import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const petCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  breed: z.string().optional(),
  size: z.string().optional(),
  weight: z.number().positive().optional(),
  isNeutered: z.boolean().default(false),
  environment: z.string().optional(),
  birthDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  notes: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  guardianId: z.string().min(1, 'Tutor é obrigatório')
})

// GET /api/pets - Listar pets da clínica
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
    const guardianId = searchParams.get('guardianId')

    const skip = (page - 1) * limit

    const where = {
      clinicId: user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { species: { contains: search, mode: 'insensitive' as const } },
          { breed: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(guardianId && { guardianId })
    }

    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        include: {
          guardian: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pet.count({ where })
    ])

    return NextResponse.json({
      pets: pets.map(pet => ({
        pet_id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        size: pet.size,
        weight: pet.weight,
        isNeutered: pet.isNeutered,
        environment: pet.environment,
        birthDate: pet.birthDate,
        notes: pet.notes,
        avatarUrl: pet.avatarUrl,
        guardian_id: pet.guardianId,
        clinic_id: pet.clinicId,
        guardian: pet.guardian,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar pets:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/pets - Criar novo pet
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = petCreateSchema.parse(body)

    // Verificar se o guardian existe
    const guardian = await prisma.guardian.findUnique({
      where: {
        id: validatedData.guardianId,
      }
    })

    if (!guardian) {
      return NextResponse.json(
        { error: 'Tutor não encontrado' },
        { status: 404 }
      )
    }

    const pet = await prisma.pet.create({
      data: {
        name: validatedData.name,
        species: validatedData.species,
        breed: validatedData.breed,
        size: validatedData.size,
        weight: validatedData.weight,
        isNeutered: validatedData.isNeutered,
        environment: validatedData.environment,
        birthDate: validatedData.birthDate,
        notes: validatedData.notes,
        avatarUrl: validatedData.avatarUrl,
        guardianId: validatedData.guardianId,
        clinicId: user.clinicId
      },
      include: {
        guardian: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Pet criado com sucesso',
      pet: {
        pet_id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        size: pet.size,
        weight: pet.weight,
        isNeutered: pet.isNeutered,
        environment: pet.environment,
        birthDate: pet.birthDate,
        notes: pet.notes,
        avatarUrl: pet.avatarUrl,
        guardian_id: pet.guardianId,
        clinic_id: pet.clinicId,
        guardian: pet.guardian,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar pet:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}