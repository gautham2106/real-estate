'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

export async function markAlertDoneAction(id: string) {
  if (isDemoMode) { revalidatePath('/alerts'); return { success: true } }
  const supabase = await createClient()
  const { error } = await supabase.from('alerts').update({ is_done: true }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/alerts')
  return { success: true }
}

export async function snoozeAlertAction(id: string, days: number) {
  if (isDemoMode) return { success: true }
  const supabase = await createClient()
  const until = new Date()
  until.setDate(until.getDate() + days)
  const { error } = await supabase.from('alerts').update({ snoozed_until: until.toISOString() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/alerts')
  return { success: true }
}

export async function generateAlertsAction() {
  if (isDemoMode) return { count: 0 }
  const { generateAlerts } = await import('@/lib/dal')
  const count = await generateAlerts()
  revalidatePath('/alerts')
  revalidatePath('/dashboard')
  return { count }
}
