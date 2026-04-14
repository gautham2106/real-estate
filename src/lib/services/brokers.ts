import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { mockBrokers, mockLeaderboard } from '@/lib/mock-data'
import type { Broker, BrokerTier, LeaderboardEntry } from '@/types'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

function calcTier(dealtsClosed: number): BrokerTier {
  if (dealtsClosed >= 10) return 'Elite'
  if (dealtsClosed >= 6) return 'Star'
  if (dealtsClosed >= 3) return 'Active'
  if (dealtsClosed >= 1) return 'Starter'
  return 'Starter'
}

export async function getBrokers(filters?: {
  status?: string
  tier?: string
}): Promise<Broker[]> {
  if (isDemoMode) {
    let results = mockBrokers
    if (filters?.status) results = results.filter((b) => b.status === filters.status)
    if (filters?.tier) results = results.filter((b) => b.tier_level === filters.tier)
    return results
  }

  const supabase = await createClient()
  let query = supabase.from('brokers').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.tier) query = query.eq('tier_level', filters.tier)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getBrokerById(id: string): Promise<Broker | null> {
  if (isDemoMode) {
    return mockBrokers.find((b) => b.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createBroker(data: Partial<Broker>): Promise<Broker> {
  if (isDemoMode) {
    const mock: Broker = {
      id: crypto.randomUUID(),
      broker_id: `BRK-${String(mockBrokers.length + 1).padStart(3, '0')}`,
      name: data.name ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      tier_level: data.tier_level ?? 'Starter',
      login_active: data.login_active ?? true,
      joined_date: data.joined_date ?? new Date().toISOString().split('T')[0],
      status: data.status ?? 'Active',
      created_at: new Date().toISOString(),
      ...data,
    }
    return mock
  }

  const supabase = await createClient()
  // Get next sequence value; fall back to row count
  const { data: seqData, error: seqErr } = await supabase.rpc('nextval', {
    sequence_name: 'broker_seq',
  })
  let broker_id: string
  if (seqErr) {
    const { count } = await supabase
      .from('brokers')
      .select('*', { count: 'exact', head: true })
    broker_id = `BRK-${String((count ?? 0) + 1).padStart(3, '0')}`
  } else {
    broker_id = `BRK-${String(seqData).padStart(3, '0')}`
  }

  const insertData = { ...data, broker_id }
  delete (insertData as Record<string, unknown>).id

  const { data: inserted, error } = await supabase
    .from('brokers')
    .insert(insertData)
    .select()
    .single()
  if (error) throw error
  return inserted
}

export async function updateBroker(id: string, data: Partial<Broker>): Promise<Broker> {
  if (isDemoMode) {
    const existing = mockBrokers.find((b) => b.id === id)
    return { ...existing!, ...data }
  }

  const supabase = await createClient()
  const updateData = { ...data }
  delete (updateData as Record<string, unknown>).id

  const { data: updated, error } = await supabase
    .from('brokers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  if (isDemoMode) {
    return mockLeaderboard.slice(0, limit)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brokers')
    .select('broker_id, name, photo_url, deals_closed, total_commission_earned, tier_level')
    .order('deals_closed', { ascending: false })
    .limit(limit)
  if (error) throw error

  return (data ?? []).map((b, idx) => ({
    rank: idx + 1,
    broker_id: b.broker_id,
    broker_name: b.name,
    broker_photo: b.photo_url ?? undefined,
    deals_closed: b.deals_closed ?? 0,
    commission_earned: b.total_commission_earned ?? 0,
    tier_level: b.tier_level as BrokerTier,
  }))
}

export interface BrokerTreeNode extends Broker {
  children: BrokerTreeNode[]
}

export async function getBrokerNetworkTree(): Promise<BrokerTreeNode[]> {
  const brokers = await getBrokers()

  // Build a map keyed by UUID id
  const nodeMap = new Map<string, BrokerTreeNode>()
  for (const b of brokers) {
    nodeMap.set(b.id, { ...b, children: [] })
  }

  const roots: BrokerTreeNode[] = []
  for (const node of nodeMap.values()) {
    if (node.recruited_by_id && nodeMap.has(node.recruited_by_id)) {
      nodeMap.get(node.recruited_by_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function updateBrokerTier(brokerId: string): Promise<Broker> {
  if (isDemoMode) {
    const existing = mockBrokers.find((b) => b.id === brokerId)
    if (!existing) throw new Error(`Broker ${brokerId} not found`)
    const tier = calcTier(existing.deals_closed ?? 0)
    return { ...existing, tier_level: tier }
  }

  const supabase = await createClient()
  const { data: broker, error: fetchErr } = await supabase
    .from('brokers')
    .select('deals_closed')
    .eq('id', brokerId)
    .single()
  if (fetchErr) throw fetchErr

  const tier = calcTier(broker.deals_closed ?? 0)

  const { data: updated, error } = await supabase
    .from('brokers')
    .update({ tier_level: tier })
    .eq('id', brokerId)
    .select()
    .single()
  if (error) throw error
  return updated
}
