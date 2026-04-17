import Link from 'next/link'
import { getSellerLeadById, getSiteVisitsByProperty } from '@/lib/dal'
import { mockBrokers, mockBuyerLeads } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { SiteVisit, NoteEntry } from '@/types'

// ─── helpers ─────────────────────────────────────────────

function getBrokerName(brokerId: string | undefined): string {
  if (!brokerId) return '—'
  return mockBrokers.find(b => b.broker_id === brokerId)?.name ?? brokerId
}

function getBuyerName(buyerId: string | undefined): string {
  if (!buyerId) return 'Unknown Buyer'
  return mockBuyerLeads.find(b => b.id === buyerId)?.name ?? `Lead #${buyerId}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Sub-components ────────────────────────────────────────

function NoteCard({ note }: { note: NoteEntry }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-24 text-right">
        <span className="text-xs text-slate-400">{formatDate(note.timestamp)}</span>
      </div>
      <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 space-y-1 shadow-sm">
        <p className="text-xs font-semibold text-slate-500">{note.author}</p>
        <p className="text-sm text-slate-700">{note.text}</p>
      </div>
    </div>
  )
}

function InquirerRow({ visit }: { visit: SiteVisit }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">{formatDate(visit.visit_date)}</span>
        <span className="font-medium text-slate-800 text-sm">{getBuyerName(visit.buyer_id)}</span>
      </div>
      <div className="flex items-center gap-2">
        {visit.buyer_reaction && <Badge status={visit.buyer_reaction} />}
        {visit.price_discussed && (
          <span className="text-sm text-slate-600 font-medium">{formatCurrency(visit.price_discussed)}</span>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────

export default async function SellerLeadDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const lead = await getSellerLeadById(id)

  if (!lead) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Seller Lead Not Found</h2>
        <p className="text-slate-500">The seller lead with ID &ldquo;{id}&rdquo; does not exist.</p>
        <Link href="/seller-leads" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Seller Leads
        </Link>
      </div>
    )
  }

  const visits = lead.converted_property_id
    ? await getSiteVisitsByProperty(lead.converted_property_id)
    : []

  const addedByBrokerName = getBrokerName(lead.added_by_broker_id)

  return (
    <div className="max-w-screen-xl space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/seller-leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          ← Back to Seller Leads
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {lead.lead_id}
              </span>
              <Badge status={lead.status} />
              {lead.property_type && <Badge status={lead.property_type} />}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{lead.owner_name}</h1>
            <p className="text-sm text-slate-500">{lead.property_location}</p>
          </div>

          <div className="flex items-center gap-2">
            <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              📞 Call
            </a>
            {lead.whatsapp && (
              <a
                href={`https://wa.me/91${lead.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 1. Seller / Owner Info */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Owner &amp; Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Owner Name</p>
            <p className="font-semibold text-slate-700">{lead.owner_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Phone</p>
            <a href={`tel:${lead.phone}`} className="font-semibold text-blue-600 hover:underline">
              {lead.phone}
            </a>
          </div>
          {lead.whatsapp && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">WhatsApp</p>
              <a
                href={`https://wa.me/91${lead.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 hover:underline"
              >
                {lead.whatsapp}
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Property Location</p>
            <p className="font-semibold text-slate-700">{lead.property_location}</p>
          </div>
          {lead.approximate_area && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Approximate Area</p>
              <p className="font-semibold text-slate-700">{lead.approximate_area}</p>
            </div>
          )}
          {lead.asking_price && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Asking Price</p>
              <p className="font-bold text-slate-800 text-lg">{formatCurrency(lead.asking_price)}</p>
            </div>
          )}
          {lead.property_type && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Property Type</p>
              <p className="font-semibold text-slate-700">{lead.property_type}</p>
            </div>
          )}
          {lead.reason_for_selling && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Reason for Selling</p>
              <p className="font-semibold text-slate-700">{lead.reason_for_selling}</p>
            </div>
          )}
          {lead.document_status && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Document Status</p>
              <p className="font-semibold text-slate-700">{lead.document_status}</p>
            </div>
          )}
          {lead.follow_up_date && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Follow-up Date</p>
              <p className="font-semibold text-slate-700">{formatDate(lead.follow_up_date)}</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Attribution */}
      <section className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Lead Attribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Added By</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-slate-800">{addedByBrokerName}</span>
              {lead.added_by_broker_id && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                  {lead.added_by_broker_id}
                </span>
              )}
            </div>
          </div>
          {lead.source && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Source</p>
              <p className="font-semibold text-slate-800">{lead.source}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Added On</p>
            <p className="font-semibold text-slate-800">{formatDate(lead.added_at)}</p>
          </div>
        </div>
      </section>

      {/* 3. Buyers Who Inquired */}
      {lead.converted_property_id && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-700">
            Buyers Who Inquired
            <span className="ml-2 text-xs font-normal text-slate-400">({visits.length})</span>
          </h2>

          {visits.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
              No buyers have visited this property yet
            </div>
          ) : (
            <div className="space-y-2">
              {visits.map(visit => (
                <InquirerRow key={visit.id} visit={visit} />
              ))}
            </div>
          )}
        </section>
      )}

      {!lead.converted_property_id && (
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-2">Buyers Who Inquired</h2>
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
            No linked property — lead has not been converted to a listing yet
          </div>
        </section>
      )}

      {/* 4. Notes History */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">Notes History</h2>

        {!lead.notes_history || lead.notes_history.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
            No notes recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {lead.notes_history.map((note, idx) => (
              <NoteCard key={idx} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
