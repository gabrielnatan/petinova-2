import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const userCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'VETERINARIAN', 'RECEPTIONIST']),
  avatar: z.string().optional(),
  permissions: z.object({
    canManagePets: z.boolean().default(true),
    canManageGuardians: z.boolean().default(true),
    canManageAppointments: z.boolean().default(true),
    canManageConsultations: z.boolean().default(false),
    canManageInventory: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
    canViewReports: z.boolean().default(false),
    canManageSettings: z.boolean().default(false)
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['pt', 'en', 'es']).default('pt'),
    timezone: z.string().default('America/Sao_Paulo'),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
    timeFormat: z.enum(['12h', '24h']).default('24h'),
    currency: z.string().default('BRL')
  }).optional(),
  isActive: z.boolean().default(true)
})

// GET /api/users - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se tem permissão para gerenciar usuários
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, permissions: true }
    })

    if (!currentUser || (currentUser.role !== 'ADMIN' && !(currentUser.permissions as any)?.canManageUsers)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit

    const where: any = {
      clinicId: user.clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(role && { role }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users: users.map(user => ({
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions,
        preferences: user.preferences,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/users - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se tem permissão para gerenciar usuários
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, permissions: true }
    })

    if (!currentUser || (currentUser.role !== 'ADMIN' && !(currentUser.permissions as any)?.canManageUsers)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = userCreateSchema.parse(body)

    // Verificar se já existe usuário com o mesmo email
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Gerar permissões padrão baseadas no role se não fornecidas
    const defaultPermissions = generateDefaultPermissions(validatedData.role)
    const permissions = validatedData.permissions || defaultPermissions

    // Gerar preferências padrão se não fornecidas
    const defaultPreferences = {
      theme: 'system' as const,
      language: 'pt' as const,
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY' as const,
      timeFormat: '24h' as const,
      currency: 'BRL'
    }
    const preferences = validatedData.preferences || defaultPreferences

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: validatedData.role,
        avatar: validatedData.avatar,
        permissions,
        preferences,
        isActive: validatedData.isActive,
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
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        permissions: newUser.permissions,
        preferences: newUser.preferences,
        isActive: newUser.isActive,
        created_at: newUser.createdAt,
        updated_at: newUser.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateDefaultPermissions(role: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST') {
  const basePermissions = {
    canManagePets: true,
    canManageGuardians: true,
    canManageAppointments: true,
    canManageConsultations: false,
    canManageInventory: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false
  }

  switch (role) {
    case 'ADMIN':
      return {
        canManagePets: true,
        canManageGuardians: true,
        canManageAppointments: true,
        canManageConsultations: true,
        canManageInventory: true,
        canManageUsers: true,
        canViewReports: true,
        canManageSettings: true
      }
    case 'VETERINARIAN':
      return {
        ...basePermissions,
        canManageConsultations: true,
        canManageInventory: true,
        canViewReports: true
      }
    case 'RECEPTIONIST':
      return basePermissions
    default:
      return basePermissions
  }
}