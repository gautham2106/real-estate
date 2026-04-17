'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, logActivity } from '@/lib/dal'

const bookSchema = z.object({
  book_name: z.string().min(1, 'Book name is required'),
  description: z.string().optional(),
  status: z.enum(['Open', 'Active', 'Archived']).default('Open'),
  land_codes: z.string().optional(),
})

export async function createBookAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/books'); redirect('/books') }

  const supabase = await createClient()
  const { count } = await supabase.from('books').select('*', { count: 'exact', head: true })
  const book_id = `BOOK-${String((count ?? 0) + 1).padStart(3, '0')}`

  // Resolve land codes to property IDs
  let property_ids: string[] = []
  if (parsed.data.land_codes) {
    const codes = parsed.data.land_codes.split(',').map(c => c.trim()).filter(Boolean)
    if (codes.length > 0) {
      const { data: props } = await supabase.from('properties').select('id').in('land_code', codes)
      property_ids = (props ?? []).map(p => p.id)
    }
  }

  const { error } = await supabase.from('books').insert({
    book_id,
    book_name: parsed.data.book_name,
    description: parsed.data.description || null,
    status: parsed.data.status,
    property_ids,
    total_properties: property_ids.length,
  })
  if (error) return { error: error.message }
  await logActivity('Book Created', `Created book ${book_id} — ${parsed.data.book_name}`)
  revalidatePath('/books')
  redirect('/books')
}

export async function updateBookAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (isDemoMode) { revalidatePath('/books'); return {} }

  const supabase = await createClient()
  let property_ids: string[] = []
  if (parsed.data.land_codes) {
    const codes = parsed.data.land_codes.split(',').map(c => c.trim()).filter(Boolean)
    if (codes.length > 0) {
      const { data: props } = await supabase.from('properties').select('id').in('land_code', codes)
      property_ids = (props ?? []).map(p => p.id)
    }
  }

  const { error } = await supabase.from('books').update({
    book_name: parsed.data.book_name,
    description: parsed.data.description || null,
    status: parsed.data.status,
    property_ids,
    total_properties: property_ids.length,
  }).eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Book Updated', `Updated book ${id}`)
  revalidatePath('/books')
  revalidatePath(`/books/${id}`)
  return {}
}

export async function deleteBookAction(id: string) {
  if (isDemoMode) { revalidatePath('/books'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) return { error: error.message }
  await logActivity('Book Deleted', `Deleted book ${id}`)
  revalidatePath('/books')
  return {}
}
