import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requisições por janela
  skipSuccessfulRequests?: boolean // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean // Pular requisições falhadas
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

class RateLimiter {
  private config: RateLimitConfig
  private store: Map<string, { count: number; resetTime: number }>

  constructor(config: RateLimitConfig) {
    this.config = config
    this.store = new Map()
  }

  async checkLimit(identifier: string): Promise<RateLimitInfo> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Limpar entradas expiradas
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key)
      }
    }

    const key = `rate_limit:${identifier}`
    const current = this.store.get(key)

    if (!current || current.resetTime < now) {
      // Primeira requisição ou janela expirada
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })

      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: new Date(now + this.config.windowMs)
      }
    }

    if (current.count >= this.config.maxRequests) {
      // Limite excedido
      const retryAfter = Math.ceil((current.resetTime - now) / 1000)
      return {
        limit: this.config.maxRequests,
        remaining: 0,
        reset: new Date(current.resetTime),
        retryAfter
      }
    }

    // Incrementar contador
    current.count++
    this.store.set(key, current)

    return {
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - current.count,
      reset: new Date(current.resetTime)
    }
  }

  async logRequest(identifier: string, success: boolean, responseTime: number) {
    try {
      await prisma.apiRequestLog.create({
        data: {
          identifier,
          success,
          responseTime,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Erro ao logar requisição:', error)
    }
  }
}

// Configurações de rate limiting por tipo de usuário
const rateLimitConfigs = {
  // Usuários autenticados
  authenticated: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100
  },
  // Usuários não autenticados
  unauthenticated: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20
  },
  // API keys
  apiKey: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 1000
  }
}

// Instâncias dos rate limiters
const rateLimiters = {
  authenticated: new RateLimiter(rateLimitConfigs.authenticated),
  unauthenticated: new RateLimiter(rateLimitConfigs.unauthenticated),
  apiKey: new RateLimiter(rateLimitConfigs.apiKey)
}

export async function rateLimitMiddleware(
  request: NextRequest,
  identifier: string,
  type: 'authenticated' | 'unauthenticated' | 'apiKey' = 'unauthenticated'
) {
  const startTime = Date.now()
  const limiter = rateLimiters[type]

  try {
    const limitInfo = await limiter.checkLimit(identifier)

    // Adicionar headers de rate limiting
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', limitInfo.limit.toString())
    headers.set('X-RateLimit-Remaining', limitInfo.remaining.toString())
    headers.set('X-RateLimit-Reset', limitInfo.reset.toISOString())

    if (limitInfo.retryAfter) {
      headers.set('Retry-After', limitInfo.retryAfter.toString())
    }

    // Verificar se o limite foi excedido
    if (limitInfo.remaining < 0) {
      const responseTime = Date.now() - startTime
      await limiter.logRequest(identifier, false, responseTime)

      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests, please try again later',
            retryAfter: limitInfo.retryAfter
          },
          {
            status: 429,
            headers
          }
        )
      }
    }

    // Log da requisição (será atualizado com sucesso/falha no final)
    const responseTime = Date.now() - startTime
    await limiter.logRequest(identifier, true, responseTime)

    return {
      success: true,
      headers
    }

  } catch (error) {
    console.error('Erro no rate limiting:', error)
    // Em caso de erro, permitir a requisição
    return {
      success: true,
      headers: new Headers()
    }
  }
}

export function getRateLimitIdentifier(request: NextRequest): string {
  // Para usuários autenticados, usar o ID do usuário
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Extrair user ID do token (simplificado)
    return `user:${authHeader.substring(7).slice(0, 10)}`
  }

  // Para API keys
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) {
    return `apikey:${apiKey}`
  }

  // Para usuários não autenticados, usar IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  return `ip:${ip}`
}

export function getRateLimitType(request: NextRequest): 'authenticated' | 'unauthenticated' | 'apiKey' {
  const authHeader = request.headers.get('authorization')
  const apiKey = request.headers.get('x-api-key')

  if (apiKey) {
    return 'apiKey'
  }

  if (authHeader?.startsWith('Bearer ')) {
    return 'authenticated'
  }

  return 'unauthenticated'
}
