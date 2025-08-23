import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/inventory/movements/[id] - Get inventory item details (movements not implemented)
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
    const item = await prisma.inventoryItem.findUnique({
      where: {
        id: resolvedParams.id
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Mock movement data for compatibility
    return NextResponse.json({
      movement: {
        movement_id: item.id,
        product: {
          id: item.id,
          name: item.name,
          sku: item.id.substring(0, 8).toUpperCase(),
          unit: 'un',
          category: 'General',
          stock: item.quantity
        },
        type: 'ADJUSTMENT' as const,
        quantity: item.quantity,
        reason: 'Stock adjustment',
        notes: item.description,
        reference: null,
        referenceType: null,
        unitCost: item.price,
        totalCost: item.price ? item.price * item.quantity : null,
        supplier: item.supplier,
        invoiceNumber: null,
        batchNumber: null,
        expirationDate: item.expiryDate,
        user: {
          id: 'system',
          name: 'System',
          role: 'ADMIN'
        },
        created_at: item.createdAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/movements/[id] - Delete inventory item (simplified)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Check permissions (only ADMIN can delete items)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para excluir itens' }, { status: 403 })
    }

    const resolvedParams = await params
    
    // Find inventory item
    const item = await prisma.inventoryItem.findUnique({
      where: {
        id: resolvedParams.id
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Delete the inventory item
    await prisma.inventoryItem.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Item excluído com sucesso',
      revertedStock: 0
    })

  } catch (error) {
    console.error('Erro ao excluir item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}