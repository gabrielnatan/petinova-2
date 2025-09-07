import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const inventoryItemCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  price: z.number().positive('Preço deve ser positivo').optional(),
  supplier: z.string().optional(),
  expiryDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  minimumStock: z.number().min(0).default(0),
  location: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional()
})

// GET /api/products - List inventory items (simplified for compatibility)
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
    const lowStock = searchParams.get('lowStock') === 'true'
    
    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { supplier: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
          { barcode: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
          { brand: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    if (lowStock) {
      where.quantity = {
        lte: where.minimumStock || 5
      }
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

    // Transform InventoryItem to Product format for compatibility
    return NextResponse.json({
      products: items.map(item => ({
        product_id: item.id,
        name: item.name,
        description: item.description,
        sku: item.sku || item.id.substring(0, 8).toUpperCase(),
        barcode: item.barcode,
        category: item.category || 'General',
        subcategory: null,
        brand: item.brand,
        supplier: item.supplier,
        prices: {
          purchase: item.price || 0,
          sale: item.price || 0,
          margin: 0
        },
        inventory: {
          stock: item.quantity,
          minimumStock: item.minimumStock,
          unit: 'un',
          location: item.location
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
          isLowStock: item.quantity <= item.minimumStock
        },
        isActive: true,
        clinic_id: item.clinicId,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar itens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = inventoryItemCreateSchema.parse(body)

    // Check if item with same name already exists
    const existingByName = await prisma.inventoryItem.findFirst({
      where: {
        name: validatedData.name,
        clinicId: user.clinicId
      }
    })

    if (existingByName) {
      return NextResponse.json(
        { error: 'Já existe um item com este nome' },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    if (validatedData.sku) {
      const existingBySku = await prisma.inventoryItem.findFirst({
        where: {
          sku: validatedData.sku,
          clinicId: user.clinicId
        }
      })

      if (existingBySku) {
        return NextResponse.json(
          { error: 'Já existe um item com este SKU' },
          { status: 400 }
        )
      }
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        quantity: validatedData.quantity,
        price: validatedData.price,
        supplier: validatedData.supplier,
        expiryDate: validatedData.expiryDate,
        minimumStock: validatedData.minimumStock,
        location: validatedData.location,
        sku: validatedData.sku,
        barcode: validatedData.barcode,
        category: validatedData.category,
        brand: validatedData.brand,
        clinicId: user.clinicId
      }
    })

    return NextResponse.json({
      message: 'Item criado com sucesso',
      product: {
        product_id: item.id,
        name: item.name,
        description: item.description,
        sku: item.sku || item.id.substring(0, 8).toUpperCase(),
        barcode: item.barcode,
        category: item.category || 'General',
        subcategory: null,
        brand: item.brand,
        supplier: item.supplier,
        prices: {
          purchase: item.price || 0,
          sale: item.price || 0,
          margin: 0
        },
        inventory: {
          stock: item.quantity,
          minimumStock: item.minimumStock,
          unit: 'un',
          location: item.location
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
          isLowStock: item.quantity <= item.minimumStock
        },
        isActive: true,
        clinic_id: item.clinicId,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}