import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const appointmentCreateSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  petId: z.string().min(1, 'Pet é obrigatório'),
  veterinarianId: z.string().min(1, 'Veterinário é obrigatório'),
  guardianId: z.string().min(1, 'Tutor é obrigatório'),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED')
})

// GET /api/appointments - Listar agendamentos
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
    const status = searchParams.get('status')
    const veterinarianId = searchParams.get('veterinarianId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const skip = (page - 1) * limit

    const where: any = {
      pet: { clinicId: user.clinicId },
      ...(search && {
        OR: [
          { pet: { name: { contains: search, mode: 'insensitive' as const } } },
          { guardian: { name: { contains: search, mode: 'insensitive' as const } } },
          { veterinarian: { name: { contains: search, mode: 'insensitive' as const } } },
          { notes: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(status && { status }),
      ...(veterinarianId && { veterinarianId }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              avatarUrl: true
            }
          },
          guardian: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
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
        orderBy: [
          { date: 'desc' }
        ]
      }),
      prisma.appointment.count({ where })
    ])

    return NextResponse.json({
      appointments: appointments.map(appointment => ({
        appointment_id: appointment.id,
        date: appointment.date,
        dateTime: appointment.date,
        status: appointment.status,
        notes: appointment.notes,
        pet_id: appointment.petId,
        guardian_id: appointment.guardianId,
        veterinarian_id: appointment.veterinarianId,
        pet: appointment.pet,
        guardian: appointment.guardian,
        veterinarian: appointment.veterinarian,
        created_at: appointment.createdAt,
        updated_at: appointment.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = appointmentCreateSchema.parse(body)

    // Verificar se o pet, tutor e veterinário existem e pertencem à clínica
    const [pet, guardian, veterinarian] = await Promise.all([
      prisma.pet.findFirst({
        where: { id: validatedData.petId, clinicId: user.clinicId },
        include: { guardian: true }
      }),
      prisma.guardian.findFirst({
        where: { id: validatedData.guardianId }
      }),
      prisma.user.findFirst({
        where: { id: validatedData.veterinarianId, clinicId: user.clinicId }
      })
    ])

    if (!pet) {
      return NextResponse.json(
        { error: 'Pet não encontrado' },
        { status: 404 }
      )
    }

    if (!guardian) {
      return NextResponse.json(
        { error: 'Tutor não encontrado' },
        { status: 404 }
      )
    }

    if (!veterinarian) {
      return NextResponse.json(
        { error: 'Veterinário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o pet pertence ao tutor
    if (pet.guardianId !== validatedData.guardianId) {
      return NextResponse.json(
        { error: 'Pet não pertence ao tutor selecionado' },
        { status: 400 }
      )
    }

    // Verificar conflito de horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        date: validatedData.date,
        veterinarianId: validatedData.veterinarianId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Já existe um agendamento para este veterinário nesta data' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: validatedData.date,
        petId: validatedData.petId,
        guardianId: validatedData.guardianId,
        veterinarianId: validatedData.veterinarianId,
        notes: validatedData.notes,
        status: validatedData.status
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            avatarUrl: true
          }
        },
        guardian: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
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
      message: 'Agendamento criado com sucesso',
      appointment: {
        appointment_id: appointment.id,
        date: appointment.date,
        dateTime: appointment.date,
        status: appointment.status,
        notes: appointment.notes,
        pet_id: appointment.petId,
        guardian_id: appointment.guardianId,
        veterinarian_id: appointment.veterinarianId,
        pet: appointment.pet,
        guardian: appointment.guardian,
        veterinarian: appointment.veterinarian,
        created_at: appointment.createdAt,
        updated_at: appointment.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}