import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const veterinarianUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  crmv: z.object({
    number: z.string().min(1, 'Número do CRMV é obrigatório'),
    state: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    issueDate: z.string().transform((str) => new Date(str)),
    expirationDate: z.string().transform((str) => new Date(str))
  }).optional(),
  specialty: z.string().optional(),
  yearsOfExperience: z.number().min(0, 'Anos de experiência deve ser positivo').optional(),
  availabilitySchedule: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET /api/veterinarians/[id] - Buscar veterinário específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const veterinarian = await prisma.veterinarian.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        appointments: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true
              }
            },
            guardian: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        },
        consultations: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true
              }
            },
            guardian: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            appointments: true,
            consultations: true
          }
        }
      }
    })

    if (!veterinarian) {
      return NextResponse.json({ error: 'Veterinário não encontrado' }, { status: 404 })
    }

    // Calcular estatísticas adicionais
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = await prisma.appointment.count({
      where: {
        veterinarianId: veterinarian.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const thisMonthConsultations = await prisma.consultation.count({
      where: {
        veterinarianId: veterinarian.id,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      }
    })

    return NextResponse.json({
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
        appointments: veterinarian.appointments,
        consultations: veterinarian.consultations,
        stats: {
          totalAppointments: veterinarian._count.appointments,
          totalConsultations: veterinarian._count.consultations,
          todayAppointments,
          thisMonthConsultations
        },
        created_at: veterinarian.createdAt,
        updated_at: veterinarian.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar veterinário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/veterinarians/[id] - Atualizar veterinário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const validatedData = veterinarianUpdateSchema.parse(body)

    // Verificar se o veterinário pertence à clínica
    const existingVeterinarian = await prisma.veterinarian.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingVeterinarian) {
      return NextResponse.json({ error: 'Veterinário não encontrado' }, { status: 404 })
    }

    // Se email foi fornecido, verificar se já existe outro veterinário com o mesmo email
    if (validatedData.email && validatedData.email !== existingVeterinarian.email) {
      const emailExists = await prisma.veterinarian.findFirst({
        where: {
          email: validatedData.email,
          clinicId: user.clinicId,
          id: { not: resolvedParams.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Já existe um veterinário com este email cadastrado na clínica' },
          { status: 400 }
        )
      }
    }

    // Se CRMV foi fornecido, verificar se já existe outro veterinário com o mesmo CRMV
    if (validatedData.crmv) {
      const crmvExists = await prisma.veterinarian.findFirst({
        where: {
          crmv: {
            path: ['number'],
            equals: validatedData.crmv.number
          },
          id: { not: resolvedParams.id }
        }
      })

      if (crmvExists) {
        return NextResponse.json(
          { error: 'Já existe um veterinário com este CRMV cadastrado' },
          { status: 400 }
        )
      }
    }

    const updatedVeterinarian = await prisma.veterinarian.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.phone && { phone: validatedData.phone }),
        ...(validatedData.crmv && { crmv: validatedData.crmv }),
        ...(validatedData.specialty !== undefined && { specialty: validatedData.specialty }),
        ...(validatedData.yearsOfExperience !== undefined && { yearsOfExperience: validatedData.yearsOfExperience }),
        ...(validatedData.availabilitySchedule !== undefined && { availabilitySchedule: validatedData.availabilitySchedule }),
        ...(validatedData.avatarUrl !== undefined && { avatarUrl: validatedData.avatarUrl }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
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
      message: 'Veterinário atualizado com sucesso',
      veterinarian: {
        veterinarian_id: updatedVeterinarian.id,
        fullName: updatedVeterinarian.name,
        email: updatedVeterinarian.email,
        phoneNumber: updatedVeterinarian.phone,
        crmv: updatedVeterinarian.crmv,
        specialty: updatedVeterinarian.specialty,
        yearsOfExperience: updatedVeterinarian.yearsOfExperience,
        availabilitySchedule: updatedVeterinarian.availabilitySchedule,
        avatarUrl: updatedVeterinarian.avatarUrl,
        notes: updatedVeterinarian.notes,
        isActive: updatedVeterinarian.isActive,
        clinic_id: updatedVeterinarian.clinicId,
        stats: {
          totalAppointments: updatedVeterinarian._count.appointments,
          totalConsultations: updatedVeterinarian._count.consultations
        },
        created_at: updatedVeterinarian.createdAt,
        updated_at: updatedVeterinarian.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar veterinário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/veterinarians/[id] - Deletar veterinário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    // Verificar se o veterinário pertence à clínica
    const existingVeterinarian = await prisma.veterinarian.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: {
                  in: ['SCHEDULED', 'CONFIRMED']
                }
              }
            },
            consultations: true
          }
        }
      }
    })

    if (!existingVeterinarian) {
      return NextResponse.json({ error: 'Veterinário não encontrado' }, { status: 404 })
    }

    // Verificar se o veterinário tem agendamentos futuros
    if (existingVeterinarian._count.appointments > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um veterinário que possui agendamentos futuros' },
        { status: 400 }
      )
    }

    // Verificar se o veterinário tem consultas realizadas
    if (existingVeterinarian._count.consultations > 0) {
      // Ao invés de deletar, apenas desativar o veterinário
      await prisma.veterinarian.update({
        where: { id: resolvedParams.id },
        data: { isActive: false }
      })

      return NextResponse.json({
        message: 'Veterinário desativado com sucesso (possui consultas realizadas)'
      })
    }

    await prisma.veterinarian.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Veterinário excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar veterinário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}