'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FolderOpen, PlusCircle, CheckCircle, AlertCircle, Clock, Eye, Upload } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { mockProperties } from '@/lib/mock-data'

type Folder = 'All' | 'Legal' | 'Survey' | 'Photos' | 'Owner Docs' | 'Agreements'
type DocStatus = 'Pending' | 'Received' | 'Verified' | 'Issue' | 'Original Submitted'

interface DocRecord {
  id: string; document_id: string; property_id: string; folder: Folder
  document_name: string; status: DocStatus; upload_date: string
  uploaded_by?: string; verified_by?: string; verified_date?: string
}

const mockDocs: DocRecord[] = [
  { id: '1', document_id: 'DOC-001', property_id: '1', folder: 'Legal', document_name: 'Sale Deed', status: 'Verified', upload_date: '2026-01-10', uploaded_by: 'Admin', verified_by: 'Lawyer Kumar', verified_date: '2026-01-12' },
  { id: '2', document_id: 'DOC-002', property_id: '1', folder: 'Legal', document_name: 'Encumbrance Certificate', status: 'Received', upload_date: '2026-01-10', uploaded_by: 'Admin' },
  { id: '3', document_id: 'DOC-003', property_id: '1', folder: 'Legal', document_name: 'Patta', status: 'Verified', upload_date: '2026-01-10', uploaded_by: 'Admin', verified_by: 'Lawyer Kumar', verified_date: '2026-01-12' },
  { id: '4', document_id: 'DOC-004', property_id: '1', folder: 'Survey', document_name: 'FMB Sketch', status: 'Pending', upload_date: '2026-01-15' },
  { id: '5', document_id: 'DOC-005', property_id: '1', folder: 'Photos', document_name: 'Site Photo 1', status: 'Received', upload_date: '2026-01-08', uploaded_by: 'Arjun Kumar' },
  { id: '6', document_id: 'DOC-006', property_id: '1', folder: 'Photos', document_name: 'Drone View', status: 'Pending', upload_date: '2026-01-08' },
  { id: '7', document_id: 'DOC-007', property_id: '1', folder: 'Owner Docs', document_name: 'Aadhaar Copy', status: 'Verified', upload_date: '2026-01-06', uploaded_by: 'Admin', verified_by: 'Admin', verified_date: '2026-01-07' },
  { id: '8', document_id: 'DOC-008', property_id: '1', folder: 'Owner Docs', document_name: 'PAN Card', status: 'Issue', upload_date: '2026-01-06', uploaded_by: 'Admin' },
  { id: '9', document_id: 'DOC-009', property_id: '1', folder: 'Agreements', document_name: 'Exclusivity Agreement', status: 'Original Submitted', upload_date: '2026-01-01', uploaded_by: 'Admin', verified_by: 'Admin', verified_date: '2026-01-01' },
]

const statusConfig: Record<DocStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  'Pending': { icon: <Clock size={14} />, color: 'text-gray-600', bg: 'bg-gray-100' },
  'Received': { icon: <Upload size={14} />, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Verified': { icon: <CheckCircle size={14} />, color: 'text-green-600', bg: 'bg-green-100' },
  'Issue': { icon: <AlertCircle size={14} />, color: 'text-red-600', bg: 'bg-red-100' },
  'Original Submitted': { icon: <CheckCircle size={14} />, color: 'text-purple-700', bg: 'bg-purple-100' },
}

const FOLDERS: Folder[] = ['All', 'Legal', 'Survey', 'Photos', 'Owner Docs', 'Agreements']

export default function DocumentsPage() {
  const [selectedProperty, setSelectedProperty] = useState('1')
  const [activeFolder, setActiveFolder] = useState<Folder>('All')

  const docs = mockDocs.filter(d =>
    d.property_id === selectedProperty &&
    (activeFolder === 'All' || d.folder === activeFolder)
  )

  const verified = mockDocs.filter(d => d.property_id === selectedProperty && d.status === 'Verified').length
  const pending = mockDocs.filter(d => d.property_id === selectedProperty && d.status === 'Pending').length
  const issues = mockDocs.filter(d => d.property_id === selectedProperty && d.status === 'Issue').length

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Document Storage"
        subtitle="Organized by property and folder"
        action={
          <Link
            href="/documents/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            + Upload Document
          </Link>
        }
      />

      {/* Property selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Property:</label>
        <select
          value={selectedProperty}
          onChange={e => setSelectedProperty(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {mockProperties.map(p => (
            <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div><p className="text-xs text-green-700">Verified</p><p className="text-xl font-bold text-green-800">{verified}</p></div>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <Clock size={20} className="text-gray-500" />
          <div><p className="text-xs text-gray-600">Pending</p><p className="text-xl font-bold text-gray-700">{pending}</p></div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div><p className="text-xs text-red-600">Issues</p><p className="text-xl font-bold text-red-700">{issues}</p></div>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FOLDERS.map(folder => {
          const count = folder === 'All' ? mockDocs.filter(d => d.property_id === selectedProperty).length
            : mockDocs.filter(d => d.property_id === selectedProperty && d.folder === folder).length
          return (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFolder === folder ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FolderOpen size={13} />
              {folder}
              <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(doc => {
          const cfg = statusConfig[doc.status]
          return (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{doc.document_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{doc.document_id}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} shrink-0`}>
                  {cfg.icon}
                  {doc.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Folder:</span>
                  <span className="font-medium text-slate-700">{doc.folder}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span>{doc.upload_date} {doc.uploaded_by ? `by ${doc.uploaded_by}` : ''}</span>
                </div>
                {doc.verified_by && (
                  <div className="flex justify-between">
                    <span>Verified:</span>
                    <span>{doc.verified_by}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <Eye size={12} /> View
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Update Status
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty placeholders for missing docs */}
        {activeFolder !== 'All' && docs.length === 0 && (
          <div className="col-span-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
            <Upload size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No documents in {activeFolder}</p>
            <Link href="/documents/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              + Upload first document
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
