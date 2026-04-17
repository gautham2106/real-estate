'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Book, Property } from '@/types'
import { updateBookAction } from '@/app/actions/books'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full'

interface Props {
  book: Book
  allProperties: Property[]
}

export default function EditBookForm({ book, allProperties }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Build initial land codes from linked property IDs
  const linkedCodes = allProperties
    .filter(p => book.property_ids?.includes(p.id))
    .map(p => p.land_code)
    .join(', ')

  const [landCodes, setLandCodes] = useState(linkedCodes)
  const previewCodes = landCodes.split(',').map(c => c.trim()).filter(Boolean)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('land_codes', landCodes)
    const result = await updateBookAction(book.id, fd)
    setSaving(false)
    if (result?.error) { setError(result.error); return }
    router.push(`/books/${book.id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/books/${book.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Book
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Edit Book — {book.book_name}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Book Name <span className="text-red-500">*</span></label>
          <input name="book_name" className={inputCls} defaultValue={book.book_name} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea name="description" className={inputCls} rows={3} defaultValue={book.description ?? ''} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select name="status" className={inputCls} defaultValue={book.status}>
            <option value="Open">Open</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Linked Properties (land codes)</label>
          <input
            className={inputCls}
            value={landCodes}
            onChange={e => setLandCodes(e.target.value)}
            placeholder="BLU-2026-001, BLU-2026-002"
          />
          {previewCodes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {previewCodes.map(code => (
                <span key={code} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono">{code}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href={`/books/${book.id}`} className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
