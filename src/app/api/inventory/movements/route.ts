import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

// Simplified schema to work with InventoryItem model
const inventoryUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  price: z.number().positive('Preço deve ser positivo').optional(),
  supplier: z.string().optional(),
  expiryDate: z.string().optional().transform(str => str ? new Date(str) : undefined)
})

// Mock movement schema for compatibility (movements are not implemented in DB yet)
const mockMovementSchema = z.object({
  itemId: z.string().min(1, 'Item é obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional()
})

// GET /api/inventory/movements - List inventory items (movements not implemented yet)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit

    // Search inventory items instead of movements
    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { supplier: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where })
    ])

    // Mock movements data for compatibility - in a real app these would be separate records
    return NextResponse.json({
      movements: items.map(item => ({
        movement_id: item.id,
        product: {
          id: item.id,
          name: item.name,
          sku: item.id.substring(0, 8).toUpperCase(),
          unit: 'un',
          category: 'General'
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
          name: 'System'
        },
        created_at: item.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        summary: {
          adjustment: {
            count: total,
            quantity: items.reduce((sum, item) => sum + item.quantity, 0)
          }
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar itens de estoque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/movements - Create or update inventory item (simplified)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Check permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para gerenciar estoque' }, { status: 403 })
    }

    const body = await request.json()
    
    // Check if this is a mock movement request or inventory item creation
    if (body.itemId) {
      // Mock movement handling for compatibility
      const validatedData = mockMovementSchema.parse(body)
      
      const item = await prisma.inventoryItem.findUnique({
        where: { id: validatedData.itemId }
      })

      if (!item) {
        return NextResponse.json(
          { error: 'Item não encontrado' },
          { status: 404 }
        )
      }

      // Calculate new quantity based on movement type
      let newQuantity = item.quantity
      switch (validatedData.type) {
        case 'IN':
          newQuantity += validatedData.quantity
          break
        case 'OUT':
          if (item.quantity < validatedData.quantity) {
            return NextResponse.json(
              { error: 'Estoque insuficiente para esta movimentação' },
              { status: 400 }
            )
          }
          newQuantity -= validatedData.quantity
          break
        case 'ADJUSTMENT':
          newQuantity = validatedData.quantity
          break
      }

      // Update inventory item quantity
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: validatedData.itemId },
        data: { quantity: newQuantity }
      })

      return NextResponse.json({
        message: 'Movimentação registrada com sucesso',
        movement: {
          movement_id: updatedItem.id,
          product: {
            id: updatedItem.id,
            name: updatedItem.name,
            sku: updatedItem.id.substring(0, 8).toUpperCase(),
            unit: 'un',
            category: 'General'
          },
          type: validatedData.type,
          quantity: validatedData.quantity,
          reason: validatedData.reason,
          notes: validatedData.notes,
          reference: null,
          referenceType: null,
          unitCost: updatedItem.price,
          totalCost: updatedItem.price ? updatedItem.price * validatedData.quantity : null,
          supplier: updatedItem.supplier,
          invoiceNumber: null,
          batchNumber: null,
          expirationDate: updatedItem.expiryDate,
          user: {
            id: user.userId,
            name: 'Current User'
          },
          newStock: newQuantity,
          created_at: new Date().toISOString()
        }
      }, { status: 201 })
    } else {
      // Create new inventory item
      const validatedData = inventoryUpdateSchema.parse(body)

      const newItem = await prisma.inventoryItem.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          quantity: validatedData.quantity,
          price: validatedData.price,
          supplier: validatedData.supplier,
          expiryDate: validatedData.expiryDate
        }
      })

      return NextResponse.json({
        message: 'Item criado com sucesso',
        movement: {
          movement_id: newItem.id,
          product: {
            id: newItem.id,
            name: newItem.name,
            sku: newItem.id.substring(0, 8).toUpperCase(),
            unit: 'un',
            category: 'General'
          },
          type: 'IN' as const,
          quantity: newItem.quantity,
          reason: 'Novo item adicionado',
          notes: newItem.description,
          reference: null,
          referenceType: null,
          unitCost: newItem.price,
          totalCost: newItem.price ? newItem.price * newItem.quantity : null,
          supplier: newItem.supplier,
          invoiceNumber: null,
          batchNumber: null,
          expirationDate: newItem.expiryDate,
          user: {
            id: user.userId,
            name: 'Current User'
          },
          newStock: newItem.quantity,
          created_at: newItem.createdAt
        }
      }, { status: 201 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao processar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}