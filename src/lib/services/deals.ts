import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { mockDeals } from '@/lib/mock-data'
import type { Deal } from '@/types'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export interface CommissionBreakdown {
  deal_value: number
  total_commission: number
  buyer_broker_payout: number
  seller_broker_payout: number
  referral_payout: number
  tier1_override_payout: number
  tier2_override_payout: number
  your_net: number
}

export function calculateCommission(
  dealValue: number,
  buyerPct: number,
  sellerPct: number,
  hasReferral: boolean,
  hasTier1: boolean,
  hasTier2: boolean
): CommissionBreakdown {
  const totalCommission = dealValue * (buyerPct + sellerPct) / 100
  const buyerSide = dealValue * buyerPct / 100
  const sellerSide = dealValue * sellerPct / 100

  // Broker gets 62.5% of their side's commission
  const buyerBrokerPayout = buyerSide * 0.625
  const sellerBrokerPayout = sellerSide * 0.625

  // Referral = 10% of total if applicable
  const referralPayout = hasReferral ? totalCommission * 0.10 : 0

  // Tier overrides = 5% each of total if applicable
  const tier1OverridePayout = hasTier1 ? totalCommission * 0.05 : 0
  const tier2OverridePayout = hasTier2 ? totalCommission * 0.05 : 0

  const yourNet =
    totalCommission -
    buyerBrokerPayout -
    sellerBrokerPayout -
    referralPayout -
    tier1OverridePayout -
    tier2OverridePayout

  return {
    deal_value: dealValue,
    total_commission: totalCommission,
    buyer_broker_payout: buyerBrokerPayout,
    seller_broker_payout: sellerBrokerPayout,
    referral_payout: referralPayout,
    tier1_override_payout: tier1OverridePayout,
    tier2_override_payout: tier2OverridePayout,
    your_net: Math.max(0, yourNet),
  }
}

export async function getDeals(filters?: { status?: string }): Promise<Deal[]> {
  if (isDemoMode) {
    let results = mockDeals
    if (filters?.status) results = results.filter((d) => d.status === filters.status)
    return results
  }

  const supabase = await createClient()
  let query = supabase.from('deals').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getDealById(id: string): Promise<Deal | null> {
  if (isDemoMode) {
    return mockDeals.find((d) => d.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createDeal(data: Partial<Deal>): Promise<Deal> {
  const hasReferral = !!data.referral_broker_id
  const hasTier1 = !!data.tier1_override_broker_id
  const hasTier2 = !!data.tier2_override_broker_id
  const breakdown = calculateCommission(
    data.deal_value ?? 0,
    data.buyer_commission_pct ?? 2,
    data.seller_commission_pct ?? 2,
    hasReferral,
    hasTier1,
    hasTier2
  )

  if (isDemoMode) {
    const mock: Deal = {
      id: crypto.randomUUID(),
      deal_id: `DEAL-${String(mockDeals.length + 1).padStart(3, '0')}`,
      deal_title: data.deal_title ?? '',
      property_id: data.property_id ?? '',
      buyer_lead_id: data.buyer_lead_id ?? '',
      deal_value: breakdown.deal_value,
      buyer_commission_pct: data.buyer_commission_pct ?? 2,
      seller_commission_pct: data.seller_commission_pct ?? 2,
      total_commission: breakdown.total_commission,
      buyer_broker_payout: breakdown.buyer_broker_payout,
      seller_broker_payout: breakdown.seller_broker_payout,
      referral_payout: breakdown.referral_payout,
      tier1_override_payout: breakdown.tier1_override_payout,
      tier2_override_payout: breakdown.tier2_override_payout,
      your_net: breakdown.your_net,
      status: data.status ?? 'Created',
      created_at: new Date().toISOString(),
      ...data,
    }
    return mock
  }

  const supabase = await createClient()
  const { data: seqData, error: seqErr } = await supabase.rpc('nextval', { sequence_name: 'deal_seq' })
  let deal_id: string
  if (seqErr) {
    const { count } = await supabase.from('deals').select('*', { count: 'exact', head: true })
    deal_id = `DEAL-${String((count ?? 0) + 1).padStart(3, '0')}`
  } else {
    deal_id = `DEAL-${String(seqData).padStart(3, '0')}`
  }

  const insertData = {
    ...data,
    deal_id,
    buyer_broker_payout: breakdown.buyer_broker_payout,
    seller_broker_payout: breakdown.seller_broker_payout,
    referral_payout: breakdown.referral_payout,
    tier1_override_payout: breakdown.tier1_override_payout,
    tier2_override_payout: breakdown.tier2_override_payout,
    your_net: breakdown.your_net,
  }
  // total_commission is a generated column
  delete (insertData as Record<string, unknown>).total_commission
  delete (insertData as Record<string, unknown>).id

  const { data: inserted, error } = await supabase
    .from('deals')
    .insert(insertData)
    .select()
    .single()
  if (error) throw error
  return inserted
}

export async function updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
  if (isDemoMode) {
    const existing = mockDeals.find((d) => d.id === id)
    return { ...existing!, ...data }
  }

  const supabase = await createClient()
  const updateData = { ...data }
  delete (updateData as Record<string, unknown>).total_commission
  delete (updateData as Record<string, unknown>).id

  const { data: updated, error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function updateDealStatus(id: string, status: string): Promise<Deal> {
  if (isDemoMode) {
    const existing = mockDeals.find((d) => d.id === id)
    return { ...existing!, status: status as Deal['status'] }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDealStats(): Promise<{
  pipeline_count: number
  pipeline_value: number
  closed_won: number
  revenue_this_month: number
  your_net_this_month: number
}> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  if (isDemoMode) {
    const pipeline = mockDeals.filter((d) => d.status !== 'Closed Won' && d.status !== 'Closed Lost')
    const closedWon = mockDeals.filter((d) => d.status === 'Closed Won')
    const thisMonth = mockDeals.filter(
      (d) => d.status === 'Closed Won' && d.created_at >= monthStart
    )
    return {
      pipeline_count: pipeline.length,
      pipeline_value: pipeline.reduce((sum, d) => sum + d.deal_value, 0),
      closed_won: closedWon.length,
      revenue_this_month: thisMonth.reduce((sum, d) => sum + (d.total_commission ?? 0), 0),
      your_net_this_month: thisMonth.reduce((sum, d) => sum + (d.your_net ?? 0), 0),
    }
  }

  const supabase = await createClient()
  const { data: allDeals, error } = await supabase.from('deals').select('status, deal_value, total_commission, your_net, created_at')
  if (error) throw error
  const rows = allDeals ?? []

  const pipeline = rows.filter((d) => d.status !== 'Closed Won' && d.status !== 'Closed Lost')
  const closedWon = rows.filter((d) => d.status === 'Closed Won')
  const thisMonth = rows.filter((d) => d.status === 'Closed Won' && d.created_at >= monthStart)

  return {
    pipeline_count: pipeline.length,
    pipeline_value: pipeline.reduce((sum, d) => sum + (d.deal_value ?? 0), 0),
    closed_won: closedWon.length,
    revenue_this_month: thisMonth.reduce((sum, d) => sum + (d.total_commission ?? 0), 0),
    your_net_this_month: thisMonth.reduce((sum, d) => sum + (d.your_net ?? 0), 0),
  }
}
