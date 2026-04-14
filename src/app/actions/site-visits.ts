'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

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
})

export async function createSiteVisitAction(formData: FormData) {
  if (isDemoMode) { revalidatePath('/site-visits'); redirect('/site-visits') }
  const raw = Object.fromEntries(formData.entries())
  const parsed = siteVisitSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('site_visits').insert({
    ...parsed.data,
    visit_date: new Date(parsed.data.visit_date).toISOString(),
    created_at: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  revalidatePath('/site-visits')
  redirect('/site-visits')
}
