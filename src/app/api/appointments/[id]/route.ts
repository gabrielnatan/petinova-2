import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const appointmentUpdateSchema = z.object({
  date: z.string().transform((str) => new Date(str)).optional(),
  petId: z.string().min(1, 'Pet é obrigatório').optional(),
  veterinarianId: z.string().min(1, 'Veterinário é obrigatório').optional(),
  guardianId: z.string().min(1, 'Tutor é obrigatório').optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional()
})

// GET /api/appointments/[id] - Buscar agendamento específico
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
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      },
      include: {
        pet: {
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
        },
        guardian: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
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

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      appointment: {
        appointment_id: appointment.id,
        date: appointment.date,
        dateTime: appointment.date,
        status: appointment.status,
        notes: appointment.notes,
        pet_id: appointment.petId,
        guardian_id: appointment.guardianId,
        veterinarian_id: appointment.veterinarianId,
        pet: {
          pet_id: appointment.pet.id,
          name: appointment.pet.name,
          species: appointment.pet.species,
          breed: appointment.pet.breed,
          size: appointment.pet.size,
          weight: appointment.pet.weight,
          isNeutered: appointment.pet.isNeutered,
          birthDate: appointment.pet.birthDate,
          avatarUrl: appointment.pet.avatarUrl,
          guardian: appointment.pet.guardian
        },
        guardian: appointment.guardian,
        veterinarian: appointment.veterinarian,
        created_at: appointment.createdAt,
        updated_at: appointment.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Atualizar agendamento
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
    const validatedData = appointmentUpdateSchema.parse(body)

    // Verificar se o agendamento pertence à clínica
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      }
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Verificar se pet, tutor e veterinário existem (se fornecidos)
    if (validatedData.petId || validatedData.guardianId || validatedData.veterinarianId) {
      const [pet, guardian, veterinarian] = await Promise.all([
        validatedData.petId ? prisma.pet.findFirst({
          where: { id: validatedData.petId, clinicId: user.clinicId },
          include: { guardian: true }
        }) : null,
        validatedData.guardianId ? prisma.guardian.findFirst({
          where: { id: validatedData.guardianId }
        }) : null,
        validatedData.veterinarianId ? prisma.user.findFirst({
          where: { id: validatedData.veterinarianId, clinicId: user.clinicId }
        }) : null
      ])

      if (validatedData.petId && !pet) {
        return NextResponse.json(
          { error: 'Pet não encontrado' },
          { status: 404 }
        )
      }

      if (validatedData.guardianId && !guardian) {
        return NextResponse.json(
          { error: 'Tutor não encontrado' },
          { status: 404 }
        )
      }

      if (validatedData.veterinarianId && !veterinarian) {
        return NextResponse.json(
          { error: 'Veterinário não encontrado' },
          { status: 404 }
        )
      }

      // Verificar se o pet pertence ao tutor
      if (pet && validatedData.guardianId && pet.guardianId !== validatedData.guardianId) {
        return NextResponse.json(
          { error: 'Pet não pertence ao tutor selecionado' },
          { status: 400 }
        )
      }
    }

    // Verificar conflito de horário (se data ou veterinário mudaram)
    if (validatedData.date || validatedData.veterinarianId) {
      const checkDate = validatedData.date || existingAppointment.date
      const checkVetId = validatedData.veterinarianId || existingAppointment.veterinarianId

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          date: checkDate,
          veterinarianId: checkVetId,
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          },
          id: { not: resolvedParams.id }
        }
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Já existe um agendamento para este veterinário nesta data' },
          { status: 400 }
        )
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.date && { date: validatedData.date }),
        ...(validatedData.petId && { petId: validatedData.petId }),
        ...(validatedData.guardianId && { guardianId: validatedData.guardianId }),
        ...(validatedData.veterinarianId && { veterinarianId: validatedData.veterinarianId }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.status && { status: validatedData.status })
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
      message: 'Agendamento atualizado com sucesso',
      appointment: {
        appointment_id: updatedAppointment.id,
        date: updatedAppointment.date,
        dateTime: updatedAppointment.date,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes,
        pet_id: updatedAppointment.petId,
        guardian_id: updatedAppointment.guardianId,
        veterinarian_id: updatedAppointment.veterinarianId,
        pet: updatedAppointment.pet,
        guardian: updatedAppointment.guardian,
        veterinarian: updatedAppointment.veterinarian,
        created_at: updatedAppointment.createdAt,
        updated_at: updatedAppointment.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Deletar agendamento
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
    // Verificar se o agendamento pertence à clínica
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      }
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }


    await prisma.appointment.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Agendamento excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}