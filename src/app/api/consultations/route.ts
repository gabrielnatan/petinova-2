import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const consultationCreateSchema = z.object({
  petId: z.string().min(1, 'Pet é obrigatório'),
  veterinarianId: z.string().min(1, 'Veterinário é obrigatório'),
  guardianId: z.string().min(1, 'Tutor é obrigatório'),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  treatment: z.string().min(1, 'Tratamento é obrigatório'),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  weight: z.number().positive('Peso deve ser positivo').optional(),
  temperature: z.number().positive('Temperatura deve ser positiva').optional(),
  heartRate: z.number().positive('Frequência cardíaca deve ser positiva').optional(),
  respiratoryRate: z.number().positive('Frequência respiratória deve ser positiva').optional(),
  bloodPressure: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']).default('COMPLETED')
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
    const guardianId = searchParams.get('guardianId')
    const status = searchParams.get('status')
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
          { guardian: { name: { contains: search, mode: 'insensitive' as const } } },
          { veterinarian: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
      }),
      ...(veterinarianId && { veterinarianId }),
      ...(petId && { petId }),
      ...(guardianId && { guardianId }),
      ...(status && { status }),
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
              avatarUrl: true
            }
          },
          veterinarian: {
            select: {
              id: true,
              name: true,
              role: true
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
          appointment: {
            select: {
              id: true,
              date: true,
              time: true,
              status: true
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
        pet: consultation.pet,
        veterinarian: consultation.veterinarian,
        guardian: consultation.guardian,
        appointment: consultation.appointment,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        prescription: consultation.prescription,
        notes: consultation.notes,
        followUpDate: consultation.followUpDate,
        vitalSigns: {
          weight: consultation.weight,
          temperature: consultation.temperature,
          heartRate: consultation.heartRate,
          respiratoryRate: consultation.respiratoryRate,
          bloodPressure: consultation.bloodPressure
        },
        symptoms: consultation.symptoms,
        attachments: consultation.attachments,
        status: consultation.status,
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
    const veterinarian = await prisma.veterinarian.findFirst({
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

    // Verificar se o tutor é o dono do pet
    if (validatedData.guardianId !== pet.guardianId) {
      return NextResponse.json(
        { error: 'Este tutor não é responsável pelo pet informado' },
        { status: 400 }
      )
    }

    // Verificar se há agendamento válido (se informado)
    if (validatedData.appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: validatedData.appointmentId,
          petId: validatedData.petId,
          veterinarianId: validatedData.veterinarianId,
          guardianId: validatedData.guardianId
        }
      })

      if (!appointment) {
        return NextResponse.json(
          { error: 'Agendamento não encontrado ou não corresponde aos dados informados' },
          { status: 400 }
        )
      }

      // Verificar se já existe consulta para este agendamento
      const existingConsultation = await prisma.consultation.findFirst({
        where: { appointmentId: validatedData.appointmentId }
      })

      if (existingConsultation) {
        return NextResponse.json(
          { error: 'Já existe uma consulta para este agendamento' },
          { status: 400 }
        )
      }
    }

    const consultation = await prisma.consultation.create({
      data: {
        petId: validatedData.petId,
        veterinarianId: validatedData.veterinarianId,
        guardianId: validatedData.guardianId,
        appointmentId: validatedData.appointmentId,
        diagnosis: validatedData.diagnosis,
        treatment: validatedData.treatment,
        prescription: validatedData.prescription,
        notes: validatedData.notes,
        followUpDate: validatedData.followUpDate,
        weight: validatedData.weight,
        temperature: validatedData.temperature,
        heartRate: validatedData.heartRate,
        respiratoryRate: validatedData.respiratoryRate,
        bloodPressure: validatedData.bloodPressure,
        symptoms: validatedData.symptoms || [],
        attachments: validatedData.attachments || [],
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
        veterinarian: {
          select: {
            id: true,
            name: true,
            specialty: true,
            crmv: true
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
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true
          }
        }
      }
    })

    // Atualizar status do agendamento se aplicável
    if (validatedData.appointmentId) {
      await prisma.appointment.update({
        where: { id: validatedData.appointmentId },
        data: { status: 'COMPLETED' }
      })
    }

    return NextResponse.json({
      message: 'Consulta criada com sucesso',
      consultation: {
        consultation_id: consultation.id,
        pet: consultation.pet,
        veterinarian: consultation.veterinarian,
        guardian: consultation.guardian,
        appointment: consultation.appointment,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        prescription: consultation.prescription,
        notes: consultation.notes,
        followUpDate: consultation.followUpDate,
        vitalSigns: {
          weight: consultation.weight,
          temperature: consultation.temperature,
          heartRate: consultation.heartRate,
          respiratoryRate: consultation.respiratoryRate,
          bloodPressure: consultation.bloodPressure
        },
        symptoms: consultation.symptoms,
        attachments: consultation.attachments,
        status: consultation.status,
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