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
    const product = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            sales: true,
            purchases: true
          }
        },
        sales: {
          include: {
            consultation: {
              select: {
                id: true,
                createdAt: true,
                pet: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Calcular estatísticas avançadas
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const salesThisMonth = await prisma.sale.count({
      where: {
        productId: product.id,
        createdAt: {
          gte: currentMonth
        }
      }
    })

    const lastSale = await prisma.sale.findFirst({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' }
    })

    const averageMonthlyUsage = await prisma.sale.groupBy({
      by: ['productId'],
      where: {
        productId: product.id,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // últimos 3 meses
        }
      },
      _sum: {
        quantity: true
      }
    })

    const avgUsage = averageMonthlyUsage.length > 0 
      ? (averageMonthlyUsage[0]._sum.quantity || 0) / 3 
      : 0

    return NextResponse.json({
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
          location: product.location,
          estimatedDaysToStock: avgUsage > 0 ? Math.ceil(product.stock / avgUsage * 30) : null
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
          salesThisMonth,
          lastSaleDate: lastSale?.createdAt,
          averageMonthlyUsage: Math.round(avgUsage),
          isLowStock: product.stock <= product.minimumStock,
          isExpiringSoon: product.expirationDate && 
            new Date(product.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        recentSales: product.sales,
        recentPurchases: product.purchases,
        isActive: product.isActive,
        clinic_id: product.clinicId,
        created_at: product.createdAt,
        updated_at: product.updatedAt
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

    // Verificar se o produto pertence à clínica
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Se SKU foi fornecido, verificar se já existe outro produto com o mesmo SKU
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: {
          sku: validatedData.sku,
          clinicId: user.clinicId,
          id: { not: resolvedParams.id }
        }
      })

      if (skuExists) {
        return NextResponse.json(
          { error: 'Já existe um produto com este SKU cadastrado na clínica' },
          { status: 400 }
        )
      }
    }

    // Se código de barras foi fornecido, verificar se já existe
    if (validatedData.barcode && validatedData.barcode !== existingProduct.barcode) {
      const barcodeExists = await prisma.product.findFirst({
        where: {
          barcode: validatedData.barcode,
          clinicId: user.clinicId,
          id: { not: resolvedParams.id }
        }
      })

      if (barcodeExists) {
        return NextResponse.json(
          { error: 'Já existe um produto com este código de barras cadastrado na clínica' },
          { status: 400 }
        )
      }
    }

    // Recalcular margem se preços foram alterados
    let margin = validatedData.margin
    if (validatedData.purchasePrice || validatedData.salePrice) {
      const purchasePrice = validatedData.purchasePrice || existingProduct.purchasePrice
      const salePrice = validatedData.salePrice || existingProduct.salePrice
      margin = margin || ((salePrice - purchasePrice) / purchasePrice) * 100
    }

    const updatedProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.sku !== undefined && { sku: validatedData.sku }),
        ...(validatedData.barcode !== undefined && { barcode: validatedData.barcode }),
        ...(validatedData.category !== undefined && { category: validatedData.category }),
        ...(validatedData.subcategory !== undefined && { subcategory: validatedData.subcategory }),
        ...(validatedData.brand !== undefined && { brand: validatedData.brand }),
        ...(validatedData.supplier !== undefined && { supplier: validatedData.supplier }),
        ...(validatedData.purchasePrice !== undefined && { purchasePrice: validatedData.purchasePrice }),
        ...(validatedData.salePrice !== undefined && { salePrice: validatedData.salePrice }),
        ...(margin !== undefined && { margin }),
        ...(validatedData.stock !== undefined && { stock: validatedData.stock }),
        ...(validatedData.minimumStock !== undefined && { minimumStock: validatedData.minimumStock }),
        ...(validatedData.unit !== undefined && { unit: validatedData.unit }),
        ...(validatedData.location !== undefined && { location: validatedData.location }),
        ...(validatedData.expirationDate !== undefined && { expirationDate: validatedData.expirationDate }),
        ...(validatedData.batchNumber !== undefined && { batchNumber: validatedData.batchNumber }),
        ...(validatedData.prescriptionRequired !== undefined && { prescriptionRequired: validatedData.prescriptionRequired }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.images !== undefined && { images: validatedData.images })
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
      message: 'Produto atualizado com sucesso',
      product: {
        product_id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        sku: updatedProduct.sku,
        barcode: updatedProduct.barcode,
        category: updatedProduct.category,
        subcategory: updatedProduct.subcategory,
        brand: updatedProduct.brand,
        supplier: updatedProduct.supplier,
        prices: {
          purchase: updatedProduct.purchasePrice,
          sale: updatedProduct.salePrice,
          margin: updatedProduct.margin
        },
        inventory: {
          stock: updatedProduct.stock,
          minimumStock: updatedProduct.minimumStock,
          unit: updatedProduct.unit,
          location: updatedProduct.location
        },
        details: {
          expirationDate: updatedProduct.expirationDate,
          batchNumber: updatedProduct.batchNumber,
          prescriptionRequired: updatedProduct.prescriptionRequired,
          notes: updatedProduct.notes,
          images: updatedProduct.images
        },
        stats: {
          totalSales: updatedProduct._count.sales,
          totalPurchases: updatedProduct._count.purchases,
          isLowStock: updatedProduct.stock <= updatedProduct.minimumStock
        },
        isActive: updatedProduct.isActive,
        clinic_id: updatedProduct.clinicId,
        created_at: updatedProduct.createdAt,
        updated_at: updatedProduct.updatedAt
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
    // Verificar se o produto pertence à clínica
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
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

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se o produto tem vendas ou compras
    if (existingProduct._count.sales > 0 || existingProduct._count.purchases > 0) {
      // Ao invés de deletar, apenas desativar o produto
      await prisma.product.update({
        where: { id: resolvedParams.id },
        data: { isActive: false }
      })

      return NextResponse.json({
        message: 'Produto desativado com sucesso (possui histórico de vendas/compras)'
      })
    }

    await prisma.product.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Produto excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}