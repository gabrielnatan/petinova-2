import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken, revokeAllUserRefreshTokens } from '@/lib/jwt'
import { verifyAccessToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    // Revogar refresh token específico se existir
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }
    
    // Opcionalmente revogar todos os tokens do usuário
    if (accessToken) {
      const payload = verifyAccessToken(accessToken)
      if (payload) {
        await revokeAllUserRefreshTokens(payload.userId)
      }
    }
    
    const response = NextResponse.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    )
    
    // Clear access token cookie
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })
    
    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/api/auth'
    })
    
    return response
    
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json(
      { message: 'Logout realizado com sucesso' }, // Sempre retorna sucesso por segurança
      { status: 200 }
    )
  }
}