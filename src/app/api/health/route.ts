import { NextRequest, NextResponse } from 'next/server'
import { healthCheck } from '@/lib/performance'

// GET /api/health - Health check do sistema
export async function GET(request: NextRequest) {
  try {
    const health = await healthCheck()
    
    const isHealthy = health.database && 
                     Object.values(health.externalApis).every(status => status)

    const statusCode = isHealthy ? 200 : 503

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: health.timestamp,
      checks: {
        database: {
          status: health.database ? 'healthy' : 'unhealthy',
          message: health.database ? 'Database connection OK' : 'Database connection failed'
        },
        externalApis: Object.entries(health.externalApis).map(([name, status]) => ({
          name,
          status: status ? 'healthy' : 'unhealthy',
          message: status ? `${name} API OK` : `${name} API failed`
        }))
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    }, {
      status: statusCode
    })

  } catch (error) {
    console.error('Erro no health check:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date(),
      error: 'Health check failed',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }, {
      status: 503
    })
  }
}
