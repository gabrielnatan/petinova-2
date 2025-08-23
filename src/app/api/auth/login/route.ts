import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateAccessToken, createRefreshToken } from '@/lib/jwt'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedData = loginSchema.parse(body)
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        clinic: true
      }
    })
    
    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId
    })
    
    const refreshToken = await createRefreshToken(user.id)
    
    const response = NextResponse.json(
      { 
        message: 'Login realizado com sucesso',
        user: {
          user_id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          active: user.active,
          clinic_id: user.clinicId,
          created_at: user.createdAt
        },
        clinic: {
          clinic_id: user.clinic.id,
          legalName: user.clinic.legalName,
          tradeName: user.clinic.tradeName,
          cnpj: user.clinic.cnpj,
          email: user.clinic.email,
          address: user.clinic.address,
          isActive: user.clinic.isActive,
          created_at: user.clinic.createdAt
        },
        accessToken,
        refreshToken
      },
      { status: 200 }
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
    
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}