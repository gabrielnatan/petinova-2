import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const userUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'VETERINARIAN', 'RECEPTIONIST']).optional(),
  avatar: z.string().optional(),
  permissions: z.object({
    canManagePets: z.boolean(),
    canManageGuardians: z.boolean(),
    canManageAppointments: z.boolean(),
    canManageConsultations: z.boolean(),
    canManageInventory: z.boolean(),
    canManageUsers: z.boolean(),
    canViewReports: z.boolean(),
    canManageSettings: z.boolean()
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.enum(['pt', 'en', 'es']),
    timezone: z.string(),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
    timeFormat: z.enum(['12h', '24h']),
    currency: z.string()
  }).optional(),
  isActive: z.boolean().optional()
})

const passwordResetSchema = z.object({
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
})

// GET /api/users/[id] - Buscar usuário específico
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
    
    // Verificar se tem permissão (admin ou próprio usuário)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, permissions: true }
    })

    const canViewUser = currentUser?.role === 'ADMIN' || 
                       (currentUser?.permissions as any)?.canManageUsers || 
                       user.userId === resolvedParams.id

    if (!canViewUser) {
      return NextResponse.json({ error: 'Sem permissão para visualizar este usuário' }, { status: 403 })
    }

    const userData = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        permissions: true,
        preferences: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar estatísticas se for veterinário
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
        role: userData.role,
        avatar: userData.avatar,
        permissions: userData.permissions,
        preferences: userData.preferences,
        isActive: userData.isActive,
        lastLoginAt: userData.lastLoginAt,
        stats: userStats,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Atualizar usuário
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
    const validatedData = userUpdateSchema.parse(body)

    // Verificar se tem permissão (admin ou próprio usuário)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, permissions: true }
    })

    const canEditUser = currentUser?.role === 'ADMIN' || 
                       (currentUser?.permissions as any)?.canManageUsers || 
                       user.userId === resolvedParams.id

    if (!canEditUser) {
      return NextResponse.json({ error: 'Sem permissão para editar este usuário' }, { status: 403 })
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Se email foi alterado, verificar se já existe
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: resolvedParams.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este email' },
          { status: 400 }
        )
      }
    }

    // Verificar permissões para alterar role e permissions (apenas ADMIN pode)
    const canModifyRole = currentUser?.role === 'ADMIN'
    const canModifyPermissions = currentUser?.role === 'ADMIN'

    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.email !== undefined && { email: validatedData.email }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(canModifyRole && validatedData.role !== undefined && { role: validatedData.role }),
        ...(validatedData.avatar !== undefined && { avatar: validatedData.avatar }),
        ...(canModifyPermissions && validatedData.permissions !== undefined && { permissions: validatedData.permissions }),
        ...(validatedData.preferences !== undefined && { preferences: validatedData.preferences }),
        ...(canModifyRole && validatedData.isActive !== undefined && { isActive: validatedData.isActive })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        permissions: true,
        preferences: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: {
        user_id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        permissions: updatedUser.permissions,
        preferences: updatedUser.preferences,
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

    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Deletar usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se tem permissão (apenas ADMIN)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para deletar usuários' }, { status: 403 })
    }

    const resolvedParams = await params
    
    // Não permitir deletar a si mesmo
    if (user.userId === resolvedParams.id) {
      return NextResponse.json({ error: 'Não é possível deletar seu próprio usuário' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      },
      include: {
        _count: {
          select: {
            appointmentsCreated: true,
            consultationsCreated: true
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Se tem histórico, apenas desativar
    if (existingUser._count.appointmentsCreated > 0 || existingUser._count.consultationsCreated > 0) {
      await prisma.user.update({
        where: { id: resolvedParams.id },
        data: { isActive: false }
      })

      return NextResponse.json({
        message: 'Usuário desativado com sucesso (possui histórico de atividades)'
      })
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Usuário excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Resetar senha
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se tem permissão (apenas ADMIN)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para resetar senhas' }, { status: 403 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const validatedData = passwordResetSchema.parse(body)

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        clinicId: user.clinicId
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // Atualizar senha
    await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { 
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Senha resetada com sucesso'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}