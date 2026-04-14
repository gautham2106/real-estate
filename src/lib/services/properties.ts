import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { mockProperties } from '@/lib/mock-data'
import type { Property } from '@/types'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export async function getProperties(filters?: {
  status?: string
  type?: string
  district?: string
}): Promise<Property[]> {
  if (isDemoMode) {
    let results = mockProperties
    if (filters?.status) results = results.filter((p) => p.status === filters.status)
    if (filters?.type) results = results.filter((p) => p.type === filters.type)
    if (filters?.district) results = results.filter((p) => p.district === filters.district)
    return results
  }

  const supabase = await createClient()
  let query = supabase.from('properties').select('*').order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.district) query = query.eq('district', filters.district)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getPropertyByLandCode(landCode: string): Promise<Property | null> {
  if (isDemoMode) {
    return mockProperties.find((p) => p.land_code === landCode) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('land_code', landCode)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isDemoMode) {
    return mockProperties.find((p) => p.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createProperty(data: Partial<Property>): Promise<Property> {
  if (isDemoMode) {
    const mock: Property = {
      id: crypto.randomUUID(),
      land_code: `BLU-${new Date().getFullYear()}-${String(mockProperties.length + 1).padStart(3, '0')}`,
      title: data.title ?? '',
      type: data.type ?? 'Plot',
      classification: data.classification ?? 'Residential',
      area: data.area ?? 0,
      area_unit: data.area_unit ?? 'Sqft',
      price: data.price ?? 0,
      status: data.status ?? 'Available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    }
    return mock
  }

  const supabase = await createClient()
  // Use DB function to generate land_code
  const { data: landCodeRow, error: seqErr } = await supabase.rpc('generate_land_code')
  if (seqErr) throw seqErr

  const insertData = {
    ...data,
    land_code: landCodeRow as string,
  }
  // Remove generated/computed columns
  delete (insertData as Record<string, unknown>).price_per_sqft
  delete (insertData as Record<string, unknown>).id

  const { data: inserted, error } = await supabase
    .from('properties')
    .insert(insertData)
    .select()
    .single()
  if (error) throw error
  return inserted
}

export async function updateProperty(id: string, data: Partial<Property>): Promise<Property> {
  if (isDemoMode) {
    const existing = mockProperties.find((p) => p.id === id)
    return { ...existing!, ...data, updated_at: new Date().toISOString() }
  }

  const supabase = await createClient()
  const updateData = { ...data }
  delete (updateData as Record<string, unknown>).price_per_sqft
  delete (updateData as Record<string, unknown>).id

  const { data: updated, error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function updatePropertyStatus(id: string, status: string): Promise<Property> {
  if (isDemoMode) {
    const existing = mockProperties.find((p) => p.id === id)
    return { ...existing!, status: status as Property['status'], updated_at: new Date().toISOString() }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getExpiringExclusivity(days: number): Promise<Property[]> {
  if (isDemoMode) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + days)
    return mockProperties.filter((p) => {
      if (!p.exclusivity_end) return false
      const end = new Date(p.exclusivity_end)
      return end <= cutoff && end >= new Date()
    })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const future = new Date()
  future.setDate(future.getDate() + days)
  const futureStr = future.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .gte('exclusivity_end', today)
    .lte('exclusivity_end', futureStr)
    .order('exclusivity_end', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getPropertyStats(): Promise<{
  total: number
  available: number
  negotiating: number
  sold: number
}> {
  if (isDemoMode) {
    return {
      total: mockProperties.length,
      available: mockProperties.filter((p) => p.status === 'Available').length,
      negotiating: mockProperties.filter((p) => p.status === 'Negotiating').length,
      sold: mockProperties.filter((p) => p.status === 'Sold').length,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('properties').select('status')
  if (error) throw error
  const rows = data ?? []
  return {
    total: rows.length,
    available: rows.filter((r) => r.status === 'Available').length,
    negotiating: rows.filter((r) => r.status === 'Negotiating').length,
    sold: rows.filter((r) => r.status === 'Sold').length,
  }
}
