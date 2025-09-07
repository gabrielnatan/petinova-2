import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const dispenseSchema = z.object({
  itemIds: z.array(z.string()).min(1, 'Pelo menos um item deve ser selecionado')
})

// POST /api/prescriptions/[id]/dispense - Dispensar itens da prescrição
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
    const validatedData = dispenseSchema.parse(body)

    // Verificar se a prescrição existe
    const prescription = await prisma.prescription.findUnique({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescrição não encontrada' }, { status: 404 })
    }

    // Verificar se a prescrição está ativa
    if (prescription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Apenas prescrições ativas podem ser dispensadas' },
        { status: 400 }
      )
    }

    // Verificar se os itens existem na prescrição
    const prescriptionItems = prescription.items.filter(item => 
      validatedData.itemIds.includes(item.id)
    )

    if (prescriptionItems.length !== validatedData.itemIds.length) {
      return NextResponse.json(
        { error: 'Alguns itens não foram encontrados na prescrição' },
        { status: 400 }
      )
    }

    // Verificar se os itens já foram dispensados
    const alreadyDispensed = prescriptionItems.filter(item => item.isDispensed)
    if (alreadyDispensed.length > 0) {
      return NextResponse.json(
        { error: 'Alguns itens já foram dispensados' },
        { status: 400 }
      )
    }

    // Verificar estoque disponível
    const insufficientStock = prescriptionItems.filter(item => 
      item.item.quantity < item.quantity
    )

    if (insufficientStock.length > 0) {
      const items = insufficientStock.map(item => 
        `${item.item.name} (disponível: ${item.item.quantity}, necessário: ${item.quantity})`
      ).join(', ')
      
      return NextResponse.json(
        { error: `Estoque insuficiente para: ${items}` },
        { status: 400 }
      )
    }

    // Iniciar transação para dispensar itens e atualizar estoque
    const result = await prisma.$transaction(async (tx) => {
      const dispensedItems = []

      for (const prescriptionItem of prescriptionItems) {
        // Marcar item como dispensado
        const dispensedItem = await tx.prescriptionItem.update({
          where: { id: prescriptionItem.id },
          data: {
            isDispensed: true,
            dispensedAt: new Date(),
            dispensedBy: user.id
          },
          include: {
            item: true
          }
        })

        // Criar movimentação de estoque
        await tx.inventoryMovement.create({
          data: {
            itemId: prescriptionItem.itemId,
            type: 'OUT',
            quantity: prescriptionItem.quantity,
            reason: `Dispensa de prescrição ${prescription.prescriptionNumber}`,
            reference: prescription.prescriptionNumber,
            referenceType: 'PRESCRIPTION',
            userId: user.id,
            clinicId: user.clinicId
          }
        })

        // Atualizar quantidade do item
        await tx.inventoryItem.update({
          where: { id: prescriptionItem.itemId },
          data: {
            quantity: {
              decrement: prescriptionItem.quantity
            }
          }
        })

        dispensedItems.push(dispensedItem)
      }

      return dispensedItems
    })

    return NextResponse.json({
      message: 'Itens dispensados com sucesso',
      dispensedItems: result.map(item => ({
        item_id: item.id,
        itemName: item.item.name,
        quantity: item.quantity,
        dispensedAt: item.dispensedAt
      }))
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao dispensar itens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
