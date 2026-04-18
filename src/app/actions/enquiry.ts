'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

export async function logEnquiryAction(propertyId: string, name: string, phone: string, notes: string) {
  if (isDemoMode) {
    revalidatePath(`/properties/${propertyId}`)
    return { success: true }
  }
  const supabase = await createClient()
  const { count } = await supabase.from('buyer_leads').select('*', { count: 'exact', head: true })
  const lead_id = `BL-${String((count ?? 0) + 1).padStart(3, '0')}`
  await supabase.from('buyer_leads').insert({
    lead_id, name, phone, status: 'New', source: 'WhatsApp',
    notes_history: [{ timestamp: new Date().toISOString(), author: 'Admin', text: notes || `Enquired about property ${propertyId}` }],
    added_at: new Date().toISOString(), created_at: new Date().toISOString(),
  })
  revalidatePath(`/properties/${propertyId}`)
  revalidatePath('/buyer-leads')
  return { success: true }
}
