import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const prescriptionUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).optional(),
  notes: z.string().optional(),
  instructions: z.string().optional(),
  endDate: z.string().transform((str) => str ? new Date(str) : undefined).optional()
})

// GET /api/prescriptions/[id] - Obter prescrição específica
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
    const prescription = await prisma.prescription.findUnique({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
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
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        consultation: {
          select: {
            id: true,
            date: true,
            diagnosis: true,
            treatment: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                quantity: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescrição não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      prescription: {
        prescription_id: prescription.id,
        consultationId: prescription.consultationId,
        petId: prescription.petId,
        prescriptionNumber: prescription.prescriptionNumber,
        status: prescription.status,
        notes: prescription.notes,
        instructions: prescription.instructions,
        startDate: prescription.startDate,
        endDate: prescription.endDate,
        clinicId: prescription.clinicId,
        pet: prescription.pet,
        veterinarian: prescription.veterinarian,
        consultation: prescription.consultation,
        items: prescription.items.map(item => ({
          item_id: item.id,
          prescriptionId: item.prescriptionId,
          itemId: item.itemId,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          isDispensed: item.isDispensed,
          dispensedAt: item.dispensedAt,
          dispensedBy: item.dispensedBy,
          clinicId: item.clinicId,
          item: item.item,
          created_at: item.createdAt,
          updated_at: item.updatedAt
        })),
        created_at: prescription.createdAt,
        updated_at: prescription.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/prescriptions/[id] - Atualizar prescrição
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
    const validatedData = prescriptionUpdateSchema.parse(body)

    // Verificar se a prescrição existe
    const existingPrescription = await prisma.prescription.findUnique({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingPrescription) {
      return NextResponse.json({ error: 'Prescrição não encontrada' }, { status: 404 })
    }

    // Atualizar prescrição
    const prescription = await prisma.prescription.update({
      where: { id: resolvedParams.id },
      data: {
        status: validatedData.status,
        notes: validatedData.notes,
        instructions: validatedData.instructions,
        endDate: validatedData.endDate
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        consultation: {
          select: {
            id: true,
            date: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Prescrição atualizada com sucesso',
      prescription: {
        prescription_id: prescription.id,
        consultationId: prescription.consultationId,
        petId: prescription.petId,
        prescriptionNumber: prescription.prescriptionNumber,
        status: prescription.status,
        notes: prescription.notes,
        instructions: prescription.instructions,
        startDate: prescription.startDate,
        endDate: prescription.endDate,
        clinicId: prescription.clinicId,
        pet: prescription.pet,
        veterinarian: prescription.veterinarian,
        consultation: prescription.consultation,
        items: prescription.items.map(item => ({
          item_id: item.id,
          prescriptionId: item.prescriptionId,
          itemId: item.itemId,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          isDispensed: item.isDispensed,
          dispensedAt: item.dispensedAt,
          dispensedBy: item.dispensedBy,
          clinicId: item.clinicId,
          item: item.item,
          created_at: item.createdAt,
          updated_at: item.updatedAt
        })),
        created_at: prescription.createdAt,
        updated_at: prescription.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/prescriptions/[id] - Deletar prescrição
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

    // Verificar se a prescrição existe
    const prescription = await prisma.prescription.findUnique({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        items: true
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescrição não encontrada' }, { status: 404 })
    }

    // Verificar se há itens dispensados
    const hasDispensedItems = prescription.items.some(item => item.isDispensed)
    if (hasDispensedItems) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma prescrição com itens já dispensados' },
        { status: 400 }
      )
    }

    // Deletar prescrição (os itens serão deletados automaticamente por cascade)
    await prisma.prescription.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Prescrição deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
