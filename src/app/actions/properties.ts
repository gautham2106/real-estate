'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

const propertySchema = z.object({
  title: z.string().min(2),
  type: z.enum(['Plot', 'House', 'Farm', 'Commercial']),
  classification: z.enum(['Agricultural', 'Residential', 'Commercial']),
  area: z.coerce.number().positive(),
  area_unit: z.enum(['Sqft', 'Cents', 'Acres']),
  price: z.coerce.number().positive(),
  address: z.string().optional(),
  village: z.string().optional(),
  taluk: z.string().optional(),
  district: z.string().optional(),
  facing: z.enum(['N', 'S', 'E', 'W']).optional(),
  gps_lat: z.coerce.number().optional(),
  gps_lng: z.coerce.number().optional(),
  road_access: z.string().optional(),
  water: z.string().optional(),
  electricity: z.coerce.boolean().optional(),
  survey_number: z.string().optional(),
  patta_number: z.string().optional(),
  dtcp_approved: z.enum(['Yes', 'No', 'Applied']).optional(),
  rera_applicable: z.coerce.boolean().optional(),
  legal_status: z.enum(['Clear', 'Disputed', 'Pending']).optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
  owner_whatsapp: z.string().optional(),
  owner_aadhaar: z.string().optional(),
  owner_pan: z.string().optional(),
  exclusivity_start: z.string().optional(),
  exclusivity_end: z.string().optional(),
  assigned_broker_id: z.string().optional(),
  internal_notes: z.string().optional(),
  status: z.string().default('Available'),
  side_a: z.coerce.number().optional(),
  side_b: z.coerce.number().optional(),
  side_c: z.coerce.number().optional(),
  side_d: z.coerce.number().optional(),
})

export async function createPropertyAction(formData: FormData) {
  if (isDemoMode) {
    revalidatePath('/properties')
    redirect('/properties')
  }
  const raw = Object.fromEntries(formData.entries())
  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }
  const supabase = await createClient()
  const land_code = await generateLandCode(supabase)
  const { error } = await supabase.from('properties').insert({ ...parsed.data, land_code })
  if (error) return { error: error.message }
  revalidatePath('/properties')
  redirect('/properties')
}

export async function updatePropertyStatusAction(id: string, status: string) {
  if (isDemoMode) { revalidatePath('/properties'); return { success: true } }
  const supabase = await createClient()
  const { error } = await supabase.from('properties').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/properties')
  revalidatePath('/kanban')
  return { success: true }
}

export async function updatePropertyAction(id: string, formData: FormData) {
  if (isDemoMode) { revalidatePath('/properties'); return { success: true } }
  const raw = Object.fromEntries(formData.entries())
  const parsed = propertySchema.partial().safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('properties').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/properties')
  return { success: true }
}

async function generateLandCode(supabase: Awaited<ReturnType<typeof createClient>>) {
  const year = new Date().getFullYear()
  const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true })
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  return `BLU-${year}-${seq}`
}
