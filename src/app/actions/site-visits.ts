'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, logActivity } from '@/lib/dal'

const siteVisitSchema = z.object({
  property_id: z.string().min(1),
  buyer_id: z.string().min(1),
  visit_date: z.string().min(1),
  visit_time: z.string().optional(),
  broker_id: z.string().optional(),
  buyer_reaction: z.string().optional(),
  buyer_remarks: z.string().optional(),
  owner_remarks: z.string().optional(),
  price_discussed: z.coerce.number().optional(),
  objections: z.string().optional(),
  internal_note: z.string().optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
  outcome: z.string().optional(),
})

export async function createSiteVisitAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = siteVisitSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/site-visits'); redirect('/site-visits') }

  const supabase = await createClient()
  const { count } = await supabase.from('site_visits').select('*', { count: 'exact', head: true })
  const visit_id = `SV-${String((count ?? 0) + 1).padStart(3, '0')}`

  const { error } = await supabase.from('site_visits').insert({
    visit_id,
    ...parsed.data,
    broker_id: parsed.data.broker_id || null,
    created_at: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  await logActivity('Site Visit Logged', `Visit ${visit_id} scheduled`)
  revalidatePath('/site-visits')
  redirect('/site-visits')
}

export async function updateSiteVisitAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = siteVisitSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/site-visits'); return {} }

  const supabase = await createClient()
  const { error } = await supabase.from('site_visits').update({
    ...parsed.data,
    broker_id: parsed.data.broker_id || null,
  }).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Site Visit Updated', `Updated site visit ${id}`)
  revalidatePath('/site-visits')
  revalidatePath(`/site-visits/${id}`)
  return {}
}

export async function deleteSiteVisitAction(id: string) {
  if (isDemoMode) { revalidatePath('/site-visits'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('site_visits').delete().eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Site Visit Deleted', `Deleted site visit ${id}`)
  revalidatePath('/site-visits')
  return {}
}
