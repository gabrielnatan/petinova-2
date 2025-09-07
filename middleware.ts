import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './src/lib/auth'

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
]

const apiPublicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const isAuthenticated = accessToken && verifyToken(accessToken)
  
  // Redirect authenticated users trying to access auth pages
  if (pathname.startsWith('/auth/') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (publicRoutes.includes(pathname) || apiPublicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  
  if (pathname.startsWith('/api/')) {
    const apiAccessToken = request.cookies.get('accessToken')?.value || 
                          request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!apiAccessToken || !verifyToken(apiAccessToken)) {
      // Para APIs, apenas retorna erro 401 - o cliente deve lidar com refresh
      return NextResponse.json(
        { error: 'Token inválido ou ausente', needsRefresh: true },
        { status: 401 }
      )
    }
    
    return NextResponse.next()
  }
  
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}