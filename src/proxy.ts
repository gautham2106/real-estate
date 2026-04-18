import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths — always allow
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname === '/map' ||
    /^\/properties\/[^/]+\/share/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Demo mode: check for demo_session cookie
  if (isDemoMode) {
    const demoCookie = request.cookies.get('demo_session')
    if (!demoCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Production mode: Supabase session refresh + auth check
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based route protection
  const role = user.user_metadata?.role ?? 'broker'
  const adminOnlyPaths = ['/brokers', '/broker-network', '/reports', '/documents', '/books']
  if (role !== 'admin' && adminOnlyPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/broker-portal', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|login).*)',
  ],
}
