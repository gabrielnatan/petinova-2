import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PerformanceMonitor } from '@/lib/performance'

// GET /api/performance - Obter métricas de performance
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode ver métricas de performance
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const endpoint = searchParams.get('endpoint')
    const method = searchParams.get('method')
    const limit = parseInt(searchParams.get('limit') || '100')

    const monitor = PerformanceMonitor.getInstance()

    // Obter estatísticas gerais
    const stats = await monitor.getPerformanceStats()

    // Obter métricas detalhadas
    const metrics = await monitor.getMetrics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      endpoint,
      method,
      limit
    })

    return NextResponse.json({
      stats,
      metrics,
      summary: {
        totalRequests: stats?.total.count || 0,
        averageResponseTime: stats?.total.avg || 0,
        errorRate: stats?.daily.errorRate || 0,
        lastHour: stats?.hourly.count || 0
      }
    })

  } catch (error) {
    console.error('Erro ao buscar métricas de performance:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
