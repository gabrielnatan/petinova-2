import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const prescriptionSchema = z.object({
  text: z.string().min(1, 'Texto da prescrição é obrigatório'),
})

// GET /api/consultations/[id]/prescription - Obter prescrição da consulta
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
            birthDate: true,
            weight: true,
            guardian: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true
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

    if (!consultation) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    // Por enquanto, vamos retornar uma prescrição baseada nos dados da consulta
    // Em uma implementação real, você teria uma tabela separada para prescrições
    const prescription = {
      prescription_id: consultation.id,
      text: consultation.treatment || 'Prescrição não disponível',
      created_at: consultation.createdAt,
      consultation: {
        consultation_id: consultation.id,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        notes: consultation.notes,
        created_at: consultation.createdAt,
        pet: {
          pet_id: consultation.pet.id,
          name: consultation.pet.name,
          species: consultation.pet.species,
          breed: consultation.pet.breed,
          birthDate: consultation.pet.birthDate,
          weight: consultation.pet.weight,
        },
        guardian: {
          guardian_id: consultation.pet.guardian.id,
          fullName: consultation.pet.guardian.name,
          email: consultation.pet.guardian.email,
          phone: consultation.pet.guardian.phone,
          address: consultation.pet.guardian.address,
        },
        veterinarian: {
          veterinarian_id: consultation.veterinarian.id,
          fullName: consultation.veterinarian.name,
          role: consultation.veterinarian.role,
        }
      }
    }

    return NextResponse.json({ prescription })

  } catch (error) {
    console.error('Erro ao buscar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/consultations/[id]/prescription - Criar/atualizar prescrição
export async function POST(
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
    const validatedData = prescriptionSchema.parse(body)

    // Verificar se a consulta existe e pertence à clínica
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: resolvedParams.id,
        pet: {
          clinicId: user.clinicId
        }
      }
    })

    if (!consultation) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 })
    }

    // Atualizar a consulta com o tratamento (que serve como prescrição)
    const updatedConsultation = await prisma.consultation.update({
      where: { id: resolvedParams.id },
      data: {
        treatment: validatedData.text
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            birthDate: true,
            weight: true,
            guardian: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true
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

    const prescription = {
      prescription_id: updatedConsultation.id,
      text: updatedConsultation.treatment,
      created_at: updatedConsultation.createdAt,
      consultation: {
        consultation_id: updatedConsultation.id,
        diagnosis: updatedConsultation.diagnosis,
        treatment: updatedConsultation.treatment,
        notes: updatedConsultation.notes,
        created_at: updatedConsultation.createdAt,
        pet: {
          pet_id: updatedConsultation.pet.id,
          name: updatedConsultation.pet.name,
          species: updatedConsultation.pet.species,
          breed: updatedConsultation.pet.breed,
          birthDate: updatedConsultation.pet.birthDate,
          weight: updatedConsultation.pet.weight,
        },
        guardian: {
          guardian_id: updatedConsultation.pet.guardian.id,
          fullName: updatedConsultation.pet.guardian.name,
          email: updatedConsultation.pet.guardian.email,
          phone: updatedConsultation.pet.guardian.phone,
          address: updatedConsultation.pet.guardian.address,
        },
        veterinarian: {
          veterinarian_id: updatedConsultation.veterinarian.id,
          fullName: updatedConsultation.veterinarian.name,
          role: updatedConsultation.veterinarian.role,
        }
      }
    }

    return NextResponse.json({ prescription })

  } catch (error) {
    console.error('Erro ao criar/atualizar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
