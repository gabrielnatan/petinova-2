import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['ADMIN', 'VETERINARIAN', 'ASSISTANT']).optional()
})

// GET /api/settings/profile - Get user profile
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
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        clinic: {
          select: {
            id: true,
            tradeName: true,
            legalName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Get user stats if veterinarian (simplified)
    let userStats = null
    if (userData.role === 'VETERINARIAN') {
      // Use simplified stats from existing relations
      const [appointmentsCount, consultationsCount] = await Promise.all([
        prisma.appointment.count({
          where: {
            veterinarianId: user.userId
          }
        }),
        prisma.consultation.count({
          where: {
            veterinarianId: user.userId
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
        phone: null,
        avatar: null,
        role: userData.role,
        isActive: userData.active,
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

// PUT /api/settings/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Check if current user can modify their own role (only admin can)
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    const canModifyRole = currentUser?.role === 'ADMIN'

    const updateData: any = {}
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.email) updateData.email = validatedData.email
    if (canModifyRole && validatedData.role) updateData.role = validatedData.role

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
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
      message: 'Perfil atualizado com sucesso',
      user: {
        user_id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: null,
        avatar: null,
        role: updatedUser.role,
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

    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}