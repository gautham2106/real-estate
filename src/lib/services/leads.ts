import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { mockSellerLeads, mockBuyerLeads } from '@/lib/mock-data'
import type { SellerLead, BuyerLead, NoteEntry } from '@/types'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

// ─── SELLER LEADS ─────────────────────────────────────────────────────────────

export async function getSellerLeads(filters?: { status?: string }): Promise<SellerLead[]> {
  if (isDemoMode) {
    let results = mockSellerLeads
    if (filters?.status) results = results.filter((l) => l.status === filters.status)
    return results
  }

  const supabase = await createClient()
  let query = supabase.from('seller_leads').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getSellerLeadById(id: string): Promise<SellerLead | null> {
  if (isDemoMode) {
    return mockSellerLeads.find((l) => l.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('seller_leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createSellerLead(data: Partial<SellerLead>): Promise<SellerLead> {
  if (isDemoMode) {
    const mock: SellerLead = {
      id: crypto.randomUUID(),
      lead_id: `SL-${String(mockSellerLeads.length + 1).padStart(3, '0')}`,
      owner_name: data.owner_name ?? '',
      phone: data.phone ?? '',
      property_location: data.property_location ?? '',
      status: data.status ?? 'New',
      added_at: new Date().toISOString(),
      notes_history: [],
      created_at: new Date().toISOString(),
      ...data,
    }
    return mock
  }

  const supabase = await createClient()
  const { data: seqData, error: seqErr } = await supabase.rpc('nextval', { sequence_name: 'seller_lead_seq' })
  if (seqErr) {
    // Fallback: get count
    const { count } = await supabase.from('seller_leads').select('*', { count: 'exact', head: true })
    const n = (count ?? 0) + 1
    const lead_id = `SL-${String(n).padStart(3, '0')}`
    const { data: inserted, error } = await supabase
      .from('seller_leads')
      .insert({ ...data, lead_id })
      .select()
      .single()
    if (error) throw error
    return inserted
  }
  const lead_id = `SL-${String(seqData).padStart(3, '0')}`
  const { data: inserted, error } = await supabase
    .from('seller_leads')
    .insert({ ...data, lead_id })
    .select()
    .single()
  if (error) throw error
  return inserted
}

export async function updateSellerLead(id: string, data: Partial<SellerLead>): Promise<SellerLead> {
  if (isDemoMode) {
    const existing = mockSellerLeads.find((l) => l.id === id)
    return { ...existing!, ...data }
  }

  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from('seller_leads')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function addSellerLeadNote(
  id: string,
  note: { author: string; text: string }
): Promise<SellerLead> {
  const newEntry: NoteEntry = {
    timestamp: new Date().toISOString(),
    author: note.author,
    text: note.text,
  }

  if (isDemoMode) {
    const existing = mockSellerLeads.find((l) => l.id === id)
    const updated: SellerLead = {
      ...existing!,
      notes_history: [...(existing?.notes_history ?? []), newEntry],
    }
    return updated
  }

  const supabase = await createClient()
  // Fetch current notes then append
  const { data: current, error: fetchErr } = await supabase
    .from('seller_leads')
    .select('notes_history')
    .eq('id', id)
    .single()
  if (fetchErr) throw fetchErr

  const updatedNotes: NoteEntry[] = [...((current.notes_history as NoteEntry[]) ?? []), newEntry]

  const { data: updated, error } = await supabase
    .from('seller_leads')
    .update({ notes_history: updatedNotes })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function convertSellerLeadToProperty(
  leadId: string,
  propertyId: string
): Promise<SellerLead> {
  if (isDemoMode) {
    const existing = mockSellerLeads.find((l) => l.id === leadId)
    return { ...existing!, converted_property_id: propertyId, status: 'Sold' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('seller_leads')
    .update({ converted_property_id: propertyId, status: 'Sold' })
    .eq('id', leadId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── BUYER LEADS ──────────────────────────────────────────────────────────────

export async function getBuyerLeads(filters?: { status?: string }): Promise<BuyerLead[]> {
  if (isDemoMode) {
    let results = mockBuyerLeads
    if (filters?.status) results = results.filter((l) => l.status === filters.status)
    return results
  }

  const supabase = await createClient()
  let query = supabase.from('buyer_leads').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getBuyerLeadById(id: string): Promise<BuyerLead | null> {
  if (isDemoMode) {
    return mockBuyerLeads.find((l) => l.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buyer_leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createBuyerLead(data: Partial<BuyerLead>): Promise<BuyerLead> {
  if (isDemoMode) {
    const mock: BuyerLead = {
      id: crypto.randomUUID(),
      lead_id: `BL-${String(mockBuyerLeads.length + 1).padStart(3, '0')}`,
      name: data.name ?? '',
      phone: data.phone ?? '',
      status: data.status ?? 'New',
      added_at: new Date().toISOString(),
      notes_history: [],
      created_at: new Date().toISOString(),
      ...data,
    }
    return mock
  }

  const supabase = await createClient()
  const { data: seqData, error: seqErr } = await supabase.rpc('nextval', { sequence_name: 'buyer_lead_seq' })
  if (seqErr) {
    const { count } = await supabase.from('buyer_leads').select('*', { count: 'exact', head: true })
    const n = (count ?? 0) + 1
    const lead_id = `BL-${String(n).padStart(3, '0')}`
    const { data: inserted, error } = await supabase
      .from('buyer_leads')
      .insert({ ...data, lead_id })
      .select()
      .single()
    if (error) throw error
    return inserted
  }
  const lead_id = `BL-${String(seqData).padStart(3, '0')}`
  const { data: inserted, error } = await supabase
    .from('buyer_leads')
    .insert({ ...data, lead_id })
    .select()
    .single()
  if (error) throw error
  return inserted
}

export async function updateBuyerLead(id: string, data: Partial<BuyerLead>): Promise<BuyerLead> {
  if (isDemoMode) {
    const existing = mockBuyerLeads.find((l) => l.id === id)
    return { ...existing!, ...data }
  }

  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from('buyer_leads')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function addBuyerLeadNote(
  id: string,
  note: { author: string; text: string }
): Promise<BuyerLead> {
  const newEntry: NoteEntry = {
    timestamp: new Date().toISOString(),
    author: note.author,
    text: note.text,
  }

  if (isDemoMode) {
    const existing = mockBuyerLeads.find((l) => l.id === id)
    return {
      ...existing!,
      notes_history: [...(existing?.notes_history ?? []), newEntry],
    }
  }

  const supabase = await createClient()
  const { data: current, error: fetchErr } = await supabase
    .from('buyer_leads')
    .select('notes_history')
    .eq('id', id)
    .single()
  if (fetchErr) throw fetchErr

  const updatedNotes: NoteEntry[] = [...((current.notes_history as NoteEntry[]) ?? []), newEntry]

  const { data: updated, error } = await supabase
    .from('buyer_leads')
    .update({ notes_history: updatedNotes })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function getLeadStats(): Promise<{
  total_buyer: number
  total_seller: number
  new_today: number
  follow_ups_today: number
}> {
  const today = new Date().toISOString().split('T')[0]

  if (isDemoMode) {
    const newToday = [
      ...mockBuyerLeads.filter((l) => l.created_at.startsWith(today)),
      ...mockSellerLeads.filter((l) => l.created_at.startsWith(today)),
    ].length
    const followUpsToday = [
      ...mockBuyerLeads.filter((l) => l.follow_up_date === today),
      ...mockSellerLeads.filter((l) => l.follow_up_date === today),
    ].length
    return {
      total_buyer: mockBuyerLeads.length,
      total_seller: mockSellerLeads.length,
      new_today: newToday,
      follow_ups_today: followUpsToday,
    }
  }

  const supabase = await createClient()
  const [{ count: buyerCount }, { count: sellerCount }, { count: newBuyer }, { count: newSeller }, { count: fuBuyer }, { count: fuSeller }] =
    await Promise.all([
      supabase.from('buyer_leads').select('*', { count: 'exact', head: true }),
      supabase.from('seller_leads').select('*', { count: 'exact', head: true }),
      supabase.from('buyer_leads').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('seller_leads').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('buyer_leads').select('*', { count: 'exact', head: true }).eq('follow_up_date', today),
      supabase.from('seller_leads').select('*', { count: 'exact', head: true }).eq('follow_up_date', today),
    ])

  return {
    total_buyer: buyerCount ?? 0,
    total_seller: sellerCount ?? 0,
    new_today: (newBuyer ?? 0) + (newSeller ?? 0),
    follow_ups_today: (fuBuyer ?? 0) + (fuSeller ?? 0),
  }
}
