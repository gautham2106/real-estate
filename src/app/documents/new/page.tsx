'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, FileText } from 'lucide-react'
import { mockProperties } from '@/lib/mock-data'

export default function NewDocumentPage() {
  const [form, setForm] = useState({
    property_id: '', folder: '', document_name: '', status: 'Pending',
    issue_notes: '', uploaded_by: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    if (file) formData.set('file', file)
    const { uploadDocumentAction } = await import('@/app/actions/documents')
    const result = await uploadDocumentAction(formData)
    if (result?.error) {
      setServerError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-screen-sm">
      <div className="flex items-center gap-3">
        <Link href="/documents" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
          <p className="text-sm text-slate-500">Add a document to a property folder</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Property *</label>
          <select required name="property_id" value={form.property_id} onChange={e => set('property_id', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select property...</option>
            {mockProperties.map(p => (
              <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Folder *</label>
          <select required name="folder" value={form.folder} onChange={e => set('folder', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select folder...</option>
            {['Legal', 'Survey', 'Photos', 'Owner Docs', 'Agreements'].map(f => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Document Name *</label>
          <input required type="text" name="document_name" value={form.document_name} onChange={e => set('document_name', e.target.value)}
            placeholder="e.g. Sale Deed, Patta, Aadhaar Copy..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">File Upload</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <FileText size={20} />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select name="status" value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {['Pending', 'Received', 'Verified', 'Issue', 'Original Submitted'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {form.status === 'Issue' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Issue Notes</label>
            <textarea rows={3} name="issue_notes" value={form.issue_notes} onChange={e => set('issue_notes', e.target.value)}
              placeholder="Describe the issue with this document..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Uploaded By</label>
          <input type="text" name="uploaded_by" value={form.uploaded_by} onChange={e => set('uploaded_by', e.target.value)}
            placeholder="Your name or broker name"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            <Save size={15} />
            {submitting ? 'Uploading...' : 'Upload Document'}
          </button>
          <Link href="/documents"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
