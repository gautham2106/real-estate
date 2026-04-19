'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/dal'

const documentSchema = z.object({
  property_id: z.string().min(1),
  folder: z.string().min(1),
  document_name: z.string().min(1),
  status: z.enum(['Pending', 'Received', 'Verified', 'Issue', 'Original Submitted']).default('Pending'),
  issue_notes: z.string().optional(),
  uploaded_by: z.string().optional(),
})

export async function uploadDocumentAction(formData: FormData) {
  if (isDemoMode) { revalidatePath('/documents'); redirect('/documents') }

  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => typeof v === 'string')
  )
  const parsed = documentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const file = formData.get('file') as File | null

  let file_url: string | null = null
  let file_size: number | null = null

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${parsed.data.property_id}/${parsed.data.folder}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('property-documents')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) return { error: `Upload failed: ${uploadError.message}` }

    const { data: urlData } = supabase.storage
      .from('property-documents')
      .getPublicUrl(path)
    file_url = urlData.publicUrl
    file_size = file.size
  }

  const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true })
  const document_id = `DOC-${String((count ?? 0) + 1).padStart(3, '0')}`

  const { error } = await supabase.from('documents').insert({
    document_id,
    property_id: parsed.data.property_id,
    folder: parsed.data.folder,
    document_name: parsed.data.document_name,
    status: parsed.data.status,
    issue_notes: parsed.data.issue_notes ?? null,
    uploaded_by: parsed.data.uploaded_by ?? null,
    file_url,
    file_size,
    uploaded_at: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  revalidatePath('/documents')
  redirect('/documents')
}

export async function deleteDocumentAction(id: string) {
  if (isDemoMode) { revalidatePath('/documents'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/documents')
  return {}
}

export async function updateDocumentStatusAction(id: string, status: string) {
  if (isDemoMode) { revalidatePath('/documents'); return {} }
  const supabase = await createClient()
  const { error } = await supabase.from('documents').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/documents')
  revalidatePath(`/documents/${id}`)
  return {}
}
