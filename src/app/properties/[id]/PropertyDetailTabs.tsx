'use client'

import { useState, Fragment } from 'react'
import { formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import PropertyLocationSection from '@/components/properties/PropertyLocationSection'
import ShapePreview from '@/components/ui/ShapePreview'
import type { Property, SiteVisit, Deal, PropertyDocument } from '@/types'
import { mockBrokers, mockBuyerLeads } from '@/lib/mock-data'

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

function VisitCard({ visit, isAdmin }: { visit: SiteVisit; isAdmin: boolean }) {
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

        {isAdmin && visit.internal_note && (
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

// ─── Props ────────────────────────────────────────────────

interface PropertyDetailTabsProps {
  property: Property
  visits: SiteVisit[]
  deals: Deal[]
  docs: PropertyDocument[]
  role: 'admin' | 'broker' | null
  isAdmin: boolean
  brokerName: string
  exclusivityDays: number | null
}

// ─── Tab Definitions ──────────────────────────────────────

type TabName = 'Overview' | 'Photos & Video' | 'Visits' | 'Deals' | 'Documents' | 'Owner Info'

export default function PropertyDetailTabs({
  property,
  visits,
  deals,
  docs,
  role,
  isAdmin,
  exclusivityDays,
}: PropertyDetailTabsProps) {
  const tabs: TabName[] = [
    'Overview',
    'Photos & Video',
    'Visits',
    'Deals',
    'Documents',
    ...(isAdmin ? ['Owner Info' as TabName] : []),
  ]

  const [activeTab, setActiveTab] = useState<TabName>('Overview')

  function getBadgeCount(tab: TabName): number | null {
    if (tab === 'Visits') return visits.length
    if (tab === 'Deals') return deals.length
    if (tab === 'Documents') return docs.length
    return null
  }

  const hasShape = !!(property.side_a && property.side_b && property.side_c && property.side_d)

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max pb-1">
          {tabs.map((tab) => {
            const count = getBadgeCount(tab)
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
                {count !== null && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* 1. Hero photo */}
            {property.photo_urls && property.photo_urls.length > 0 ? (
              <div className="w-full h-[280px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={property.photo_urls[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-[280px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
                </svg>
                <p className="text-sm text-slate-400">No photos uploaded</p>
              </div>
            )}

            {/* 2. Price + area + type badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-blue-700">{formatCurrency(property.price)}</span>
              <span className="text-sm text-slate-500">{property.area} {property.area_unit}</span>
              <Badge status={property.type} />
              <Badge status={property.classification} />
            </div>

            {/* 3. Key specs grid */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">District</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.district ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Village</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.village ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Taluk</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.taluk ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Landmark</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.landmark ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Facing</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.facing ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Road Access</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.road_access ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Water</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.water ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Electricity</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.electricity ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">DTCP</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.dtcp_approved ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Legal Status</p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{property.legal_status ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* 4. Plot Shape Diagram */}
            {hasShape && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-700 mb-4">Plot Shape Diagram</h2>
                <div className="w-full">
                  <ShapePreview
                    sideA={property.side_a!}
                    sideB={property.side_b!}
                    sideC={property.side_c!}
                    sideD={property.side_d!}
                    facing={property.facing}
                    unit="ft"
                  />
                </div>
              </div>
            )}

            {/* 5 & 6. Location map + WhatsApp share */}
            <PropertyLocationSection property={property} role={role} />

            {/* 7. Exclusivity badge */}
            {property.exclusivity_end && exclusivityDays !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Exclusivity:</span>
                <span className="text-sm font-medium text-slate-700">
                  {property.exclusivity_start ? formatDate(property.exclusivity_start) : '—'} → {formatDate(property.exclusivity_end)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${exclusivityBadgeColor(exclusivityDays)}`}>
                  {exclusivityDays > 0 ? `${exclusivityDays}d remaining` : 'Expired'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* PHOTOS & VIDEO TAB */}
        {activeTab === 'Photos & Video' && (
          <div className="space-y-4">
            {property.photo_urls && property.photo_urls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {property.photo_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group block">
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm group-hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
                No photos uploaded
              </div>
            )}
            {property.video_link && (
              <a
                href={property.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                ▶ Watch Video
              </a>
            )}
          </div>
        )}

        {/* VISITS TAB */}
        {activeTab === 'Visits' && (
          <div className="space-y-4">
            {visits.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
                No site visits recorded yet
              </div>
            ) : (
              visits.map(visit => (
                <VisitCard key={visit.id} visit={visit} isAdmin={isAdmin} />
              ))
            )}
          </div>
        )}

        {/* DEALS TAB */}
        {activeTab === 'Deals' && (
          <div className="space-y-2">
            {deals.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
                No deals linked to this property
              </div>
            ) : (
              deals.map(deal => (
                <DealRow key={deal.id} deal={deal} />
              ))
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'Documents' && (
          <div className="space-y-2">
            {docs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
                No documents uploaded
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {docs.map((doc, i) => (
                  <div
                    key={doc.id}
                    className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
                      i < docs.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">📄</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{doc.document_name}</p>
                        <p className="text-xs text-slate-400">{doc.folder}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={doc.status} />
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OWNER INFO TAB — admin only */}
        {activeTab === 'Owner Info' && isAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Admin Only</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Owner Name</p>
                <p className="font-semibold text-slate-700 mt-0.5">{property.owner_name ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Contact</p>
                {property.owner_phone || property.owner_whatsapp ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {property.owner_phone && (
                      <>
                        <a
                          href={`tel:${property.owner_phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          📞 Call
                        </a>
                        <a
                          href={`sms:${property.owner_phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          💬 SMS
                        </a>
                      </>
                    )}
                    {property.owner_whatsapp && (
                      <a
                        href={`https://wa.me/91${property.owner_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        🟢 WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold text-slate-700">—</p>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Aadhaar</p>
                <p className="font-semibold text-slate-700 mt-0.5">{property.owner_aadhaar ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">PAN</p>
                <p className="font-semibold text-slate-700 mt-0.5">{property.owner_pan ?? '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
