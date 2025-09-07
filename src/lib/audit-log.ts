import { prisma } from './prisma'

export enum AuditLogType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  SESSION_REVOKE = 'SESSION_REVOKE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED'
}

export interface AuditLogData {
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  action: AuditLogType
  details?: Record<string, any>
  success: boolean
  errorMessage?: string
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          email: data.email,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          action: data.action,
          details: data.details,
          success: data.success,
          errorMessage: data.errorMessage,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error)
      // Não falhar a operação principal por erro no log
    }
  }

  static async logLoginSuccess(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.LOGIN_SUCCESS,
      success: true
    })
  }

  static async logLoginFailed(email: string, reason: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.LOGIN_FAILED,
      details: { reason },
      success: false,
      errorMessage: reason
    })
  }

  static async logLogout(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.LOGOUT,
      success: true
    })
  }

  static async logRegister(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.REGISTER,
      success: true
    })
  }

  static async logTokenRefresh(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.TOKEN_REFRESH,
      success: true
    })
  }

  static async logSessionRevoke(userId: string, email: string, sessionId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.SESSION_REVOKE,
      details: { sessionId },
      success: true
    })
  }

  static async logAccountLocked(email: string, reason: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.ACCOUNT_LOCKED,
      details: { reason },
      success: false,
      errorMessage: reason
    })
  }

  static async logAccountUnlocked(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      email,
      ipAddress,
      userAgent,
      action: AuditLogType.ACCOUNT_UNLOCKED,
      success: true
    })
  }

  // Métodos para consulta de logs
  static async getUserLogs(userId: string, limit: number = 50): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  static async getFailedLoginAttempts(email: string, hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    return prisma.auditLog.findMany({
      where: {
        email,
        action: AuditLogType.LOGIN_FAILED,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getRecentActivity(limit: number = 100): Promise<any[]> {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
  }
}
