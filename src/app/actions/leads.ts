'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, logActivity } from '@/lib/dal'

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
  await logActivity('Buyer Lead Created', `Added buyer lead ${lead_id}`)
  revalidatePath('/buyer-leads')
  redirect('/buyer-leads')
}

export async function updateBuyerLeadAction(id: string, formData: FormData) {
  if (isDemoMode) { revalidatePath('/buyer-leads'); return { success: true } }
  const raw = Object.fromEntries(formData.entries())
  const parsed = buyerLeadSchema.partial().safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('buyer_leads').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Buyer Lead Updated', `Updated buyer lead ${id}`)
  revalidatePath('/buyer-leads')
  revalidatePath(`/buyer-leads/${id}`)
  return { success: true }
}

export async function deleteBuyerLeadAction(id: string) {
  if (isDemoMode) { revalidatePath('/buyer-leads'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('buyer_leads').delete().eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Buyer Lead Deleted', `Deleted buyer lead ${id}`)
  revalidatePath('/buyer-leads')
  return {}
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
  await logActivity('Seller Lead Created', `Added seller lead ${lead_id}`)
  revalidatePath('/seller-leads')
  redirect('/seller-leads')
}

export async function updateSellerLeadAction(id: string, formData: FormData) {
  if (isDemoMode) { revalidatePath('/seller-leads'); return { success: true } }
  const raw = Object.fromEntries(formData.entries())
  const parsed = sellerLeadSchema.partial().safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('seller_leads').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Seller Lead Updated', `Updated seller lead ${id}`)
  revalidatePath('/seller-leads')
  revalidatePath(`/seller-leads/${id}`)
  return { success: true }
}

export async function deleteSellerLeadAction(id: string) {
  if (isDemoMode) { revalidatePath('/seller-leads'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('seller_leads').delete().eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Seller Lead Deleted', `Deleted seller lead ${id}`)
  revalidatePath('/seller-leads')
  return {}
}

export async function convertSellerLeadToPropertyAction(id: string) {
  if (isDemoMode) return { propertyId: 'mock-property-id' }
  const supabase = await createClient()
  const { data: lead } = await supabase.from('seller_leads').select('*').eq('id', id).single()
  if (!lead) return { error: 'Seller lead not found' }

  const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true })
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  const land_code = `BLU-${new Date().getFullYear()}-${seq}`

  const { data: property, error } = await supabase.from('properties').insert({
    title: `${lead.property_type ?? 'Property'} at ${lead.property_location}`,
    type: lead.property_type ?? 'Plot',
    classification: 'Residential',
    area: 0,
    area_unit: 'Sqft',
    price: lead.asking_price ?? 0,
    address: lead.property_location,
    owner_name: lead.owner_name,
    owner_phone: lead.phone,
    owner_whatsapp: lead.whatsapp ?? null,
    land_code,
    status: 'Available',
  }).select('id').single()

  if (error) return { error: error.message }

  await supabase.from('seller_leads')
    .update({ converted_property_id: property.id, status: 'Listed' })
    .eq('id', id)

  await logActivity('Seller Lead Converted', `${lead.lead_id} converted to property ${land_code}`)
  revalidatePath('/seller-leads')
  revalidatePath('/properties')
  return { propertyId: property.id as string }
}

// Quick follow-up date setter — used from alerts page and lead detail without full edit
export async function setFollowUpDateAction(
  id: string,
  type: 'buyer' | 'seller',
  date: string,
) {
  const table = type === 'buyer' ? 'buyer_leads' : 'seller_leads'
  const path  = type === 'buyer' ? '/buyer-leads' : '/seller-leads'

  if (isDemoMode) {
    revalidatePath(path)
    revalidatePath(`${path}/${id}`)
    revalidatePath('/alerts')
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from(table).update({ follow_up_date: date }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(path)
  revalidatePath(`${path}/${id}`)
  revalidatePath('/alerts')
  revalidatePath('/dashboard')
  return { success: true }
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
