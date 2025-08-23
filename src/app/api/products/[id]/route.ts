import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU é obrigatório').optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  purchasePrice: z.number().positive('Preço de compra deve ser positivo').optional(),
  salePrice: z.number().positive('Preço de venda deve ser positivo').optional(),
  margin: z.number().min(0, 'Margem deve ser positiva').max(100, 'Margem não pode ser maior que 100%').optional(),
  stock: z.number().min(0, 'Estoque não pode ser negativo').optional(),
  minimumStock: z.number().min(0, 'Estoque mínimo não pode ser negativo').optional(),
  unit: z.enum(['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct']).optional(),
  location: z.string().optional(),
  expirationDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  batchNumber: z.string().optional(),
  prescriptionRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).optional()
})

// GET /api/products/[id] - Buscar produto específico
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

    // Mock statistics since sales/purchases models don't exist yet
    const salesThisMonth = 0

    return NextResponse.json({
      product: {
        product_id: item.id,
        name: item.name,
        description: item.description,
        sku: item.id.substring(0, 8).toUpperCase(),
        barcode: null,
        category: 'General',
        subcategory: null,
        brand: null,
        supplier: item.supplier,
        prices: {
          purchase: item.price || 0,
          sale: item.price || 0,
          margin: 0
        },
        inventory: {
          stock: item.quantity,
          minimumStock: 0,
          unit: 'un',
          location: null,
          estimatedDaysToStock: null
        },
        details: {
          expirationDate: item.expiryDate,
          batchNumber: null,
          prescriptionRequired: false,
          notes: item.description,
          images: []
        },
        stats: {
          totalSales: 0,
          totalPurchases: 0,
          salesThisMonth,
          lastSaleDate: null,
          averageMonthlyUsage: 0,
          isLowStock: false,
          isExpiringSoon: item.expiryDate && 
            new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        recentSales: [],
        recentPurchases: [],
        isActive: true,
        clinic_id: 'default',
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Atualizar produto
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
    const validatedData = productUpdateSchema.parse(body)

    // Check if inventory item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        id: resolvedParams.id
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Update inventory item with simplified fields
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.supplier !== undefined && { supplier: validatedData.supplier }),
        ...(validatedData.purchasePrice !== undefined && { price: validatedData.purchasePrice }),
        ...(validatedData.stock !== undefined && { quantity: validatedData.stock }),
        ...(validatedData.expirationDate !== undefined && { expiryDate: validatedData.expirationDate })
      }
    })

    return NextResponse.json({
      message: 'Item atualizado com sucesso',
      product: {
        product_id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        sku: updatedItem.id.substring(0, 8).toUpperCase(),
        barcode: null,
        category: 'General',
        subcategory: null,
        brand: null,
        supplier: updatedItem.supplier,
        prices: {
          purchase: updatedItem.price || 0,
          sale: updatedItem.price || 0,
          margin: 0
        },
        inventory: {
          stock: updatedItem.quantity,
          minimumStock: 0,
          unit: 'un',
          location: null
        },
        details: {
          expirationDate: updatedItem.expiryDate,
          batchNumber: null,
          prescriptionRequired: false,
          notes: updatedItem.description,
          images: []
        },
        stats: {
          totalSales: 0,
          totalPurchases: 0,
          isLowStock: false
        },
        isActive: true,
        clinic_id: 'default',
        created_at: updatedItem.createdAt,
        updated_at: updatedItem.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Deletar produto
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
    // Check if inventory item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        id: resolvedParams.id
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Since we don't have sales/purchases models yet, just delete the item
    await prisma.inventoryItem.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Item excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}