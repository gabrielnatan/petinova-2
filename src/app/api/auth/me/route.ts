import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Token inválido ou ausente' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      include: { clinic: true }
    })
    
    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
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
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}