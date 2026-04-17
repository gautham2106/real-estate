import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { getDocumentById, getPropertyById } from '@/lib/dal'
import { deleteDocumentAction } from '@/app/actions/documents'

const STATUS_COLORS: Record<string, string> = {
  Verified: 'text-green-700 bg-green-50 border-green-200',
  Received: 'text-blue-700 bg-blue-50 border-blue-200',
  Pending: 'text-amber-700 bg-amber-50 border-amber-200',
  Issue: 'text-red-700 bg-red-50 border-red-200',
  'Original Submitted': 'text-purple-700 bg-purple-50 border-purple-200',
}

export default async function DocumentDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const doc = await getDocumentById(id)
  if (!doc) notFound()

  const property = await getPropertyById(doc.property_id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Documents
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText size={22} className="text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{doc.document_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-blue-600">{doc.document_id}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{doc.folder}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <DeleteButton onDelete={deleteDocumentAction.bind(null, id)} redirectTo="/documents" label="Delete" />
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${STATUS_COLORS[doc.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
        Status: <strong>{doc.status}</strong>
      </div>

      {doc.status === 'Issue' && doc.issue_notes && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Issue Details</p>
          <p className="text-sm text-red-600">{doc.issue_notes}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-sm text-slate-700">Details</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {property && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Property</p>
              <Link href={`/properties/${property.id}`} className="font-medium text-blue-700 hover:underline">
                {property.land_code} — {property.title}
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Folder</p>
            <p className="font-medium text-slate-700">{doc.folder}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Upload Date</p>
            <p className="font-medium text-slate-700">{doc.upload_date}</p>
          </div>
          {doc.uploaded_by && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Uploaded By</p>
              <p className="font-medium text-slate-700">{doc.uploaded_by}</p>
            </div>
          )}
          {doc.verified_by && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Verified By</p>
              <p className="font-medium text-green-700">{doc.verified_by}</p>
            </div>
          )}
          {doc.file_size && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">File Size</p>
              <p className="font-medium text-slate-700">{(doc.file_size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
      </div>

      {doc.file_url ? (
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors w-fit"
        >
          <ExternalLink size={15} />
          View / Download File
        </a>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-sm">
          No file uploaded yet
        </div>
      )}
    </div>
  )
}
