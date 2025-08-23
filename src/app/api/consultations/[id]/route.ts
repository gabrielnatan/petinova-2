import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const consultationUpdateSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório').optional(),
  treatment: z.string().min(1, 'Tratamento é obrigatório').optional(),
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
  status: z.enum(['IN_PROGRESS', 'COMPLETED']).optional()
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
        ...(validatedData.prescription !== undefined && { prescription: validatedData.prescription }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.followUpDate !== undefined && { followUpDate: validatedData.followUpDate }),
        ...(validatedData.weight !== undefined && { weight: validatedData.weight }),
        ...(validatedData.temperature !== undefined && { temperature: validatedData.temperature }),
        ...(validatedData.heartRate !== undefined && { heartRate: validatedData.heartRate }),
        ...(validatedData.respiratoryRate !== undefined && { respiratoryRate: validatedData.respiratoryRate }),
        ...(validatedData.bloodPressure !== undefined && { bloodPressure: validatedData.bloodPressure }),
        ...(validatedData.symptoms !== undefined && { symptoms: validatedData.symptoms }),
        ...(validatedData.attachments !== undefined && { attachments: validatedData.attachments }),
        ...(validatedData.status !== undefined && { status: validatedData.status })
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
            role: true,
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

    return NextResponse.json({
      message: 'Consulta atualizada com sucesso',
      consultation: {
        consultation_id: updatedConsultation.id,
        pet: updatedConsultation.pet,
        veterinarian: updatedConsultation.veterinarian,
        guardian: updatedConsultation.guardian,
        appointment: updatedConsultation.appointment,
        diagnosis: updatedConsultation.diagnosis,
        treatment: updatedConsultation.treatment,
        prescription: updatedConsultation.prescription,
        notes: updatedConsultation.notes,
        followUpDate: updatedConsultation.followUpDate,
        vitalSigns: {
          weight: updatedConsultation.weight,
          temperature: updatedConsultation.temperature,
          heartRate: updatedConsultation.heartRate,
          respiratoryRate: updatedConsultation.respiratoryRate,
          bloodPressure: updatedConsultation.bloodPressure
        },
        symptoms: updatedConsultation.symptoms,
        attachments: updatedConsultation.attachments,
        status: updatedConsultation.status,
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