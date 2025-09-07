import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PasswordService } from '@/lib/password'
import { z } from 'zod'
import { generateAccessToken, createRefreshToken } from '@/lib/jwt'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha obrigatória'),
    clinicName: z.string().min(2, 'Nome da clínica obrigatório'),
    cnpj: z.string().min(14, 'CNPJ inválido'),
    role: z.enum(['ADMIN', 'VETERINARIAN', 'ASSISTANT']).optional().default('ADMIN')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedData = registerSchema.parse(body)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }
    
    const existingClinic = await prisma.clinic.findUnique({
      where: { cnpj: validatedData.cnpj }
    })
    
    if (existingClinic) {
      return NextResponse.json(
        { error: 'Já existe uma clínica cadastrada com este CNPJ' },
        { status: 400 }
      )
    }
    
    // Validar força da senha
    const passwordValidation = PasswordService.validatePasswordStrength(validatedData.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha não atende aos requisitos de segurança', details: passwordValidation.errors },
        { status: 400 }
      )
    }
    
    const hashedPassword = await PasswordService.hashPassword(validatedData.password)
    
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          legalName: validatedData.clinicName,
          tradeName: validatedData.clinicName,
          cnpj: validatedData.cnpj,
          email: validatedData.email,
          address: "Endereço a ser preenchido"
        }
      })
      
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
          clinicId: clinic.id
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true
        }
      })
      
      return { user, clinic }
    })
    
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      clinicId: result.clinic.id
    })
    
    const refreshToken = await createRefreshToken(result.user.id)
    
    const response = NextResponse.json(
      { 
        message: 'Conta criada com sucesso',
        user: {
          user_id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role.toLowerCase(),
          active: result.user.active,
          clinic_id: result.clinic.id,
          created_at: result.user.createdAt
        },
        clinic: {
          clinic_id: result.clinic.id,
          legalName: result.clinic.legalName,
          tradeName: result.clinic.tradeName,
          cnpj: result.clinic.cnpj,
          email: result.clinic.email,
          address: result.clinic.address,
          isActive: result.clinic.isActive,
          created_at: result.clinic.createdAt
        },
        accessToken,
        refreshToken
      },
      { status: 201 }
    )
    
    // Set access token cookie (15 minutes)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    
    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth' // Only send to auth endpoints
    })
    
    return response
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar conta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}