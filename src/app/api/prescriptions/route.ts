import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const prescriptionCreateSchema = z.object({
  consultationId: z.string().optional(),
  petId: z.string().min(1, 'Pet é obrigatório'),
  prescriptionNumber: z.string().optional(),
  notes: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string().transform((str) => str ? new Date(str) : new Date()).optional(),
  endDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item é obrigatório'),
    quantity: z.number().int().positive('Quantidade deve ser positiva'),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.string().optional(),
    instructions: z.string().optional()
  })).min(1, 'Pelo menos um item é obrigatório')
})

const prescriptionUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).optional(),
  notes: z.string().optional(),
  instructions: z.string().optional(),
  endDate: z.string().transform((str) => str ? new Date(str) : undefined).optional()
})

// GET /api/prescriptions - Listar prescrições
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
    const petId = searchParams.get('petId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where = {
      clinicId: user.clinicId,
      ...(petId && { petId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        OR: [
          { prescriptionNumber: { contains: search, mode: 'insensitive' as const } },
          { notes: { contains: search, mode: 'insensitive' as const } },
          { instructions: { contains: search, mode: 'insensitive' as const } },
          { pet: { name: { contains: search, mode: 'insensitive' as const } } },
          { veterinarian: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
      })
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true
            }
          },
          veterinarian: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          consultation: {
            select: {
              id: true,
              date: true
            }
          },
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  category: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.prescription.count({ where })
    ])

    return NextResponse.json({
      prescriptions: prescriptions.map(prescription => ({
        prescription_id: prescription.id,
        consultationId: prescription.consultationId,
        petId: prescription.petId,
        prescriptionNumber: prescription.prescriptionNumber,
        status: prescription.status,
        notes: prescription.notes,
        instructions: prescription.instructions,
        startDate: prescription.startDate,
        endDate: prescription.endDate,
        clinicId: prescription.clinicId,
        pet: prescription.pet,
        veterinarian: prescription.veterinarian,
        consultation: prescription.consultation,
        items: prescription.items.map(item => ({
          item_id: item.id,
          prescriptionId: item.prescriptionId,
          itemId: item.itemId,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          isDispensed: item.isDispensed,
          dispensedAt: item.dispensedAt,
          dispensedBy: item.dispensedBy,
          clinicId: item.clinicId,
          item: item.item,
          created_at: item.createdAt,
          updated_at: item.updatedAt
        })),
        created_at: prescription.createdAt,
        updated_at: prescription.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar prescrições:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/prescriptions - Criar nova prescrição
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = prescriptionCreateSchema.parse(body)

    // Verificar se o pet existe
    const pet = await prisma.pet.findUnique({
      where: {
        id: validatedData.petId,
        clinicId: user.clinicId
      }
    })

    if (!pet) {
      return NextResponse.json(
        { error: 'Pet não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a consulta existe (se fornecida)
    if (validatedData.consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: {
          id: validatedData.consultationId,
          petId: validatedData.petId
        }
      })

      if (!consultation) {
        return NextResponse.json(
          { error: 'Consulta não encontrada' },
          { status: 404 }
        )
      }
    }

    // Verificar se os itens existem
    for (const item of validatedData.items) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          id: item.itemId,
          clinicId: user.clinicId
        }
      })

      if (!inventoryItem) {
        return NextResponse.json(
          { error: `Item ${item.itemId} não encontrado` },
          { status: 404 }
        )
      }
    }

    // Gerar número da prescrição se não fornecido
    const prescriptionNumber = validatedData.prescriptionNumber || 
      `PRESC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Criar prescrição com itens
    const prescription = await prisma.prescription.create({
      data: {
        consultationId: validatedData.consultationId,
        petId: validatedData.petId,
        veterinarianId: user.id,
        prescriptionNumber,
        notes: validatedData.notes,
        instructions: validatedData.instructions,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        clinicId: user.clinicId,
        items: {
          create: validatedData.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
            clinicId: user.clinicId
          }))
        }
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        consultation: {
          select: {
            id: true,
            date: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Prescrição criada com sucesso',
      prescription: {
        prescription_id: prescription.id,
        consultationId: prescription.consultationId,
        petId: prescription.petId,
        prescriptionNumber: prescription.prescriptionNumber,
        status: prescription.status,
        notes: prescription.notes,
        instructions: prescription.instructions,
        startDate: prescription.startDate,
        endDate: prescription.endDate,
        clinicId: prescription.clinicId,
        pet: prescription.pet,
        veterinarian: prescription.veterinarian,
        consultation: prescription.consultation,
        items: prescription.items.map(item => ({
          item_id: item.id,
          prescriptionId: item.prescriptionId,
          itemId: item.itemId,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          isDispensed: item.isDispensed,
          dispensedAt: item.dispensedAt,
          dispensedBy: item.dispensedBy,
          clinicId: item.clinicId,
          item: item.item,
          created_at: item.createdAt,
          updated_at: item.updatedAt
        })),
        created_at: prescription.createdAt,
        updated_at: prescription.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
