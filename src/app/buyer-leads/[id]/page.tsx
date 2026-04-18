import Link from 'next/link'
import { getBuyerLeadById, getSiteVisitsByBuyer, getDeals, getProperties } from '@/lib/dal'
import { getUserRole } from '@/lib/auth'
import { mockBrokers, mockProperties } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { deleteBuyerLeadAction } from '@/app/actions/leads'
import QuickNoteForm from '@/components/leads/QuickNoteForm'
import type { SiteVisit, Deal, NoteEntry, Property } from '@/types'

// ─── helpers ─────────────────────────────────────────────

function getBrokerName(brokerId: string | undefined): string {
  if (!brokerId) return '—'
  return mockBrokers.find(b => b.broker_id === brokerId)?.name ?? brokerId
}

function getPropertyInfo(propertyId: string): { land_code: string; title: string } {
  const prop = mockProperties.find(p => p.id === propertyId)
  return prop
    ? { land_code: prop.land_code, title: prop.title }
    : { land_code: `#${propertyId}`, title: 'Unknown Property' }
}

function reactionColor(reaction: string): string {
  const map: Record<string, string> = {
    'Interested': 'bg-green-100 text-green-800',
    'Negotiating': 'bg-orange-100 text-orange-800',
    'Need Time': 'bg-yellow-100 text-yellow-800',
    'Not Interested': 'bg-red-100 text-red-800',
  }
  return map[reaction] ?? 'bg-gray-100 text-gray-700'
}

function urgencyColor(urgency: string): string {
  const map: Record<string, string> = {
    'Immediate': 'bg-red-100 text-red-800',
    '3 months': 'bg-orange-100 text-orange-800',
    '6 months': 'bg-yellow-100 text-yellow-800',
  }
  return map[urgency] ?? 'bg-gray-100 text-gray-700'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Sub-components ────────────────────────────────────────

function VisitCard({ visit }: { visit: SiteVisit }) {
  const prop = getPropertyInfo(visit.property_id)
  return (
    <div className="flex gap-4">
      {/* Left: date */}
      <div className="flex-shrink-0 w-24 text-right">
        <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 rounded-lg px-2 py-1 leading-tight">
          {formatDate(visit.visit_date)}
          {visit.visit_time && (
            <span className="block text-slate-400">{visit.visit_time}</span>
          )}
        </span>
      </div>

      {/* Center: details */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/properties/${visit.property_id}`}
            className="font-semibold text-blue-700 hover:underline text-sm"
          >
            {prop.land_code} — {prop.title}
          </Link>
          {visit.buyer_reaction && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${reactionColor(visit.buyer_reaction)}`}>
              {visit.buyer_reaction}
            </span>
          )}
        </div>

        {visit.price_discussed && (
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">Price discussed:</span>{' '}
            {formatCurrency(visit.price_discussed)}
          </p>
        )}

        {visit.objections && (
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">Objections:</span>{' '}
            {visit.objections}
          </p>
        )}

        {visit.buyer_remarks && (
          <blockquote className="border-l-4 border-blue-300 pl-3 text-sm text-slate-600 italic bg-blue-50 rounded-r-lg py-1.5 pr-2">
            {visit.buyer_remarks}
          </blockquote>
        )}

        {visit.next_action && (
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-600">Next:</span>{' '}
            {visit.next_action}
            {visit.next_action_date && ` — by ${formatDate(visit.next_action_date)}`}
          </p>
        )}
      </div>
    </div>
  )
}

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

function DealRow({ deal }: { deal: Deal }) {
  const prop = getPropertyInfo(deal.property_id)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400">{deal.deal_id}</span>
        <span className="font-medium text-slate-800 text-sm">{prop.land_code} — {prop.title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-700 text-sm">{formatCurrency(deal.deal_value)}</span>
        <Badge status={deal.status} />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────

export default async function BuyerLeadDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const [lead, visits, allDeals, allProperties, role] = await Promise.all([
    getBuyerLeadById(id),
    getSiteVisitsByBuyer(id),
    getDeals(),
    getProperties({ status: 'Available' }),
    getUserRole(),
  ])

  if (!lead) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Buyer Lead Not Found</h2>
        <p className="text-slate-500">The buyer lead with ID &ldquo;{id}&rdquo; does not exist.</p>
        <Link href="/buyer-leads" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Buyer Leads
        </Link>
      </div>
    )
  }

  const deals = allDeals.filter(d => d.buyer_lead_id === id)
  const addedByBrokerName = getBrokerName(lead.added_by_broker_id)
  const isAdmin = role === 'admin'

  // Property matching logic
  const hasFilters = lead.budget_max || lead.property_type_needed
  const matchedProperties: Property[] = hasFilters
    ? allProperties
        .filter(p => {
          const budgetOk = lead.budget_max ? p.price <= lead.budget_max : true
          const typeOk = lead.property_type_needed ? p.type === lead.property_type_needed : true
          return budgetOk && typeOk
        })
        .sort((a, b) => a.price - b.price)
        .slice(0, 5)
    : allProperties
        .sort((a, b) => a.price - b.price)
        .slice(0, 5)

  return (
    <div className="max-w-screen-xl space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/buyer-leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          ← Back to Buyer Leads
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {lead.lead_id}
              </span>
              <Badge status={lead.status} />
              {lead.urgency && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${urgencyColor(lead.urgency)}`}>
                  {lead.urgency}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{lead.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                📞 Call
              </a>
            )}
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
            <Link
              href={`/deals/new?buyer_id=${id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + Create Deal
            </Link>
            <Link
              href={`/buyer-leads/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Edit
            </Link>
            {isAdmin && (
              <DeleteButton
                onDelete={deleteBuyerLeadAction.bind(null, id)}
                redirectTo="/buyer-leads"
              />
            )}
          </div>
        </div>
      </div>

      {/* 1. Buyer Info */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Buyer Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          {lead.email && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Email</p>
              <p className="font-semibold text-slate-700">{lead.email}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Budget Range</p>
            <p className="font-semibold text-slate-700">
              {lead.budget_min && lead.budget_max
                ? `${formatCurrency(lead.budget_min)} – ${formatCurrency(lead.budget_max)}`
                : lead.budget_max ? `Up to ${formatCurrency(lead.budget_max)}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Preferred Location</p>
            <p className="font-semibold text-slate-700">{lead.preferred_location ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Property Type</p>
            <p className="font-semibold text-slate-700">{lead.property_type_needed ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Area Required</p>
            <p className="font-semibold text-slate-700">{lead.area_required ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Purpose</p>
            <p className="font-semibold text-slate-700">{lead.purpose ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Loan Required</p>
            <p className="font-semibold text-slate-700">
              {lead.loan_required ? `Yes — ${lead.loan_amount ? formatCurrency(lead.loan_amount) : ''}` : 'No'}
            </p>
          </div>
          {lead.follow_up_date && (
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Follow-up Date</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  lead.follow_up_date <= new Date().toISOString().split('T')[0]
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  🗓 {formatDate(lead.follow_up_date)}
                </span>
                {lead.follow_up_date <= new Date().toISOString().split('T')[0] && (
                  <span className="text-xs text-red-500 font-medium">Due!</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Attribution Card */}
      <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Lead Attribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Source</p>
            <p className="font-semibold text-slate-800">{lead.source ?? '—'}</p>
          </div>
          {lead.referred_by_name && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Referred By</p>
              <p className="font-semibold text-slate-800">{lead.referred_by_name}</p>
              {lead.referred_by_phone && (
                <a href={`tel:${lead.referred_by_phone}`} className="text-xs text-blue-600 hover:underline">
                  {lead.referred_by_phone}
                </a>
              )}
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Added On</p>
            <p className="font-semibold text-slate-800">{formatDate(lead.added_at)}</p>
          </div>
        </div>
      </section>

      {/* 3. Matched Properties */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Matched Properties
          <span className="ml-2 text-xs font-normal text-slate-400">
            ({matchedProperties.length} match{matchedProperties.length !== 1 ? 'es' : ''})
          </span>
        </h2>

        {matchedProperties.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
            No available properties match this buyer&apos;s requirements
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchedProperties.map(prop => {
              const waText = encodeURIComponent(
                `Hi, I have a property that might interest you!\n${prop.land_code} — ${prop.title}\nArea: ${prop.area} ${prop.area_unit}\nPrice: ${formatCurrency(prop.price)}\nType: ${prop.type}\nStatus: ${prop.status}`
              )
              return (
                <div key={prop.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-400">{prop.land_code}</span>
                    <Badge status={prop.status} />
                  </div>
                  <Link
                    href={`/properties/${prop.id}`}
                    className="block font-semibold text-blue-700 hover:underline text-sm leading-snug"
                  >
                    {prop.title}
                  </Link>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>{prop.area} {prop.area_unit} · {prop.type}</p>
                    <p className="font-semibold text-slate-800 text-sm">{formatCurrency(prop.price)}</p>
                  </div>
                  <a
                    href={`https://wa.me/91${lead.whatsapp ?? lead.phone}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Share via WhatsApp
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 4. Properties Visited */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Properties Visited
          <span className="ml-2 text-xs font-normal text-slate-400">({visits.length} visit{visits.length !== 1 ? 's' : ''})</span>
        </h2>

        {visits.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
            No site visits recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map(visit => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Notes History */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">Notes History</h2>
        <QuickNoteForm leadId={lead.id} leadType="buyer" leadName={lead.name} />

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

      {/* 5. Active / Past Deals */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Deals
          <span className="ml-2 text-xs font-normal text-slate-400">({deals.length})</span>
        </h2>

        {deals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
            No deals linked to this buyer
          </div>
        ) : (
          <div className="space-y-2">
            {deals.map(deal => (
              <DealRow key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
