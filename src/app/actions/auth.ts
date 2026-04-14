'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export async function signIn(
  prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (isDemoMode) {
    // In demo mode, accept any email/password and set a demo session cookie
    const cookieStore = await cookies()
    cookieStore.set('demo_session', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid credentials' }
  }

  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  if (isDemoMode) {
    const cookieStore = await cookies()
    cookieStore.delete('demo_session')
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
