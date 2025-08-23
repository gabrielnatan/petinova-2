import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const guardianUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  cpf: z.string().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }).optional(),
  notes: z.string().optional()
})

// GET /api/guardians/[id] - Buscar guardian específico
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
    const guardian = await prisma.guardian.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            size: true,
            weight: true,
            isNeutered: true,
            birthDate: true,
            avatarUrl: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        appointments: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                species: true
              }
            },
            veterinarian: {
              select: {
                id: true,
                name: true
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
                species: true
              }
            },
            veterinarian: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!guardian) {
      return NextResponse.json({ error: 'Tutor não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      guardian: {
        guardian_id: guardian.id,
        fullName: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
        cpf: guardian.cpf,
        address: guardian.address,
        notes: guardian.notes,
        clinic_id: guardian.clinicId,
        pets: guardian.pets.map(pet => ({
          pet_id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          size: pet.size,
          weight: pet.weight,
          isNeutered: pet.isNeutered,
          birthDate: pet.birthDate,
          avatarUrl: pet.avatarUrl,
          created_at: pet.createdAt
        })),
        appointments: guardian.appointments,
        consultations: guardian.consultations,
        created_at: guardian.createdAt,
        updated_at: guardian.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar guardian:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/guardians/[id] - Atualizar guardian
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
    const validatedData = guardianUpdateSchema.parse(body)

    // Verificar se o guardian pertence à clínica
    const existingGuardian = await prisma.guardian.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingGuardian) {
      return NextResponse.json({ error: 'Tutor não encontrado' }, { status: 404 })
    }

    // Se email foi fornecido, verificar se já existe outro guardian com o mesmo email
    if (validatedData.email && validatedData.email !== existingGuardian.email) {
      const emailExists = await prisma.guardian.findFirst({
        where: {
          email: validatedData.email,
          clinicId: user.clinicId,
          id: { not: resolvedParams.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Já existe um tutor com este email cadastrado na clínica' },
          { status: 400 }
        )
      }
    }

    const updatedGuardian = await prisma.guardian.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.phone && { phone: validatedData.phone }),
        ...(validatedData.cpf !== undefined && { cpf: validatedData.cpf }),
        ...(validatedData.address !== undefined && { address: validatedData.address }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes })
      },
      include: {
        _count: {
          select: {
            pets: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Tutor atualizado com sucesso',
      guardian: {
        guardian_id: updatedGuardian.id,
        fullName: updatedGuardian.name,
        email: updatedGuardian.email,
        phone: updatedGuardian.phone,
        cpf: updatedGuardian.cpf,
        address: updatedGuardian.address,
        notes: updatedGuardian.notes,
        clinic_id: updatedGuardian.clinicId,
        petsCount: updatedGuardian._count.pets,
        created_at: updatedGuardian.createdAt,
        updated_at: updatedGuardian.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar guardian:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/guardians/[id] - Deletar guardian
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
    // Verificar se o guardian pertence à clínica
    const existingGuardian = await prisma.guardian.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            pets: true
          }
        }
      }
    })

    if (!existingGuardian) {
      return NextResponse.json({ error: 'Tutor não encontrado' }, { status: 404 })
    }

    // Verificar se o guardian tem pets cadastrados
    if (existingGuardian._count.pets > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um tutor que possui pets cadastrados' },
        { status: 400 }
      )
    }

    await prisma.guardian.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Tutor excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar guardian:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}