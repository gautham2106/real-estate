'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, logActivity } from '@/lib/dal'

const brokerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone required'),
  whatsapp: z.string().optional(),
  email: z.string().email('Valid email is required'),
  area_coverage: z.string().optional(),
  recruited_by_id: z.string().optional(),
  co_sponsor_1_id: z.string().optional(),
  co_sponsor_2_id: z.string().optional(),
  login_active: z.coerce.boolean().default(true),
  bank_account: z.string().optional(),
  upi_id: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Blacklisted']).default('Active'),
  notes: z.string().optional(),
})

export async function createBrokerAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = brokerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/brokers'); redirect('/brokers') }

  const supabase = await createClient()
  const { count } = await supabase.from('brokers').select('*', { count: 'exact', head: true })
  const broker_id = `BRK-${String((count ?? 0) + 1).padStart(3, '0')}`

  const { error } = await supabase.from('brokers').insert({
    broker_id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp || null,
    email: parsed.data.email || null,
    area_coverage: parsed.data.area_coverage || null,
    recruited_by_id: parsed.data.recruited_by_id || null,
    co_sponsor_1_id: parsed.data.co_sponsor_1_id || null,
    co_sponsor_2_id: parsed.data.co_sponsor_2_id || null,
    login_active: parsed.data.login_active,
    bank_account: parsed.data.bank_account || null,
    upi_id: parsed.data.upi_id || null,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    tier_level: 'Starter',
    joined_date: new Date().toISOString().split('T')[0],
  })
  if (error) return { error: error.message }
  await logActivity('Broker Added', `Added broker ${broker_id} — ${parsed.data.name}`)
  revalidatePath('/brokers')
  redirect('/brokers')
}

export async function updateBrokerAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = brokerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/brokers'); return {} }

  const supabase = await createClient()
  const { error } = await supabase.from('brokers').update({
    name: parsed.data.name,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp || null,
    email: parsed.data.email || null,
    area_coverage: parsed.data.area_coverage || null,
    recruited_by_id: parsed.data.recruited_by_id || null,
    co_sponsor_1_id: parsed.data.co_sponsor_1_id || null,
    co_sponsor_2_id: parsed.data.co_sponsor_2_id || null,
    login_active: parsed.data.login_active,
    bank_account: parsed.data.bank_account || null,
    upi_id: parsed.data.upi_id || null,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
  }).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Broker Updated', `Updated broker ${id}`)
  revalidatePath('/brokers')
  revalidatePath(`/brokers/${id}`)
  return {}
}

export async function deleteBrokerAction(id: string) {
  if (isDemoMode) { revalidatePath('/brokers'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('brokers').delete().eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Broker Deleted', `Deleted broker ${id}`)
  revalidatePath('/brokers')
  return {}
}
