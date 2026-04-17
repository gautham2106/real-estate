import Link from 'next/link'
import { getUserRole } from '@/lib/auth'
import {
  getPropertyById,
  getSiteVisitsByProperty,
  getDeals,
  getDocumentsByProperty,
} from '@/lib/dal'
import { mockBrokers, mockBuyerLeads } from '@/lib/mock-data'
import { formatCurrency, daysUntil } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { SiteVisit, Deal } from '@/types'

// ─── helpers ─────────────────────────────────────────────

function getBrokerName(brokerId: string | undefined): string {
  if (!brokerId) return '—'
  return mockBrokers.find(b => b.broker_id === brokerId)?.name ?? brokerId
}

function getBuyerName(buyerId: string | undefined): string {
  if (!buyerId) return 'Unknown Buyer'
  return mockBuyerLeads.find(b => b.id === buyerId)?.name ?? `Lead #${buyerId}`
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

function exclusivityBadgeColor(days: number): string {
  if (days > 30) return 'bg-green-100 text-green-800'
  if (days > 7) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Sub-components ────────────────────────────────────────

function VisitCard({ visit }: { visit: SiteVisit }) {
  return (
    <div className="flex gap-4">
      {/* Left: date pill */}
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
          <span className="font-semibold text-slate-800 text-sm">
            {getBuyerName(visit.buyer_id)}
          </span>
          <span className="text-xs text-slate-400">via {getBrokerName(visit.broker_id)}</span>
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

        {visit.internal_note && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-800">
            <span className="font-semibold">Internal note: </span>{visit.internal_note}
          </div>
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

function DealRow({ deal }: { deal: Deal }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400">{deal.deal_id}</span>
        <span className="font-medium text-slate-800 text-sm">
          {getBuyerName(deal.buyer_lead_id)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-700 text-sm">{formatCurrency(deal.deal_value)}</span>
        <Badge status={deal.status} />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────

export default async function PropertyDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const [property, visits, allDeals, docs, role] = await Promise.all([
    getPropertyById(id),
    getSiteVisitsByProperty(id),
    getDeals(),
    getDocumentsByProperty(id),
    getUserRole(),
  ])

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-700">Property Not Found</h2>
        <p className="text-slate-500">The property with ID &ldquo;{id}&rdquo; does not exist.</p>
        <Link href="/properties" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Properties
        </Link>
      </div>
    )
  }

  const isAdmin = role === 'admin'
  const deals = allDeals.filter(d => d.property_id === id)

  const exclusivityDays = property.exclusivity_end ? daysUntil(property.exclusivity_end) : null
  const brokerName = getBrokerName(property.assigned_broker_id)
  const mapsUrl = property.gps_lat && property.gps_lng
    ? `https://maps.google.com/?q=${property.gps_lat},${property.gps_lng}`
    : null

  return (
    <div className="max-w-screen-xl space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          ← Back to Properties
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {property.land_code}
              </span>
              <Badge status={property.type} />
              <Badge status={property.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{property.title}</h1>
            {property.address && (
              <p className="text-sm text-slate-500">{property.address}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                📍 Get Directions
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 1. Key Details grid */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Key Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Price</p>
            <p className="font-bold text-slate-800 text-lg">{formatCurrency(property.price)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Area</p>
            <p className="font-semibold text-slate-700">{property.area} {property.area_unit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">District</p>
            <p className="font-semibold text-slate-700">{property.district ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Village</p>
            <p className="font-semibold text-slate-700">{property.village ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Facing</p>
            <p className="font-semibold text-slate-700">{property.facing ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Road Access</p>
            <p className="font-semibold text-slate-700">{property.road_access ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Water</p>
            <p className="font-semibold text-slate-700">{property.water ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Electricity</p>
            <p className="font-semibold text-slate-700">{property.electricity ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Legal Status</p>
            <p className="font-semibold text-slate-700">{property.legal_status ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">DTCP</p>
            <p className="font-semibold text-slate-700">{property.dtcp_approved ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Survey No.</p>
            <p className="font-semibold text-slate-700">{property.survey_number ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Patta No.</p>
            <p className="font-semibold text-slate-700">{property.patta_number ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Assigned Broker</p>
            <p className="font-semibold text-slate-700">{brokerName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Documents</p>
            <p className="font-semibold text-slate-700">{docs.length} file{docs.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Exclusivity period */}
          {property.exclusivity_end && (
            <div className="col-span-2">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Exclusivity Period</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-semibold text-slate-700 text-sm">
                  {property.exclusivity_start ? formatDate(property.exclusivity_start) : '—'} → {formatDate(property.exclusivity_end)}
                </p>
                {exclusivityDays !== null && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${exclusivityBadgeColor(exclusivityDays)}`}>
                    {exclusivityDays > 0 ? `${exclusivityDays}d remaining` : 'Expired'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Owner Info — admin only */}
      {isAdmin && (
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-slate-700">Owner Information</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Admin Only
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Owner Name</p>
              <p className="font-semibold text-slate-700">{property.owner_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Phone</p>
              {property.owner_phone ? (
                <a href={`tel:${property.owner_phone}`} className="font-semibold text-blue-600 hover:underline">
                  {property.owner_phone}
                </a>
              ) : <p className="font-semibold text-slate-700">—</p>}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">WhatsApp</p>
              {property.owner_whatsapp ? (
                <a
                  href={`https://wa.me/91${property.owner_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-600 hover:underline"
                >
                  {property.owner_whatsapp}
                </a>
              ) : <p className="font-semibold text-slate-700">—</p>}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Aadhaar</p>
              <p className="font-semibold text-slate-700">{property.owner_aadhaar ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">PAN</p>
              <p className="font-semibold text-slate-700">{property.owner_pan ?? '—'}</p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Visit History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">
            Visit History
            <span className="ml-2 text-xs font-normal text-slate-400">({visits.length} visit{visits.length !== 1 ? 's' : ''})</span>
          </h2>
        </div>

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

      {/* 4. Active Deals */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Active Deals
          <span className="ml-2 text-xs font-normal text-slate-400">({deals.length})</span>
        </h2>

        {deals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
            No deals linked to this property
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
