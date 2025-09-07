import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/inventory/movements/[id] - Obter movimentação específica
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
    const movement = await prisma.inventoryMovement.findUnique({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            quantity: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!movement) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      movement: {
        movement_id: movement.id,
        itemId: movement.itemId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        referenceType: movement.referenceType,
        unitCost: movement.unitCost,
        totalCost: movement.totalCost,
        supplier: movement.supplier,
        invoiceNumber: movement.invoiceNumber,
        batchNumber: movement.batchNumber,
        expirationDate: movement.expirationDate,
        userId: movement.userId,
        clinicId: movement.clinicId,
        item: movement.item,
        user: movement.user,
        created_at: movement.createdAt,
        updated_at: movement.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/movements/[id] - Deletar movimentação
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

    // Verificar se a movimentação existe
    const movement = await prisma.inventoryMovement.findUnique({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        item: true
      }
    })

    if (!movement) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
    }

    // Verificar permissões (apenas ADMIN pode deletar)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar movimentações' },
        { status: 403 }
      )
    }

    // Reverter a movimentação no estoque
    let newQuantity = movement.item.quantity
    switch (movement.type) {
      case 'IN':
      case 'RETURN':
        newQuantity -= movement.quantity
        break
      case 'OUT':
      case 'LOSS':
        newQuantity += movement.quantity
        break
      case 'ADJUSTMENT':
        // Para ajustes, não podemos reverter automaticamente
        // Seria necessário saber o valor anterior
        break
      case 'TRANSFER':
        newQuantity -= movement.quantity
        break
    }

    // Atualizar quantidade do item
    await prisma.inventoryItem.update({
      where: { id: movement.itemId },
      data: { quantity: newQuantity }
    })

    // Deletar a movimentação
    await prisma.inventoryMovement.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Movimentação deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}