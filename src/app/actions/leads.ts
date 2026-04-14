'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

const buyerLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  budget_min: z.coerce.number().optional(),
  budget_max: z.coerce.number().optional(),
  preferred_location: z.string().optional(),
  property_type_needed: z.string().optional(),
  area_required: z.string().optional(),
  purpose: z.enum(['Investment', 'Construction', 'Agriculture']).optional(),
  loan_required: z.coerce.boolean().optional(),
  loan_amount: z.coerce.number().optional(),
  urgency: z.enum(['Immediate', '3 months', '6 months']).optional(),
  source: z.string().optional(),
  follow_up_date: z.string().optional(),
  notes_history: z.string().optional(),
})

const sellerLeadSchema = z.object({
  owner_name: z.string().min(1),
  phone: z.string().min(10),
  whatsapp: z.string().optional(),
  property_location: z.string().min(1),
  approximate_area: z.string().optional(),
  asking_price: z.coerce.number().optional(),
  property_type: z.string().optional(),
  reason_for_selling: z.string().optional(),
  document_status: z.string().optional(),
  source: z.string().optional(),
  follow_up_date: z.string().optional(),
})

async function generateLeadId(supabase: Awaited<ReturnType<typeof createClient>>, table: string, prefix: string) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return `${prefix}-${String((count ?? 0) + 1).padStart(3, '0')}`
}

export async function createBuyerLeadAction(formData: FormData) {
  if (isDemoMode) { revalidatePath('/buyer-leads'); redirect('/buyer-leads') }
  const raw = Object.fromEntries(formData.entries())
  const parsed = buyerLeadSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const lead_id = await generateLeadId(supabase, 'buyer_leads', 'BL')
  const { error } = await supabase.from('buyer_leads').insert({ ...parsed.data, lead_id, added_at: new Date().toISOString() })
  if (error) return { error: error.message }
  revalidatePath('/buyer-leads')
  redirect('/buyer-leads')
}

export async function createSellerLeadAction(formData: FormData) {
  if (isDemoMode) { revalidatePath('/seller-leads'); redirect('/seller-leads') }
  const raw = Object.fromEntries(formData.entries())
  const parsed = sellerLeadSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const lead_id = await generateLeadId(supabase, 'seller_leads', 'SL')
  const { error } = await supabase.from('seller_leads').insert({ ...parsed.data, lead_id, added_at: new Date().toISOString() })
  if (error) return { error: error.message }
  revalidatePath('/seller-leads')
  redirect('/seller-leads')
}

export async function updateLeadStatusAction(type: 'seller' | 'buyer', id: string, status: string) {
  if (isDemoMode) { revalidatePath(`/${type}-leads`); return { success: true } }
  const supabase = await createClient()
  const table = type === 'buyer' ? 'buyer_leads' : 'seller_leads'
  const { error } = await supabase.from(table).update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/${type}-leads`)
  return { success: true }
}

export async function addLeadNoteAction(type: 'seller' | 'buyer', id: string, text: string, author: string) {
  if (isDemoMode) return { success: true }
  const supabase = await createClient()
  const table = type === 'buyer' ? 'buyer_leads' : 'seller_leads'
  const { data } = await supabase.from(table).select('notes_history').eq('id', id).single()
  const existing = (data?.notes_history as unknown[]) ?? []
  const note = { timestamp: new Date().toISOString(), author, text }
  const { error } = await supabase.from(table).update({ notes_history: [...existing, note] }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/${type}-leads`)
  return { success: true }
}
