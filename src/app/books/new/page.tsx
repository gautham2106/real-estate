'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Save } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import type { BookStatus } from '@/types'

export default function NewBookPage() {
  const [bookName, setBookName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<BookStatus>('Open')
  const [landCodes, setLandCodes] = useState('')
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!bookName.trim()) errs.bookName = 'Book name is required'
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Create New Book"
        subtitle="Group properties into a portfolio or deal book"
        action={
          <Link
            href="/books"
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Books
          </Link>
        }
      />

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-800 text-sm">
          <BookOpen size={16} className="shrink-0" />
          Book created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Book Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Book Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="e.g. Rasipuram Plots Q2 2026"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.bookName ? 'border-red-400 bg-red-50' : 'border-slate-200'
            }`}
          />
          {errors.bookName && <p className="text-xs text-red-600 mt-1">{errors.bookName}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of this book..."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Open">Open</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Open = draft / in progress. Active = live / shared. Archived = closed.
          </p>
        </div>

        {/* Properties to Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Link Properties</label>
          <input
            type="text"
            value={landCodes}
            onChange={(e) => setLandCodes(e.target.value)}
            placeholder="Enter land codes separated by commas, e.g. BLU-2026-001, BLU-2026-002"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Enter comma-separated land codes. Properties can also be linked from the property detail page.
          </p>
          {landCodes && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {landCodes.split(',').map((code) => code.trim()).filter(Boolean).map((code) => (
                <span key={code} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono">
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Save size={15} />
            Create Book
          </button>
          <Link
            href="/books"
            className="px-4 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
