import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In demo mode (no Supabase URL), skip auth entirely
const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

const PUBLIC_PATHS = ['/login', '/api/', '/_next/', '/favicon.ico', '/robots.txt']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // In demo mode: allow all routes
  if (isDemoMode) {
    return NextResponse.next()
  }

  // Production: check Supabase session cookie
  const sessionCookie = request.cookies.get('sb-access-token') ??
    request.cookies.getAll().find(c => c.name.includes('auth-token'))

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}
