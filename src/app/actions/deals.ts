'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, logActivity } from '@/lib/dal'

function calcCommission(dealValue: number, buyerPct: number, sellerPct: number, hasReferral: boolean, hasTier1: boolean, hasTier2: boolean) {
  const totalCommission = dealValue * (buyerPct + sellerPct) / 100
  const buyerBrokerPayout = dealValue * 1.25 / 100
  const sellerBrokerPayout = dealValue * 1.25 / 100
  const referralPayout = hasReferral ? dealValue * 0.25 / 100 : 0
  const tier1OverridePayout = hasTier1 ? dealValue * 0.10 / 100 : 0
  const tier2OverridePayout = hasTier2 ? dealValue * 0.05 / 100 : 0
  const yourNet = totalCommission - buyerBrokerPayout - sellerBrokerPayout - referralPayout - tier1OverridePayout - tier2OverridePayout
  return { totalCommission, buyerBrokerPayout, sellerBrokerPayout, referralPayout, tier1OverridePayout, tier2OverridePayout, yourNet }
}

const dealSchema = z.object({
  property_id: z.string().uuid(),
  buyer_lead_id: z.string().uuid(),
  seller_lead_id: z.string().uuid().optional().or(z.literal('')),
  buyer_broker_id: z.string().uuid().optional().or(z.literal('')),
  seller_broker_id: z.string().uuid().optional().or(z.literal('')),
  referral_broker_id: z.string().uuid().optional().or(z.literal('')),
  co_sponsor_broker_1_id: z.string().uuid().optional().or(z.literal('')),
  co_sponsor_broker_2_id: z.string().uuid().optional().or(z.literal('')),
  tier1_override_broker_id: z.string().uuid().optional().or(z.literal('')),
  tier2_override_broker_id: z.string().uuid().optional().or(z.literal('')),
  deal_value: z.coerce.number().positive(),
  buyer_commission_pct: z.coerce.number().default(2),
  seller_commission_pct: z.coerce.number().default(2),
  has_referral: z.coerce.boolean().optional(),
  token_amount: z.coerce.number().optional(),
  token_date: z.string().optional(),
  advance_amount: z.coerce.number().optional(),
  advance_date: z.string().optional(),
  final_amount: z.coerce.number().optional(),
  final_date: z.string().optional(),
  mou_date: z.string().optional(),
  registration_date: z.string().optional(),
  loan_required: z.coerce.boolean().optional(),
  loan_amount: z.coerce.number().optional(),
  bank_name: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

export async function createDealAction(formData: FormData) {
  if (isDemoMode) { revalidatePath('/deals'); redirect('/deals') }
  const raw = Object.fromEntries(formData.entries())
  const parsed = dealSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { count } = await supabase.from('deals').select('*', { count: 'exact', head: true })
  const deal_id = `DEAL-${String((count ?? 0) + 1).padStart(3, '0')}`
  // Get property and buyer for title
  const [{ data: prop }, { data: buyer }] = await Promise.all([
    supabase.from('properties').select('land_code').eq('id', parsed.data.property_id).single(),
    supabase.from('buyer_leads').select('name').eq('id', parsed.data.buyer_lead_id).single(),
  ])
  const deal_title = `${prop?.land_code ?? 'Property'} × ${buyer?.name ?? 'Buyer'}`
  const hasTier1 = !!parsed.data.tier1_override_broker_id
  const hasTier2 = !!parsed.data.tier2_override_broker_id
  const comm = calcCommission(
    parsed.data.deal_value, parsed.data.buyer_commission_pct, parsed.data.seller_commission_pct,
    !!parsed.data.has_referral, hasTier1, hasTier2
  )
  const { error } = await supabase.from('deals').insert({
    deal_id, deal_title,
    property_id: parsed.data.property_id,
    buyer_lead_id: parsed.data.buyer_lead_id,
    seller_lead_id: parsed.data.seller_lead_id || null,
    buyer_broker_id: parsed.data.buyer_broker_id || null,
    seller_broker_id: parsed.data.seller_broker_id || null,
    referral_broker_id: parsed.data.referral_broker_id || null,
    co_sponsor_broker_1_id: parsed.data.co_sponsor_broker_1_id || null,
    co_sponsor_broker_2_id: parsed.data.co_sponsor_broker_2_id || null,
    tier1_override_broker_id: parsed.data.tier1_override_broker_id || null,
    tier2_override_broker_id: parsed.data.tier2_override_broker_id || null,
    deal_value: parsed.data.deal_value,
    buyer_commission_pct: parsed.data.buyer_commission_pct,
    seller_commission_pct: parsed.data.seller_commission_pct,
    buyer_broker_payout: comm.buyerBrokerPayout,
    seller_broker_payout: comm.sellerBrokerPayout,
    referral_payout: comm.referralPayout,
    tier1_override_payout: comm.tier1OverridePayout,
    tier2_override_payout: comm.tier2OverridePayout,
    your_net: comm.yourNet,
    token_amount: parsed.data.token_amount ?? null,
    token_date: parsed.data.token_date || null,
    advance_amount: parsed.data.advance_amount ?? null,
    advance_date: parsed.data.advance_date || null,
    final_amount: parsed.data.final_amount ?? null,
    final_date: parsed.data.final_date || null,
    mou_date: parsed.data.mou_date || null,
    registration_date: parsed.data.registration_date || null,
    loan_required: parsed.data.loan_required ?? false,
    loan_amount: parsed.data.loan_amount ?? null,
    bank_name: parsed.data.bank_name || null,
    notes: parsed.data.notes ?? null,
    status: parsed.data.status ?? 'Created',
  })
  if (error) return { error: error.message }
  await logActivity('Deal Created', `Created deal ${deal_id}`)
  revalidatePath('/deals')
  revalidatePath('/kanban')
  redirect('/deals')
}

export async function deleteDealAction(id: string) {
  if (isDemoMode) { revalidatePath('/deals'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Deal Deleted', `Deleted deal ${id}`)
  revalidatePath('/deals')
  revalidatePath('/kanban')
  return {}
}

export async function updateDealAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = dealSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/deals'); return {} }

  const supabase = await createClient()
  const hasTier1 = !!parsed.data.tier1_override_broker_id
  const hasTier2 = !!parsed.data.tier2_override_broker_id
  const comm = calcCommission(
    parsed.data.deal_value, parsed.data.buyer_commission_pct, parsed.data.seller_commission_pct,
    !!parsed.data.has_referral, hasTier1, hasTier2
  )
  const [{ data: prop }, { data: buyer }] = await Promise.all([
    supabase.from('properties').select('land_code').eq('id', parsed.data.property_id).single(),
    supabase.from('buyer_leads').select('name').eq('id', parsed.data.buyer_lead_id).single(),
  ])
  const deal_title = `${prop?.land_code ?? 'Property'} × ${buyer?.name ?? 'Buyer'}`

  const { error } = await supabase.from('deals').update({
    deal_title,
    property_id: parsed.data.property_id,
    buyer_lead_id: parsed.data.buyer_lead_id,
    seller_lead_id: parsed.data.seller_lead_id || null,
    buyer_broker_id: parsed.data.buyer_broker_id || null,
    seller_broker_id: parsed.data.seller_broker_id || null,
    referral_broker_id: parsed.data.referral_broker_id || null,
    co_sponsor_broker_1_id: parsed.data.co_sponsor_broker_1_id || null,
    co_sponsor_broker_2_id: parsed.data.co_sponsor_broker_2_id || null,
    tier1_override_broker_id: parsed.data.tier1_override_broker_id || null,
    tier2_override_broker_id: parsed.data.tier2_override_broker_id || null,
    deal_value: parsed.data.deal_value,
    buyer_commission_pct: parsed.data.buyer_commission_pct,
    seller_commission_pct: parsed.data.seller_commission_pct,
    buyer_broker_payout: comm.buyerBrokerPayout,
    seller_broker_payout: comm.sellerBrokerPayout,
    referral_payout: comm.referralPayout,
    tier1_override_payout: comm.tier1OverridePayout,
    tier2_override_payout: comm.tier2OverridePayout,
    your_net: comm.yourNet,
    token_amount: parsed.data.token_amount ?? null,
    token_date: parsed.data.token_date || null,
    advance_amount: parsed.data.advance_amount ?? null,
    advance_date: parsed.data.advance_date || null,
    final_amount: parsed.data.final_amount ?? null,
    final_date: parsed.data.final_date || null,
    mou_date: parsed.data.mou_date || null,
    registration_date: parsed.data.registration_date || null,
    loan_required: parsed.data.loan_required ?? false,
    loan_amount: parsed.data.loan_amount ?? null,
    bank_name: parsed.data.bank_name || null,
    notes: parsed.data.notes ?? null,
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
  }).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Deal Updated', `Updated deal ${id}`)
  revalidatePath('/deals')
  revalidatePath(`/deals/${id}`)
  revalidatePath('/kanban')
  return {}
}

export async function updateDealStatusAction(id: string, status: string) {
  if (isDemoMode) { revalidatePath('/deals'); revalidatePath('/kanban'); return { success: true } }
  const supabase = await createClient()
  const { error } = await supabase.from('deals').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Deal Status Updated', `Deal ${id} moved to ${status}`)
  revalidatePath('/deals')
  revalidatePath('/kanban')
  return { success: true }
}
