interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number // em milissegundos
  cleanupInterval: number // em milissegundos
}

class IntelligentCache {
  private cache = new Map<string, CacheItem<any>>()
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      cleanupInterval: 60 * 1000, // 1 minuto
      ...config
    }

    this.startCleanup()
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const itemTTL = ttl || this.config.defaultTTL

    // Se o cache está cheio, remover item menos usado
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccessed: now
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const now = Date.now()

    // Verificar se o item expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Atualizar estatísticas de acesso
    item.accessCount++
    item.lastAccessed = now

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    const now = Date.now()

    // Verificar se o item expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  getStats() {
    const now = Date.now()
    let totalAccessCount = 0
    let expiredItems = 0
    let activeItems = 0

    for (const [key, item] of this.cache.entries()) {
      totalAccessCount += item.accessCount
      
      if (now - item.timestamp > item.ttl) {
        expiredItems++
      } else {
        activeItems++
      }
    }

    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems,
      totalAccessCount,
      averageAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      hitRate: 0 // Seria calculado com histórico de hits/misses
    }
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let lowestScore = Infinity

    for (const [key, item] of this.cache.entries()) {
      // Calcular score baseado em acesso e tempo
      const timeFactor = (Date.now() - item.lastAccessed) / 1000 // segundos
      const accessFactor = 1 / (item.accessCount + 1) // +1 para evitar divisão por zero
      const score = timeFactor * accessFactor

      if (score < lowestScore) {
        lowestScore = score
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.cache.clear()
  }
}

// Instâncias de cache para diferentes propósitos
export const userCache = new IntelligentCache({
  maxSize: 500,
  defaultTTL: 10 * 60 * 1000, // 10 minutos
  cleanupInterval: 2 * 60 * 1000 // 2 minutos
})

export const dataCache = new IntelligentCache({
  maxSize: 2000,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  cleanupInterval: 60 * 1000 // 1 minuto
})

export const sessionCache = new IntelligentCache({
  maxSize: 100,
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  cleanupInterval: 5 * 60 * 1000 // 5 minutos
})

// Função helper para cache com fallback
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cache: IntelligentCache = dataCache,
  ttl?: number
): Promise<T> {
  // Tentar buscar do cache
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Se não estiver no cache, buscar dados
  const data = await fetchFn()
  
  // Salvar no cache
  cache.set(key, data, ttl)
  
  return data
}

// Função helper para cache de usuários
export function cacheUser(userId: string, userData: any): void {
  userCache.set(`user:${userId}`, userData, 15 * 60 * 1000) // 15 minutos
}

export function getCachedUser(userId: string): any | null {
  return userCache.get(`user:${userId}`)
}

// Função helper para cache de dados da clínica
export function cacheClinicData(clinicId: string, dataKey: string, data: any): void {
  dataCache.set(`clinic:${clinicId}:${dataKey}`, data, 10 * 60 * 1000) // 10 minutos
}

export function getCachedClinicData(clinicId: string, dataKey: string): any | null {
  return dataCache.get(`clinic:${clinicId}:${dataKey}`)
}

// Função helper para invalidar cache
export function invalidateCache(pattern: string): void {
  const keys = dataCache.keys().filter(key => key.includes(pattern))
  keys.forEach(key => dataCache.delete(key))
}

export { IntelligentCache }
