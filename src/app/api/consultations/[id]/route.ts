import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const consultationUpdateSchema = z.object({
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional()
})

// GET /api/consultations/[id] - Buscar consulta específica
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
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            avatarUrl: true,
            birthDate: true,
            weight: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true
          }
        }
      }
    })

    if (!consultation) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    // Buscar histórico de consultas do mesmo pet
    const petHistory = await prisma.consultation.findMany({
      where: {
        petId: consultation.petId,
        id: { not: consultation.id }
      },
      include: {
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      consultation: {
        consultation_id: consultation.id,
        pet: consultation.pet,
        veterinarian: consultation.veterinarian,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        notes: consultation.notes,
        petHistory: petHistory.map(history => ({
          id: history.id,
          date: history.createdAt,
          diagnosis: history.diagnosis,
          treatment: history.treatment,
          veterinarian: history.veterinarian
        })),
        created_at: consultation.createdAt,
        updated_at: consultation.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/consultations/[id] - Atualizar consulta
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
    const validatedData = consultationUpdateSchema.parse(body)

    // Verificar se a consulta pertence à clínica
    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      }
    })

    if (!existingConsultation) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.diagnosis !== undefined && { diagnosis: validatedData.diagnosis }),
        ...(validatedData.treatment !== undefined && { treatment: validatedData.treatment }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes })
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
      message: 'Consulta atualizada com sucesso',
      consultation: {
        consultation_id: updatedConsultation.id,
        pet: updatedConsultation.pet,
        veterinarian: updatedConsultation.veterinarian,
        guardian: updatedConsultation.pet.guardian,
        diagnosis: updatedConsultation.diagnosis,
        treatment: updatedConsultation.treatment,
        notes: updatedConsultation.notes,
        date: updatedConsultation.date,
        created_at: updatedConsultation.createdAt,
        updated_at: updatedConsultation.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/consultations/[id] - Deletar consulta
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
    // Verificar se a consulta pertence à clínica
    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      }
    })

    if (!existingConsultation) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    // Verificar se a consulta foi criada há menos de 24 horas
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)

    if (existingConsultation.createdAt < dayAgo) {
      return NextResponse.json(
        { error: 'Não é possível excluir consultas com mais de 24 horas' },
        { status: 400 }
      )
    }

    await prisma.consultation.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Consulta excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}