import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRefreshToken, generateAccessToken, createRefreshToken, revokeRefreshToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não encontrado' },
        { status: 401 }
      )
    }
    
    const tokenData = await validateRefreshToken(refreshToken)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Refresh token inválido ou expirado' },
        { status: 401 }
      )
    }
    
    // Buscar dados atualizados do usuário
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      include: { clinic: true }
    })
    
    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 401 }
      )
    }
    
    // Revogar o refresh token atual
    await revokeRefreshToken(refreshToken)
    
    // Gerar novos tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId
    })
    
    const newRefreshToken = await createRefreshToken(user.id)
    
    const response = NextResponse.json(
      { 
        message: 'Tokens renovados com sucesso',
        accessToken: newAccessToken,
        user: {
          user_id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          active: user.active,
          clinic_id: user.clinicId,
          created_at: user.createdAt
        }
      },
      { status: 200 }
    )
    
    // Set new access token cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    
    // Set new refresh token cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth'
    })
    
    return response
    
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}