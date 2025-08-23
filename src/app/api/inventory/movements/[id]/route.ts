import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/inventory/movements/[id] - Buscar movimentação específica
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
    const movement = await prisma.stockMovement.findFirst({
      where: {
        id: resolvedParams.id,
        product: {
          clinicId: user.clinicId
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
            category: true,
            stock: true
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
        product: movement.product,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        notes: movement.notes,
        reference: movement.reference,
        referenceType: movement.referenceType,
        unitCost: movement.unitCost,
        totalCost: movement.unitCost ? movement.unitCost * movement.quantity : null,
        supplier: movement.supplier,
        invoiceNumber: movement.invoiceNumber,
        batchNumber: movement.batchNumber,
        expirationDate: movement.expirationDate,
        user: movement.user,
        created_at: movement.createdAt
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

// DELETE /api/inventory/movements/[id] - Cancelar movimentação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar permissões (apenas ADMIN pode cancelar movimentações)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para cancelar movimentações' }, { status: 403 })
    }

    const resolvedParams = await params
    
    // Buscar movimentação
    const movement = await prisma.stockMovement.findFirst({
      where: {
        id: resolvedParams.id,
        product: {
          clinicId: user.clinicId
        }
      },
      include: {
        product: true
      }
    })

    if (!movement) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
    }

    // Verificar se a movimentação pode ser cancelada (menos de 24 horas)
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)

    if (movement.createdAt < dayAgo) {
      return NextResponse.json(
        { error: 'Não é possível cancelar movimentações com mais de 24 horas' },
        { status: 400 }
      )
    }

    // Reverter o estoque e criar movimentação de cancelamento
    const product = movement.product
    let revertedStock = product.stock

    switch (movement.type) {
      case 'IN':
        revertedStock -= movement.quantity // Reverter entrada
        break
      case 'OUT':
        revertedStock += movement.quantity // Reverter saída
        break
      case 'ADJUSTMENT':
        // Para ajustes, não há como reverter automaticamente
        return NextResponse.json(
          { error: 'Movimentações de ajuste não podem ser canceladas automaticamente' },
          { status: 400 }
        )
    }

    // Verificar se o estoque revertido seria negativo
    if (revertedStock < 0) {
      return NextResponse.json(
        { error: 'Não é possível cancelar: resultaria em estoque negativo' },
        { status: 400 }
      )
    }

    // Executar cancelamento em transação
    await prisma.$transaction(async (tx) => {
      // Criar movimentação de cancelamento
      await tx.stockMovement.create({
        data: {
          productId: movement.productId,
          type: movement.type === 'IN' ? 'OUT' : 'IN', // Tipo oposto
          quantity: movement.quantity,
          reason: `Cancelamento de movimentação #${movement.id}`,
          notes: `Movimentação cancelada: ${movement.reason}`,
          reference: movement.id,
          referenceType: 'ADJUSTMENT',
          userId: user.userId
        }
      })

      // Atualizar estoque do produto
      await tx.product.update({
        where: { id: movement.productId },
        data: { stock: revertedStock }
      })

      // Marcar movimentação original como cancelada (soft delete)
      await tx.stockMovement.update({
        where: { id: movement.id },
        data: {
          notes: `[CANCELADA] ${movement.notes || ''}`,
          reference: `CANCELLED_${movement.reference || ''}`
        }
      })
    })

    return NextResponse.json({
      message: 'Movimentação cancelada com sucesso',
      revertedStock
    })

  } catch (error) {
    console.error('Erro ao cancelar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}