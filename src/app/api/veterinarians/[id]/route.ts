import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const veterinarianUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['VETERINARIAN', 'ASSISTANT']).optional(),
  active: z.boolean().optional()
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
    const veterinarian = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId,
        role: 'VETERINARIAN'
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
                breed: true,
                guardian: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                  }
                }
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
        role: veterinarian.role,
        isActive: veterinarian.active,
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

    // Verificar se o usuário pertence à clínica
    const existingVeterinarian = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId,
        role: 'VETERINARIAN'
      }
    })

    if (!existingVeterinarian) {
      return NextResponse.json({ error: 'Veterinário não encontrado' }, { status: 404 })
    }

    // Se email foi fornecido, verificar se já existe outro usuário com o mesmo email
    if (validatedData.email && validatedData.email !== existingVeterinarian.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: validatedData.email
        }
      })

      if (emailExists && emailExists.id !== resolvedParams.id) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este email cadastrado' },
          { status: 400 }
        )
      }
    }

    const updatedVeterinarian = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.active !== undefined && { active: validatedData.active })
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
        role: updatedVeterinarian.role,
        isActive: updatedVeterinarian.active,
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
    // Verificar se o usuário pertence à clínica
    const existingVeterinarian = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId,
        role: 'VETERINARIAN'
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
      // Ao invés de deletar, apenas desativar o usuário
      await prisma.user.update({
        where: { id: resolvedParams.id },
        data: { active: false }
      })

      return NextResponse.json({
        message: 'Veterinário desativado com sucesso (possui consultas realizadas)'
      })
    }

    await prisma.user.delete({
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