import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  role: z.enum(['ADMIN', 'VETERINARIAN', 'RECEPTIONIST']).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['pt', 'en', 'es']).default('pt'),
    timezone: z.string().default('America/Sao_Paulo'),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
    timeFormat: z.enum(['12h', '24h']).default('24h'),
    currency: z.string().default('BRL'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      appointments: z.boolean().default(true),
      reminders: z.boolean().default(true)
    }).optional()
  }).optional(),
  permissions: z.object({
    canManagePets: z.boolean().default(true),
    canManageGuardians: z.boolean().default(true),
    canManageAppointments: z.boolean().default(true),
    canManageConsultations: z.boolean().default(false),
    canManageInventory: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
    canViewReports: z.boolean().default(false),
    canManageSettings: z.boolean().default(false)
  }).optional()
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

// GET /api/settings/profile - Buscar perfil do usuário
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        preferences: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        clinic: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar estatísticas do usuário se for veterinário
    let userStats = null
    if (userData.role === 'VETERINARIAN') {
      const veterinarian = await prisma.veterinarian.findFirst({
        where: {
          email: userData.email,
          clinicId: user.clinicId
        },
        include: {
          _count: {
            select: {
              appointments: true,
              consultations: true
            }
          }
        }
      })

      if (veterinarian) {
        userStats = {
          totalAppointments: veterinarian._count.appointments,
          totalConsultations: veterinarian._count.consultations,
          specialty: veterinarian.specialty,
          yearsOfExperience: veterinarian.yearsOfExperience,
          crmv: veterinarian.crmv
        }
      }
    }

    return NextResponse.json({
      user: {
        user_id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar,
        role: userData.role,
        preferences: userData.preferences || {},
        permissions: userData.permissions || {},
        isActive: userData.isActive,
        lastLoginAt: userData.lastLoginAt,
        clinic: userData.clinic,
        stats: userStats,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/profile - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Se email foi alterado, verificar se já existe outro usuário com o mesmo email
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: user.userId }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este email' },
          { status: 400 }
        )
      }
    }

    // Verificar permissões para alterar role e permissions
    const canModifyRole = existingUser.role === 'ADMIN' || user.role === 'ADMIN'
    const canModifyPermissions = existingUser.role === 'ADMIN' || user.role === 'ADMIN'

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        avatar: validatedData.avatar,
        ...(canModifyRole && validatedData.role && { role: validatedData.role }),
        preferences: validatedData.preferences || existingUser.preferences,
        ...(canModifyPermissions && validatedData.permissions && { permissions: validatedData.permissions })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        preferences: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        user_id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        preferences: updatedUser.preferences,
        permissions: updatedUser.permissions,
        isActive: updatedUser.isActive,
        created_at: updatedUser.createdAt,
        updated_at: updatedUser.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/settings/profile - Alterar senha
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = passwordChangeSchema.parse(body)

    // Buscar usuário atual
    const existingUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { password: true }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword, 
      existingUser.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.userId },
      data: { 
        password: hashedNewPassword,
        passwordChangedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}