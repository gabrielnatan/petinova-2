import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const petUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  species: z.string().min(1, 'Espécie é obrigatória').optional(),
  breed: z.string().optional(),
  size: z.string().optional(),
  weight: z.number().positive().optional(),
  isNeutered: z.boolean().optional(),
  environment: z.string().optional(),
  birthDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  notes: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  guardianId: z.string().min(1, 'Tutor é obrigatório').optional()
})

// GET /api/pets/[id] - Buscar pet específico
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
    const pet = await prisma.pet.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        guardian: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        consultations: {
          include: {
            veterinarian: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        appointments: {
          include: {
            veterinarian: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      pet: {
        pet_id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        size: pet.size,
        weight: pet.weight,
        isNeutered: pet.isNeutered,
        environment: pet.environment,
        birthDate: pet.birthDate,
        deathDate: pet.deathDate,
        notes: pet.notes,
        avatarUrl: pet.avatarUrl,
        guardian_id: pet.guardianId,
        clinic_id: pet.clinicId,
        guardian: pet.guardian ? {
          guardian_id: pet.guardian.id,
          fullName: pet.guardian.name,
          email: pet.guardian.email,
          phone: pet.guardian.phone
        } : undefined,
        consultations: pet.consultations,
        appointments: pet.appointments,
        created_at: pet.createdAt,
        updated_at: pet.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar pet:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/pets/[id] - Atualizar pet
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
    const validatedData = petUpdateSchema.parse(body)

    // Verificar se o pet pertence à clínica
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })
    }

    // Se guardianId foi fornecido, verificar se o guardian existe
    if (validatedData.guardianId) {
      const guardian = await prisma.guardian.findUnique({
        where: { id: validatedData.guardianId }
      })

      if (!guardian) {
        return NextResponse.json(
          { error: 'Tutor não encontrado' },
          { status: 404 }
        )
      }
    }

    const updatedPet = await prisma.pet.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.species && { species: validatedData.species }),
        ...(validatedData.breed !== undefined && { breed: validatedData.breed }),
        ...(validatedData.size !== undefined && { size: validatedData.size }),
        ...(validatedData.weight !== undefined && { weight: validatedData.weight }),
        ...(validatedData.isNeutered !== undefined && { isNeutered: validatedData.isNeutered }),
        ...(validatedData.environment !== undefined && { environment: validatedData.environment }),
        ...(validatedData.birthDate !== undefined && { birthDate: validatedData.birthDate }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.avatarUrl !== undefined && { avatarUrl: validatedData.avatarUrl }),
        ...(validatedData.guardianId && { guardianId: validatedData.guardianId })
      },
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
    })

    return NextResponse.json({
      message: 'Pet atualizado com sucesso',
      pet: {
        pet_id: updatedPet.id,
        name: updatedPet.name,
        species: updatedPet.species,
        breed: updatedPet.breed,
        size: updatedPet.size,
        weight: updatedPet.weight,
        isNeutered: updatedPet.isNeutered,
        environment: updatedPet.environment,
        birthDate: updatedPet.birthDate,
        deathDate: updatedPet.deathDate,
        notes: updatedPet.notes,
        avatarUrl: updatedPet.avatarUrl,
        guardian_id: updatedPet.guardianId,
        clinic_id: updatedPet.clinicId,
        guardian: updatedPet.guardian ? {
          guardian_id: updatedPet.guardian.id,
          fullName: updatedPet.guardian.name,
          email: updatedPet.guardian.email,
          phone: updatedPet.guardian.phone
        } : undefined,
        created_at: updatedPet.createdAt,
        updated_at: updatedPet.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar pet:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/pets/[id] - Deletar pet
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
    // Verificar se o pet pertence à clínica
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })
    }

    await prisma.pet.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Pet deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar pet:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}