import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional(),
  reference: z.string().optional(), // ID de consulta, compra, etc.
  referenceType: z.enum(['CONSULTATION', 'PURCHASE', 'SALE', 'ADJUSTMENT', 'EXPIRATION', 'LOSS']).optional(),
  unitCost: z.number().positive('Custo unitário deve ser positivo').optional(),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional().transform(str => str ? new Date(str) : undefined)
})

// GET /api/inventory/movements - Listar movimentações de estoque
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
    const productId = searchParams.get('productId')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const skip = (page - 1) * limit

    const where: any = {
      product: {
        clinicId: user.clinicId
      },
      ...(search && {
        OR: [
          { reason: { contains: search, mode: 'insensitive' as const } },
          { notes: { contains: search, mode: 'insensitive' as const } },
          { product: { name: { contains: search, mode: 'insensitive' as const } } },
          { supplier: { contains: search, mode: 'insensitive' as const } },
          { invoiceNumber: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(productId && { productId }),
      ...(type && { type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ])

    // Calcular estatísticas do período
    const stats = await prisma.stockMovement.groupBy({
      by: ['type'],
      where: {
        ...where,
        createdAt: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      _count: { id: true },
      _sum: { quantity: true }
    })

    return NextResponse.json({
      movements: movements.map(movement => ({
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
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        summary: stats.reduce((acc, stat) => {
          acc[stat.type.toLowerCase()] = {
            count: stat._count.id,
            quantity: stat._sum.quantity || 0
          }
          return acc
        }, {} as Record<string, { count: number; quantity: number }>)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/movements - Criar movimentação de estoque
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar permissões
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, permissions: true }
    })

    if (!currentUser || (currentUser.role !== 'ADMIN' && !(currentUser.permissions as any)?.canManageInventory)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar estoque' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = stockMovementSchema.parse(body)

    // Verificar se o produto existe e pertence à clínica
    const product = await prisma.product.findFirst({
      where: {
        id: validatedData.productId,
        clinicId: user.clinicId
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há estoque suficiente para saída
    if (validatedData.type === 'OUT' && product.stock < validatedData.quantity) {
      return NextResponse.json(
        { error: 'Estoque insuficiente para esta movimentação' },
        { status: 400 }
      )
    }

    // Calcular novo estoque
    let newStock = product.stock
    switch (validatedData.type) {
      case 'IN':
        newStock += validatedData.quantity
        break
      case 'OUT':
        newStock -= validatedData.quantity
        break
      case 'ADJUSTMENT':
        newStock = validatedData.quantity // Ajuste define o estoque exato
        break
    }

    // Criar movimentação e atualizar estoque em uma transação
    const movement = await prisma.$transaction(async (tx) => {
      // Criar movimentação
      const newMovement = await tx.stockMovement.create({
        data: {
          productId: validatedData.productId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          reason: validatedData.reason,
          notes: validatedData.notes,
          reference: validatedData.reference,
          referenceType: validatedData.referenceType,
          unitCost: validatedData.unitCost,
          supplier: validatedData.supplier,
          invoiceNumber: validatedData.invoiceNumber,
          batchNumber: validatedData.batchNumber,
          expirationDate: validatedData.expirationDate,
          userId: user.userId
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // Atualizar estoque do produto
      await tx.product.update({
        where: { id: validatedData.productId },
        data: { 
          stock: newStock,
          ...(validatedData.unitCost && { 
            purchasePrice: validatedData.unitCost // Atualizar preço de compra se fornecido
          })
        }
      })

      return newMovement
    })

    return NextResponse.json({
      message: 'Movimentação registrada com sucesso',
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
        newStock: newStock,
        created_at: movement.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao registrar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}