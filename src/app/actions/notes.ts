'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

export async function addNoteAction(id: string, type: 'buyer' | 'seller', text: string) {
  if (!text.trim()) return { error: 'Note cannot be empty' }
  const table = type === 'buyer' ? 'buyer_leads' : 'seller_leads'
  const path = type === 'buyer' ? '/buyer-leads' : '/seller-leads'

  if (isDemoMode) {
    revalidatePath(`${path}/${id}`)
    return { success: true }
  }

  const supabase = await createClient()
  const { data: lead } = await supabase.from(table).select('notes_history').eq('id', id).single()
  const existing = (lead?.notes_history ?? []) as Array<{ timestamp: string; author: string; text: string }>
  const newNote = { timestamp: new Date().toISOString(), author: 'Admin', text }
  await supabase.from(table).update({ notes_history: [...existing, newNote] }).eq('id', id)
  revalidatePath(`${path}/${id}`)
  return { success: true }
}
