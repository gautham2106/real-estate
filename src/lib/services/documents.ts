import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Document, DocumentFolder, DocumentStatus } from '@/types'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

// Required documents per folder (checklist template)
const REQUIRED_DOCS: Record<DocumentFolder, string[]> = {
  Legal: ['Title Deed', 'EC (Encumbrance Certificate)', 'Patta', 'Chitta'],
  Survey: ['FMB Sketch', 'Survey Map'],
  Photos: ['Front View', 'Aerial View', 'Interior Photos'],
  'Owner Docs': ['Owner Aadhaar', 'Owner PAN', 'Owner Photo'],
  Agreements: ['Exclusivity Agreement', 'MOU', 'Sale Agreement'],
}

// In-memory mock store for demo mode
const mockDocuments: Document[] = []

export async function getDocumentsByProperty(
  propertyId: string,
  folder?: string
): Promise<Document[]> {
  if (isDemoMode) {
    let results = mockDocuments.filter((d) => d.property_id === propertyId)
    if (folder) results = results.filter((d) => d.folder === folder)
    return results
  }

  const supabase = await createClient()
  let query = supabase
    .from('documents')
    .select('*')
    .eq('property_id', propertyId)
    .order('upload_date', { ascending: false })
  if (folder) query = query.eq('folder', folder)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createDocument(data: Partial<Document>): Promise<Document> {
  if (isDemoMode) {
    const mock: Document = {
      id: crypto.randomUUID(),
      document_id: `DOC-${String(mockDocuments.length + 1).padStart(3, '0')}`,
      property_id: data.property_id ?? '',
      folder: data.folder ?? 'Legal',
      document_name: data.document_name ?? '',
      status: data.status ?? 'Pending',
      upload_date: new Date().toISOString(),
      ...data,
    }
    mockDocuments.push(mock)
    return mock
  }

  const supabase = await createClient()
  const { data: seqData, error: seqErr } = await supabase.rpc('nextval', {
    sequence_name: 'document_seq',
  })
  let document_id: string
  if (seqErr) {
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
    document_id = `DOC-${String((count ?? 0) + 1).padStart(3, '0')}`
  } else {
    document_id = `DOC-${String(seqData).padStart(3, '0')}`
  }

  const insertData = { ...data, document_id }
  delete (insertData as Record<string, unknown>).id

  const { data: inserted, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select()
    .single()
  if (error) throw error
  return inserted
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  verifiedBy?: string
): Promise<Document> {
  if (isDemoMode) {
    const idx = mockDocuments.findIndex((d) => d.id === id)
    if (idx !== -1) {
      mockDocuments[idx] = {
        ...mockDocuments[idx],
        status,
        verified_by: verifiedBy,
        verified_date: status === 'Verified' ? new Date().toISOString() : mockDocuments[idx].verified_date,
      }
      return mockDocuments[idx]
    }
    // Return a minimal stub so callers don't crash
    return { id, status } as Document
  }

  const supabase = await createClient()
  const updateData: Partial<Document> = { status }
  if (verifiedBy) {
    updateData.verified_by = verifiedBy
    updateData.verified_date = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export interface DocumentChecklistItem {
  folder: DocumentFolder
  document_name: string
  status: DocumentStatus | 'Missing'
  document_id?: string
}

export async function getDocumentChecklist(
  propertyId: string
): Promise<DocumentChecklistItem[]> {
  const existing = await getDocumentsByProperty(propertyId)
  const existingMap = new Map(
    existing.map((d) => [`${d.folder}::${d.document_name}`, d])
  )

  const checklist: DocumentChecklistItem[] = []
  for (const [folder, docs] of Object.entries(REQUIRED_DOCS) as [DocumentFolder, string[]][]) {
    for (const docName of docs) {
      const key = `${folder}::${docName}`
      const found = existingMap.get(key)
      checklist.push({
        folder,
        document_name: docName,
        status: found ? found.status : 'Missing',
        document_id: found?.document_id,
      })
    }
  }
  return checklist
}

export async function uploadDocumentFile(
  propertyId: string,
  folder: string,
  fileName: string,
  file: File
): Promise<string> {
  if (isDemoMode) {
    // In demo mode return a placeholder URL
    return `https://demo.storage/${propertyId}/${folder}/${fileName}`
  }

  // Fetch the property to get its land_code for the storage path
  const supabase = await createClient()
  const { data: property, error: propErr } = await supabase
    .from('properties')
    .select('land_code')
    .eq('id', propertyId)
    .single()
  if (propErr) throw propErr

  const storagePath = `${property.land_code}/${folder}/${fileName}`

  const { error: uploadErr } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { upsert: true })
  if (uploadErr) throw uploadErr

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}
