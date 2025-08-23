import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const consultationCreateSchema = z.object({
  petId: z.string().min(1, 'Pet é obrigatório'),
  veterinarianId: z.string().min(1, 'Veterinário é obrigatório'),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional()
})

// GET /api/consultations - Listar consultas
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
    const veterinarianId = searchParams.get('veterinarianId')
    const petId = searchParams.get('petId')
    // const guardianId = searchParams.get('guardianId')
    // const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const skip = (page - 1) * limit

    const where: any = {
      pet: {
        clinicId: user.clinicId
      },
      ...(search && {
        OR: [
          { diagnosis: { contains: search, mode: 'insensitive' as const } },
          { treatment: { contains: search, mode: 'insensitive' as const } },
          { pet: { name: { contains: search, mode: 'insensitive' as const } } },
          { pet: { guardian: { name: { contains: search, mode: 'insensitive' as const } } } },
          { veterinarian: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
      }),
      ...(veterinarianId && { veterinarianId }),
      ...(petId && { petId }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              avatarUrl: true,
              guardian: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          veterinarian: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.consultation.count({ where })
    ])

    return NextResponse.json({
      consultations: consultations.map(consultation => ({
        consultation_id: consultation.id,
        pet: {
          id: consultation.pet.id,
          name: consultation.pet.name,
          species: consultation.pet.species,
          breed: consultation.pet.breed,
          avatarUrl: consultation.pet.avatarUrl
        },
        veterinarian: consultation.veterinarian,
        guardian: consultation.pet.guardian,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        notes: consultation.notes,
        date: consultation.date,
        created_at: consultation.createdAt,
        updated_at: consultation.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar consultas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/consultations - Criar nova consulta
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = consultationCreateSchema.parse(body)

    // Verificar se o pet pertence à clínica
    const pet = await prisma.pet.findFirst({
      where: {
        id: validatedData.petId,
        clinicId: user.clinicId
      },
      include: {
        guardian: true
      }
    })

    if (!pet) {
      return NextResponse.json(
        { error: 'Pet não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o veterinário pertence à clínica
    const veterinarian = await prisma.user.findFirst({
      where: {
        id: validatedData.veterinarianId,
        clinicId: user.clinicId
      }
    })

    if (!veterinarian) {
      return NextResponse.json(
        { error: 'Veterinário não encontrado' },
        { status: 404 }
      )
    }

    const consultation = await prisma.consultation.create({
      data: {
        petId: validatedData.petId,
        veterinarianId: validatedData.veterinarianId,
        diagnosis: validatedData.diagnosis,
        treatment: validatedData.treatment,
        notes: validatedData.notes
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            avatarUrl: true,
            guardian: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })


    return NextResponse.json({
      message: 'Consulta criada com sucesso',
      consultation: {
        consultation_id: consultation.id,
        pet: {
          id: consultation.pet.id,
          name: consultation.pet.name,
          species: consultation.pet.species,
          breed: consultation.pet.breed,
          avatarUrl: consultation.pet.avatarUrl
        },
        veterinarian: consultation.veterinarian,
        guardian: consultation.pet.guardian,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        notes: consultation.notes,
        date: consultation.date,
        created_at: consultation.createdAt,
        updated_at: consultation.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}