import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const productCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU é obrigatório'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  purchasePrice: z.number().positive('Preço de compra deve ser positivo'),
  salePrice: z.number().positive('Preço de venda deve ser positivo'),
  margin: z.number().min(0, 'Margem deve ser positiva').max(100, 'Margem não pode ser maior que 100%').optional(),
  stock: z.number().min(0, 'Estoque não pode ser negativo'),
  minimumStock: z.number().min(0, 'Estoque mínimo não pode ser negativo'),
  unit: z.enum(['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct']),
  location: z.string().optional(),
  expirationDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  batchNumber: z.string().optional(),
  prescriptionRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  images: z.array(z.string()).optional()
})

// GET /api/products - Listar produtos
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
    const category = searchParams.get('category')
    const lowStock = searchParams.get('lowStock') === 'true'
    const isActive = searchParams.get('isActive')
    const prescriptionRequired = searchParams.get('prescriptionRequired')
    
    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
          { barcode: { contains: search, mode: 'insensitive' as const } },
          { brand: { contains: search, mode: 'insensitive' as const } },
          { supplier: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(prescriptionRequired !== null && { prescriptionRequired: prescriptionRequired === 'true' })
    }

    if (lowStock) {
      where.stock = {
        lte: prisma.product.fields.minimumStock
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          _count: {
            select: {
              sales: true,
              purchases: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products: products.map(product => ({
        product_id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        supplier: product.supplier,
        prices: {
          purchase: product.purchasePrice,
          sale: product.salePrice,
          margin: product.margin
        },
        inventory: {
          stock: product.stock,
          minimumStock: product.minimumStock,
          unit: product.unit,
          location: product.location
        },
        details: {
          expirationDate: product.expirationDate,
          batchNumber: product.batchNumber,
          prescriptionRequired: product.prescriptionRequired,
          notes: product.notes,
          images: product.images
        },
        stats: {
          totalSales: product._count.sales,
          totalPurchases: product._count.purchases,
          isLowStock: product.stock <= product.minimumStock
        },
        isActive: product.isActive,
        clinic_id: product.clinicId,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/products - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productCreateSchema.parse(body)

    // Verificar se já existe produto com o mesmo SKU na clínica
    const existingBySku = await prisma.product.findFirst({
      where: {
        sku: validatedData.sku,
        clinicId: user.clinicId
      }
    })

    if (existingBySku) {
      return NextResponse.json(
        { error: 'Já existe um produto com este SKU cadastrado na clínica' },
        { status: 400 }
      )
    }

    // Verificar se já existe produto com o mesmo código de barras (se fornecido)
    if (validatedData.barcode) {
      const existingByBarcode = await prisma.product.findFirst({
        where: {
          barcode: validatedData.barcode,
          clinicId: user.clinicId
        }
      })

      if (existingByBarcode) {
        return NextResponse.json(
          { error: 'Já existe um produto com este código de barras cadastrado na clínica' },
          { status: 400 }
        )
      }
    }

    // Calcular margem se não fornecida
    const margin = validatedData.margin || 
      ((validatedData.salePrice - validatedData.purchasePrice) / validatedData.purchasePrice) * 100

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        sku: validatedData.sku,
        barcode: validatedData.barcode,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        brand: validatedData.brand,
        supplier: validatedData.supplier,
        purchasePrice: validatedData.purchasePrice,
        salePrice: validatedData.salePrice,
        margin,
        stock: validatedData.stock,
        minimumStock: validatedData.minimumStock,
        unit: validatedData.unit,
        location: validatedData.location,
        expirationDate: validatedData.expirationDate,
        batchNumber: validatedData.batchNumber,
        prescriptionRequired: validatedData.prescriptionRequired,
        isActive: validatedData.isActive,
        notes: validatedData.notes,
        images: validatedData.images || [],
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            sales: true,
            purchases: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Produto criado com sucesso',
      product: {
        product_id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        supplier: product.supplier,
        prices: {
          purchase: product.purchasePrice,
          sale: product.salePrice,
          margin: product.margin
        },
        inventory: {
          stock: product.stock,
          minimumStock: product.minimumStock,
          unit: product.unit,
          location: product.location
        },
        details: {
          expirationDate: product.expirationDate,
          batchNumber: product.batchNumber,
          prescriptionRequired: product.prescriptionRequired,
          notes: product.notes,
          images: product.images
        },
        stats: {
          totalSales: product._count.sales,
          totalPurchases: product._count.purchases,
          isLowStock: product.stock <= product.minimumStock
        },
        isActive: product.isActive,
        clinic_id: product.clinicId,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}