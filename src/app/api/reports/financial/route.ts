import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/reports/financial - Relatórios financeiros
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') || 'summary'

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    let reportData: any = {}

    switch (type) {
      case 'summary':
        reportData = await generateFinancialSummary(user.clinicId, start, end)
        break
      case 'revenue':
        reportData = await generateRevenueReport(user.clinicId, start, end)
        break
      case 'costs':
        reportData = await generateCostsReport(user.clinicId, start, end)
        break
      case 'profit':
        reportData = await generateProfitReport(user.clinicId, start, end)
        break
      default:
        reportData = await generateFinancialSummary(user.clinicId, start, end)
    }

    return NextResponse.json({
      report: {
        type,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        data: reportData
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateFinancialSummary(clinicId: string, start: Date, end: Date) {
  // Buscar movimentações de estoque para análise financeira
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      clinicId,
      createdAt: {
        gte: start,
        lte: end
      },
      totalCost: {
        not: null
      }
    },
    include: {
      item: {
        select: {
          name: true,
          category: true
        }
      }
    }
  })

  // Calcular receitas (vendas de produtos)
  const sales = movements.filter(m => 
    m.type === 'OUT' && 
    (m.referenceType === 'SALE' || m.referenceType === 'PRESCRIPTION')
  )

  // Calcular custos (compras de produtos)
  const purchases = movements.filter(m => 
    m.type === 'IN' && 
    m.referenceType === 'PURCHASE'
  )

  const totalRevenue = sales.reduce((sum, m) => sum + (m.totalCost || 0), 0)
  const totalCosts = purchases.reduce((sum, m) => sum + (m.totalCost || 0), 0)
  const grossProfit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // Análise por categoria
  const categoryAnalysis = await analyzeByCategory(movements)

  // Análise mensal
  const monthlyAnalysis = await analyzeByMonth(clinicId, start, end)

  return {
    summary: {
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      totalTransactions: movements.length,
      totalSales: sales.length,
      totalPurchases: purchases.length
    },
    categoryAnalysis,
    monthlyAnalysis
  }
}

async function generateRevenueReport(clinicId: string, start: Date, end: Date) {
  const sales = await prisma.inventoryMovement.findMany({
    where: {
      clinicId,
      type: 'OUT',
      referenceType: {
        in: ['SALE', 'PRESCRIPTION']
      },
      createdAt: {
        gte: start,
        lte: end
      }
    },
    include: {
      item: {
        select: {
          name: true,
          category: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const revenueByCategory = sales.reduce((acc, sale) => {
    const category = sale.item.category || 'Sem categoria'
    if (!acc[category]) {
      acc[category] = {
        category,
        totalRevenue: 0,
        totalQuantity: 0,
        transactions: 0
      }
    }
    acc[category].totalRevenue += sale.totalCost || 0
    acc[category].totalQuantity += sale.quantity
    acc[category].transactions++
    return acc
  }, {} as Record<string, any>)

  const revenueByMonth = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      SUM("totalCost") as revenue,
      COUNT(*) as transactions
    FROM "inventory_movements"
    WHERE "clinicId" = ${clinicId}
      AND "type" = 'OUT'
      AND "referenceType" IN ('SALE', 'PRESCRIPTION')
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month
  `

  return {
    totalRevenue: sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0),
    totalTransactions: sales.length,
    revenueByCategory: Object.values(revenueByCategory),
    revenueByMonth
  }
}

async function generateCostsReport(clinicId: string, start: Date, end: Date) {
  const purchases = await prisma.inventoryMovement.findMany({
    where: {
      clinicId,
      type: 'IN',
      referenceType: 'PURCHASE',
      createdAt: {
        gte: start,
        lte: end
      }
    },
    include: {
      item: {
        select: {
          name: true,
          category: true
        }
      },
      supplier: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const costsByCategory = purchases.reduce((acc, purchase) => {
    const category = purchase.item.category || 'Sem categoria'
    if (!acc[category]) {
      acc[category] = {
        category,
        totalCost: 0,
        totalQuantity: 0,
        transactions: 0
      }
    }
    acc[category].totalCost += purchase.totalCost || 0
    acc[category].totalQuantity += purchase.quantity
    acc[category].transactions++
    return acc
  }, {} as Record<string, any>)

  const costsBySupplier = purchases.reduce((acc, purchase) => {
    const supplier = purchase.supplier || 'Sem fornecedor'
    if (!acc[supplier]) {
      acc[supplier] = {
        supplier,
        totalCost: 0,
        totalQuantity: 0,
        transactions: 0
      }
    }
    acc[supplier].totalCost += purchase.totalCost || 0
    acc[supplier].totalQuantity += purchase.quantity
    acc[supplier].transactions++
    return acc
  }, {} as Record<string, any>)

  return {
    totalCosts: purchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0),
    totalTransactions: purchases.length,
    costsByCategory: Object.values(costsByCategory),
    costsBySupplier: Object.values(costsBySupplier)
  }
}

async function generateProfitReport(clinicId: string, start: Date, end: Date) {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      clinicId,
      createdAt: {
        gte: start,
        lte: end
      },
      totalCost: {
        not: null
      }
    },
    include: {
      item: {
        select: {
          name: true,
          category: true
        }
      }
    }
  })

  const sales = movements.filter(m => 
    m.type === 'OUT' && 
    (m.referenceType === 'SALE' || m.referenceType === 'PRESCRIPTION')
  )

  const purchases = movements.filter(m => 
    m.type === 'IN' && 
    m.referenceType === 'PURCHASE'
  )

  const profitByCategory = {}
  
  // Calcular lucro por categoria
  for (const sale of sales) {
    const category = sale.item.category || 'Sem categoria'
    if (!profitByCategory[category]) {
      profitByCategory[category] = {
        category,
        revenue: 0,
        costs: 0,
        profit: 0,
        margin: 0
      }
    }
    profitByCategory[category].revenue += sale.totalCost || 0
  }

  for (const purchase of purchases) {
    const category = purchase.item.category || 'Sem categoria'
    if (!profitByCategory[category]) {
      profitByCategory[category] = {
        category,
        revenue: 0,
        costs: 0,
        profit: 0,
        margin: 0
      }
    }
    profitByCategory[category].costs += purchase.totalCost || 0
  }

  // Calcular lucro e margem
  for (const category in profitByCategory) {
    const data = profitByCategory[category]
    data.profit = data.revenue - data.costs
    data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
  }

  return {
    totalProfit: sales.reduce((sum, s) => sum + (s.totalCost || 0), 0) - 
                 purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0),
    profitByCategory: Object.values(profitByCategory)
  }
}

async function analyzeByCategory(movements: any[]) {
  const categories = {}
  
  for (const movement of movements) {
    const category = movement.item.category || 'Sem categoria'
    if (!categories[category]) {
      categories[category] = {
        category,
        revenue: 0,
        costs: 0,
        transactions: 0
      }
    }
    
    if (movement.type === 'OUT' && (movement.referenceType === 'SALE' || movement.referenceType === 'PRESCRIPTION')) {
      categories[category].revenue += movement.totalCost || 0
    } else if (movement.type === 'IN' && movement.referenceType === 'PURCHASE') {
      categories[category].costs += movement.totalCost || 0
    }
    
    categories[category].transactions++
  }

  return Object.values(categories)
}

async function analyzeByMonth(clinicId: string, start: Date, end: Date) {
  const monthlyData = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      SUM(CASE WHEN "type" = 'OUT' AND "referenceType" IN ('SALE', 'PRESCRIPTION') THEN "totalCost" ELSE 0 END) as revenue,
      SUM(CASE WHEN "type" = 'IN' AND "referenceType" = 'PURCHASE' THEN "totalCost" ELSE 0 END) as costs,
      COUNT(*) as transactions
    FROM "inventory_movements"
    WHERE "clinicId" = ${clinicId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
      AND "totalCost" IS NOT NULL
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month
  `

  return monthlyData.map((row: any) => ({
    month: row.month,
    revenue: parseFloat(row.revenue) || 0,
    costs: parseFloat(row.costs) || 0,
    profit: (parseFloat(row.revenue) || 0) - (parseFloat(row.costs) || 0),
    transactions: parseInt(row.transactions) || 0
  }))
}
