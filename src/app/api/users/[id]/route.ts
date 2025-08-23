import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const userUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['ADMIN', 'VETERINARIAN', 'ASSISTANT']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
})

// GET /api/users/[id] - Get specific user
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
    
    // Check permissions to view user
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    const canViewUser = currentUser?.role === 'ADMIN' || 
                       user.userId === resolvedParams.id

    if (!canViewUser) {
      return NextResponse.json({ error: 'Sem permissão para visualizar este usuário' }, { status: 403 })
    }

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Get stats if veterinarian (simplified)
    let userStats = null
    if (userData.role === 'VETERINARIAN') {
      // Mock stats for now since detailed veterinarian model doesn't exist
      const [appointmentsCount, consultationsCount] = await Promise.all([
        prisma.appointment.count({
          where: {
            veterinarianId: resolvedParams.id
          }
        }),
        prisma.consultation.count({
          where: {
            veterinarianId: resolvedParams.id
          }
        })
      ])

      userStats = {
        totalAppointments: appointmentsCount,
        totalConsultations: consultationsCount,
        specialty: 'Clínico Geral', // Mock
        yearsOfExperience: null, // Not available
        crmv: null // Not available
      }
    }

    return NextResponse.json({
      user: {
        user_id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: null, // Not in schema
        avatar: null, // Not in schema
        role: userData.role,
        permissions: {}, // Mocked empty permissions
        isActive: userData.active,
        lastLoginAt: null, // Not in schema
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

// PUT /api/users/[id] - Update user
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

    // Check permissions (only admin can update other users)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    const canModifyUser = currentUser?.role === 'ADMIN' || user.userId === resolvedParams.id
    const canModifyRole = currentUser?.role === 'ADMIN'

    if (!canModifyUser) {
      return NextResponse.json({ error: 'Sem permissão para alterar este usuário' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.active !== undefined) updateData.active = validatedData.active
    
    if (canModifyRole && validatedData.role) {
      updateData.role = validatedData.role
    }

    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
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
        phone: null,
        avatar: null,
        role: updatedUser.role,
        permissions: {},
        isActive: updatedUser.active,
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

// DELETE /api/users/[id] - Delete user (only admin)
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
    
    // Only admin can delete users
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para excluir usuários' }, { status: 403 })
    }

    // Can't delete yourself
    if (user.userId === resolvedParams.id) {
      return NextResponse.json({ error: 'Não é possível excluir seu próprio usuário' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Instead of deleting, deactivate the user
    await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { active: false }
    })

    return NextResponse.json({
      message: 'Usuário desativado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}