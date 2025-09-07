import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const movementCreateSchema = z.object({
  itemId: z.string().min(1, 'Item é obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'LOSS']),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  reason: z.string().optional(),
  reference: z.string().optional(),
  referenceType: z.enum(['PURCHASE', 'SALE', 'PRESCRIPTION', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'LOSS']).optional(),
  unitCost: z.number().positive().optional(),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  expirationDate: z.string().transform((str) => str ? new Date(str) : undefined).optional()
})

// GET /api/inventory/movements - Listar movimentações
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
    const itemId = searchParams.get('itemId')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where = {
      clinicId: user.clinicId,
      ...(itemId && { itemId }),
      ...(type && { type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        OR: [
          { reason: { contains: search, mode: 'insensitive' as const } },
          { reference: { contains: search, mode: 'insensitive' as const } },
          { supplier: { contains: search, mode: 'insensitive' as const } },
          { item: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
      })
    }

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryMovement.count({ where })
    ])

    return NextResponse.json({
      movements: movements.map(movement => ({
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
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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

// POST /api/inventory/movements - Criar nova movimentação
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = movementCreateSchema.parse(body)

    // Verificar se o item existe
    const item = await prisma.inventoryItem.findUnique({
      where: {
        id: validatedData.itemId,
        clinicId: user.clinicId
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Calcular custo total
    const totalCost = validatedData.unitCost ? validatedData.unitCost * validatedData.quantity : null

    // Verificar se há estoque suficiente para saída
    if (validatedData.type === 'OUT' && item.quantity < validatedData.quantity) {
      return NextResponse.json(
        { error: 'Estoque insuficiente para esta movimentação' },
        { status: 400 }
      )
    }

    // Criar movimentação
    const movement = await prisma.inventoryMovement.create({
      data: {
        itemId: validatedData.itemId,
        type: validatedData.type,
        quantity: validatedData.quantity,
        reason: validatedData.reason,
        reference: validatedData.reference,
        referenceType: validatedData.referenceType,
        unitCost: validatedData.unitCost,
        totalCost,
        supplier: validatedData.supplier,
        invoiceNumber: validatedData.invoiceNumber,
        batchNumber: validatedData.batchNumber,
        expirationDate: validatedData.expirationDate,
        userId: user.id,
        clinicId: user.clinicId
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true
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

    // Atualizar quantidade do item
    let newQuantity = item.quantity
    switch (validatedData.type) {
      case 'IN':
      case 'RETURN':
        newQuantity += validatedData.quantity
        break
      case 'OUT':
      case 'LOSS':
        newQuantity -= validatedData.quantity
        break
      case 'ADJUSTMENT':
        newQuantity = validatedData.quantity // Ajuste define a quantidade
        break
      case 'TRANSFER':
        // Para transferências, a quantidade pode ser positiva ou negativa
        newQuantity += validatedData.quantity
        break
    }

    await prisma.inventoryItem.update({
      where: { id: validatedData.itemId },
      data: { quantity: newQuantity }
    })

    return NextResponse.json({
      message: 'Movimentação criada com sucesso',
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
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}