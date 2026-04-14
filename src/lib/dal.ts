import 'server-only'

import { createClient } from '@/lib/supabase/server'
import {
  mockProperties, mockBuyerLeads, mockSellerLeads, mockDeals,
  mockBrokers, mockSiteVisits, mockAlerts, mockBooks, mockMetrics,
  mockLeaderboard, mockRecentActivity,
} from '@/lib/mock-data'
import type {
  Property, SellerLead, BuyerLead, SiteVisit, Deal, Broker,
  Document, Book, Alert, DashboardMetrics, LeaderboardEntry, RecentActivity,
} from '@/types'

export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

// ─── PROPERTIES ───────────────────────────────────────────

export async function getProperties(filters?: { status?: string; type?: string }): Promise<Property[]> {
  if (isDemoMode) {
    let data = mockProperties
    if (filters?.status) data = data.filter(p => p.status === filters.status)
    if (filters?.type) data = data.filter(p => p.type === filters.type)
    return data
  }
  const supabase = await createClient()
  let query = supabase.from('properties').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.type) query = query.eq('type', filters.type)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Property[]
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isDemoMode) return mockProperties.find(p => p.id === id) ?? null
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('*').eq('id', id).single()
  return data as Property | null
}

export async function getPropertyStats() {
  if (isDemoMode) return {
    total: mockProperties.length,
    available: mockProperties.filter(p => p.status === 'Available').length,
    negotiating: mockProperties.filter(p => p.status === 'Negotiating').length,
    sold: mockProperties.filter(p => p.status === 'Sold').length,
    expiring_exclusivity: mockProperties.filter(p => {
      if (!p.exclusivity_end) return false
      const days = Math.ceil((new Date(p.exclusivity_end).getTime() - Date.now()) / 86400000)
      return days > 0 && days <= 30
    }).length,
  }
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('status, exclusivity_end')
  const props = data ?? []
  return {
    total: props.length,
    available: props.filter((p: { status: string }) => p.status === 'Available').length,
    negotiating: props.filter((p: { status: string }) => p.status === 'Negotiating').length,
    sold: props.filter((p: { status: string }) => p.status === 'Sold').length,
    expiring_exclusivity: props.filter((p: { exclusivity_end: string | null }) => {
      if (!p.exclusivity_end) return false
      const days = Math.ceil((new Date(p.exclusivity_end).getTime() - Date.now()) / 86400000)
      return days > 0 && days <= 30
    }).length,
  }
}

// ─── SELLER LEADS ─────────────────────────────────────────

export async function getSellerLeads(filters?: { status?: string }): Promise<SellerLead[]> {
  if (isDemoMode) {
    let data = mockSellerLeads
    if (filters?.status) data = data.filter(l => l.status === filters.status)
    return data
  }
  const supabase = await createClient()
  let query = supabase.from('seller_leads').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as SellerLead[]
}

// ─── BUYER LEADS ──────────────────────────────────────────

export async function getBuyerLeads(filters?: { status?: string }): Promise<BuyerLead[]> {
  if (isDemoMode) {
    let data = mockBuyerLeads
    if (filters?.status) data = data.filter(l => l.status === filters.status)
    return data
  }
  const supabase = await createClient()
  let query = supabase.from('buyer_leads').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as BuyerLead[]
}

export async function getLeadStats() {
  if (isDemoMode) {
    const today = new Date().toISOString().split('T')[0]
    return {
      total_buyer: mockBuyerLeads.length,
      total_seller: mockSellerLeads.length,
      total: mockBuyerLeads.length + mockSellerLeads.length,
      new_today: [...mockBuyerLeads, ...mockSellerLeads].filter(l =>
        l.created_at.startsWith(today)
      ).length,
      follow_ups_today: [...mockBuyerLeads, ...mockSellerLeads].filter(l =>
        (l as BuyerLead | SellerLead).follow_up_date === today
      ).length,
    }
  }
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const [buyers, sellers] = await Promise.all([
    supabase.from('buyer_leads').select('id, follow_up_date, created_at'),
    supabase.from('seller_leads').select('id, follow_up_date, created_at'),
  ])
  const allLeads = [...(buyers.data ?? []), ...(sellers.data ?? [])]
  return {
    total_buyer: buyers.data?.length ?? 0,
    total_seller: sellers.data?.length ?? 0,
    total: allLeads.length,
    new_today: allLeads.filter(l => l.created_at?.startsWith(today)).length,
    follow_ups_today: allLeads.filter(l => l.follow_up_date === today).length,
  }
}

// ─── SITE VISITS ──────────────────────────────────────────

export async function getSiteVisits(): Promise<SiteVisit[]> {
  if (isDemoMode) return mockSiteVisits
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_visits').select('*').order('visit_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as SiteVisit[]
}

// ─── DEALS ────────────────────────────────────────────────

export async function getDeals(filters?: { status?: string }): Promise<Deal[]> {
  if (isDemoMode) {
    let data = mockDeals
    if (filters?.status) data = data.filter(d => d.status === filters.status)
    return data
  }
  const supabase = await createClient()
  let query = supabase.from('deals').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Deal[]
}

export async function getDealStats() {
  if (isDemoMode) {
    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthDeals = mockDeals.filter(d => d.created_at.startsWith(thisMonth) && d.status === 'Closed Won')
    return {
      pipeline_count: mockDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.status)).length,
      pipeline_value: mockDeals.reduce((s, d) => s + d.deal_value, 0),
      closed_won: mockDeals.filter(d => d.status === 'Closed Won').length,
      revenue_this_month: monthDeals.reduce((s, d) => s + d.deal_value, 0) || 680000,
      your_net_this_month: monthDeals.reduce((s, d) => s + (d.your_net ?? 0), 0) || 210000,
    }
  }
  const supabase = await createClient()
  const { data } = await supabase.from('deals').select('status, deal_value, your_net, created_at')
  const deals = data ?? []
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthDeals = deals.filter((d: { created_at: string; status: string }) => d.created_at?.startsWith(thisMonth) && d.status === 'Closed Won')
  return {
    pipeline_count: deals.filter((d: { status: string }) => !['Closed Won', 'Closed Lost'].includes(d.status)).length,
    pipeline_value: deals.reduce((s: number, d: { deal_value: number }) => s + d.deal_value, 0),
    closed_won: deals.filter((d: { status: string }) => d.status === 'Closed Won').length,
    revenue_this_month: monthDeals.reduce((s: number, d: { deal_value: number }) => s + d.deal_value, 0),
    your_net_this_month: monthDeals.reduce((s: number, d: { your_net: number }) => s + (d.your_net ?? 0), 0),
  }
}

// ─── BROKERS ──────────────────────────────────────────────

export async function getBrokers(filters?: { status?: string }): Promise<Broker[]> {
  if (isDemoMode) {
    let data = mockBrokers
    if (filters?.status) data = data.filter(b => b.status === filters.status)
    return data
  }
  const supabase = await createClient()
  let query = supabase.from('brokers').select('*').order('deals_closed', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Broker[]
}

export async function getBrokerById(id: string): Promise<Broker | null> {
  if (isDemoMode) return mockBrokers.find(b => b.id === id) ?? null
  const supabase = await createClient()
  const { data } = await supabase.from('brokers').select('*').eq('id', id).single()
  return data as Broker | null
}

export async function getLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  if (isDemoMode) return mockLeaderboard.slice(0, limit)
  const supabase = await createClient()
  const { data } = await supabase.from('brokers').select('id, broker_id, name, photo_url, deals_closed, total_commission_earned, tier_level')
    .order('deals_closed', { ascending: false }).limit(limit)
  return (data ?? []).map((b: Record<string, unknown>, i: number): LeaderboardEntry => ({
    rank: i + 1,
    broker_id: String(b.broker_id ?? ''),
    broker_name: String(b.name ?? ''),
    broker_photo: b.photo_url != null ? String(b.photo_url) : undefined,
    deals_closed: Number(b.deals_closed ?? 0),
    commission_earned: Number(b.total_commission_earned ?? 0),
    tier_level: (b.tier_level as LeaderboardEntry['tier_level']) ?? 'Bronze',
  }))
}

// ─── DOCUMENTS ────────────────────────────────────────────

export async function getDocumentsByProperty(propertyId: string, folder?: string): Promise<Document[]> {
  if (isDemoMode) return []
  const supabase = await createClient()
  let query = supabase.from('documents').select('*').eq('property_id', propertyId)
  if (folder) query = query.eq('folder', folder)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Document[]
}

// ─── BOOKS ────────────────────────────────────────────────

export async function getBooks(): Promise<Book[]> {
  if (isDemoMode) return mockBooks
  const supabase = await createClient()
  const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Book[]
}

// ─── ALERTS ───────────────────────────────────────────────

export async function getAlerts(showDone = false): Promise<Alert[]> {
  if (isDemoMode) return showDone ? mockAlerts : mockAlerts.filter(a => !a.is_done)
  const supabase = await createClient()
  let query = supabase.from('alerts').select('*').order('created_at', { ascending: false })
  if (!showDone) query = query.eq('is_done', false)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Alert[]
}

export async function generateAlerts(): Promise<number> {
  if (isDemoMode) return 0
  const supabase = await createClient()
  let count = 0
  const today = new Date()
  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)

  // Expiring exclusivity
  const { data: expiring } = await supabase.from('properties')
    .select('id, land_code, exclusivity_end')
    .gte('exclusivity_end', today.toISOString().split('T')[0])
    .lte('exclusivity_end', in30.toISOString().split('T')[0])
    .eq('status', 'Available')
  for (const p of expiring ?? []) {
    const days = Math.ceil((new Date(p.exclusivity_end).getTime() - today.getTime()) / 86400000)
    const msg = `${p.land_code} exclusivity expires in ${days} day${days !== 1 ? 's' : ''}`
    const { data: existing } = await supabase.from('alerts').select('id').eq('message', msg).eq('is_done', false)
    if (!existing?.length) {
      await supabase.from('alerts').insert({ type: 'Exclusivity Expiring', message: msg, related_id: p.id, related_type: 'property' })
      count++
    }
  }

  // Follow-ups due today
  const todayStr = today.toISOString().split('T')[0]
  const [buyerFollowUps, sellerFollowUps] = await Promise.all([
    supabase.from('buyer_leads').select('id, lead_id, name, follow_up_date').eq('follow_up_date', todayStr),
    supabase.from('seller_leads').select('id, lead_id, owner_name, follow_up_date').eq('follow_up_date', todayStr),
  ])
  for (const lead of [...(buyerFollowUps.data ?? []), ...(sellerFollowUps.data ?? [])]) {
    const name = 'name' in lead ? lead.name : lead.owner_name
    const msg = `Follow up due with ${name} (${lead.lead_id}) today`
    const { data: existing } = await supabase.from('alerts').select('id').eq('message', msg).eq('is_done', false)
    if (!existing?.length) {
      await supabase.from('alerts').insert({ type: 'Follow Up Due', message: msg, related_id: lead.id, related_type: 'lead' })
      count++
    }
  }

  // Deals stuck > 14 days
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - 14)
  const { data: stuckDeals } = await supabase.from('deals')
    .select('id, deal_id, status, created_at')
    .not('status', 'in', '("Closed Won","Closed Lost")')
    .lt('created_at', cutoff.toISOString())
  for (const d of stuckDeals ?? []) {
    const msg = `${d.deal_id} stuck in "${d.status}" for over 14 days`
    const { data: existing } = await supabase.from('alerts').select('id').eq('message', msg).eq('is_done', false)
    if (!existing?.length) {
      await supabase.from('alerts').insert({ type: 'Deal Stuck', message: msg, related_id: d.id, related_type: 'deal' })
      count++
    }
  }
  return count
}

// ─── DASHBOARD ────────────────────────────────────────────

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (isDemoMode) return mockMetrics
  const [propStats, leadStats, dealStats, alertCount] = await Promise.all([
    getPropertyStats(),
    getLeadStats(),
    getDealStats(),
    getAlerts(false).then(a => a.filter(al => al.type === 'Exclusivity Expiring').length),
  ])
  return {
    total_active_listings: propStats.available,
    total_leads: leadStats.total,
    deals_in_pipeline: dealStats.pipeline_count,
    revenue_this_month: dealStats.revenue_this_month,
    your_net_this_month: dealStats.your_net_this_month,
    new_leads_today: leadStats.new_today,
    follow_ups_today: leadStats.follow_ups_today,
    expiring_exclusivity: alertCount,
  }
}

export async function getRecentActivity(limit = 6): Promise<RecentActivity[]> {
  if (isDemoMode) return mockRecentActivity
  const supabase = await createClient()
  const { data } = await supabase.from('activity_log')
    .select('*').order('created_at', { ascending: false }).limit(limit)
  return (data ?? []).map((a: { id: string; type: string; description: string; actor: string; created_at: string }) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    user: a.actor,
    timestamp: new Date(a.created_at).toLocaleDateString('en-IN'),
  }))
}
