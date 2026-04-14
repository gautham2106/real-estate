import { createClient } from '@/lib/supabase/server'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

const DEMO_USER = {
  id: 'demo-user-id',
  email: 'admin@bluesquare.demo',
  user_metadata: { role: 'admin' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as const

export async function getUser() {
  if (isDemoMode) {
    return DEMO_USER
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export async function getSession() {
  if (isDemoMode) {
    return {
      user: DEMO_USER,
      access_token: 'demo-token',
      refresh_token: 'demo-refresh-token',
    }
  }

  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch {
    return null
  }
}

export async function getUserRole(): Promise<'admin' | 'broker' | null> {
  if (isDemoMode) {
    return 'admin'
  }

  const user = await getUser()
  if (!user) return null

  const role = user.user_metadata?.role
  if (role === 'admin' || role === 'broker') {
    return role
  }

  return 'admin'
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

export async function isBroker(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'broker'
}
