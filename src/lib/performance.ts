import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  endpoint: string
  method: string
  statusCode: number
  timestamp: Date
  userId?: string
  clinicId?: string
}

interface HealthCheck {
  database: boolean
  redis?: boolean
  externalApis: Record<string, boolean>
  timestamp: Date
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 1000 // Manter apenas os últimos 1000 registros

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  async logMetric(metric: PerformanceMetrics) {
    try {
      // Adicionar à memória
      this.metrics.push(metric)
      
      // Manter apenas os últimos registros
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics)
      }

      // Salvar no banco de dados
      await prisma.performanceMetric.create({
        data: {
          responseTime: metric.responseTime,
          memoryUsage: metric.memoryUsage,
          cpuUsage: metric.cpuUsage,
          endpoint: metric.endpoint,
          method: metric.method,
          statusCode: metric.statusCode,
          timestamp: metric.timestamp,
          userId: metric.userId,
          clinicId: metric.clinicId
        }
      })
    } catch (error) {
      console.error('Erro ao logar métrica de performance:', error)
    }
  }

  async getMetrics(filters: {
    startDate?: Date
    endDate?: Date
    endpoint?: string
    method?: string
    limit?: number
  } = {}) {
    try {
      const where: any = {}

      if (filters.startDate || filters.endDate) {
        where.timestamp = {}
        if (filters.startDate) where.timestamp.gte = filters.startDate
        if (filters.endDate) where.timestamp.lte = filters.endDate
      }

      if (filters.endpoint) {
        where.endpoint = { contains: filters.endpoint, mode: 'insensitive' }
      }

      if (filters.method) {
        where.method = filters.method
      }

      const metrics = await prisma.performanceMetric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 100
      })

      return metrics
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
      return []
    }
  }

  async getPerformanceStats() {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const [hourlyMetrics, dailyMetrics, totalMetrics] = await Promise.all([
        prisma.performanceMetric.findMany({
          where: { timestamp: { gte: oneHourAgo } }
        }),
        prisma.performanceMetric.findMany({
          where: { timestamp: { gte: oneDayAgo } }
        }),
        prisma.performanceMetric.findMany()
      ])

      const calculateStats = (metrics: any[]) => {
        if (metrics.length === 0) return { avg: 0, min: 0, max: 0, count: 0 }

        const responseTimes = metrics.map(m => m.responseTime)
        return {
          avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          min: Math.min(...responseTimes),
          max: Math.max(...responseTimes),
          count: metrics.length
        }
      }

      return {
        hourly: calculateStats(hourlyMetrics),
        daily: calculateStats(dailyMetrics),
        total: calculateStats(totalMetrics),
        errorRate: {
          hourly: hourlyMetrics.filter(m => m.statusCode >= 400).length / hourlyMetrics.length * 100,
          daily: dailyMetrics.filter(m => m.statusCode >= 400).length / dailyMetrics.length * 100
        }
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      return null
    }
  }
}

export async function performanceMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now()
  const startMemory = process.memoryUsage()
  
  try {
    const response = await handler()
    const endTime = Date.now()
    const endMemory = process.memoryUsage()
    
    const responseTime = endTime - startTime
    const memoryUsage = endMemory.heapUsed - startMemory.heapUsed
    
    // Log da métrica
    const monitor = PerformanceMonitor.getInstance()
    await monitor.logMetric({
      responseTime,
      memoryUsage,
      cpuUsage: 0, // Seria calculado com biblioteca específica
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: response.status,
      timestamp: new Date()
    })
    
    return response
  } catch (error) {
    const endTime = Date.now()
    
    // Log de erro
    const monitor = PerformanceMonitor.getInstance()
    await monitor.logMetric({
      responseTime: endTime - startTime,
      memoryUsage: 0,
      cpuUsage: 0,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: 500,
      timestamp: new Date()
    })
    
    throw error
  }
}

export async function healthCheck(): Promise<HealthCheck> {
  const health: HealthCheck = {
    database: false,
    externalApis: {},
    timestamp: new Date()
  }

  try {
    // Verificar banco de dados
    await prisma.$queryRaw`SELECT 1`
    health.database = true
  } catch (error) {
    console.error('Erro na verificação do banco de dados:', error)
  }

  // Verificar APIs externas (exemplo)
  try {
    const response = await fetch('https://httpbin.org/get', { 
      timeout: 5000 
    })
    health.externalApis['httpbin'] = response.ok
  } catch (error) {
    health.externalApis['httpbin'] = false
  }

  return health
}

export { PerformanceMonitor }
