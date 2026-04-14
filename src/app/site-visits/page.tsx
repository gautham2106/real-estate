'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, PlusCircle, Eye } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatCurrency, cn } from '@/lib/utils'
import { mockSiteVisits, mockProperties, mockBuyerLeads, mockBrokers } from '@/lib/mock-data'

type ReactionFilter = 'All' | 'Interested' | 'Not Interested' | 'Negotiating' | 'Need Time'
const REACTION_TABS: ReactionFilter[] = ['All', 'Interested', 'Not Interested', 'Negotiating', 'Need Time']

const reactionColor: Record<string, string> = {
  'Interested': 'bg-green-100 text-green-800',
  'Not Interested': 'bg-red-100 text-red-800',
  'Negotiating': 'bg-yellow-100 text-yellow-800',
  'Need Time': 'bg-gray-100 text-gray-700',
}

export default function SiteVisitsPage() {
  const [filter, setFilter] = useState<ReactionFilter>('All')

  const enriched = mockSiteVisits.map(v => ({
    ...v,
    property: mockProperties.find(p => p.id === v.property_id),
    buyer: mockBuyerLeads.find(b => b.id === v.buyer_id),
    broker: mockBrokers.find(b => b.id === v.broker_id),
  }))

  const filtered = filter === 'All' ? enriched : enriched.filter(v => v.buyer_reaction === filter)

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Site Visits"
        subtitle={`${mockSiteVisits.length} recorded visits`}
        action={
          <Link
            href="/site-visits/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            + Schedule Visit
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: mockSiteVisits.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Interested', value: mockSiteVisits.filter(v => v.buyer_reaction === 'Interested').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Negotiating', value: mockSiteVisits.filter(v => v.buyer_reaction === 'Negotiating').length, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Progressed', value: mockSiteVisits.filter(v => v.outcome === 'Progressed').length, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-slate-200`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reaction Filter */}
      <div className="flex gap-2 flex-wrap">
        {REACTION_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Visit Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No site visits found.</p>
          </div>
        ) : (
          filtered.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{v.visit_id}</span>
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{v.property?.land_code ?? 'Unknown Property'}</span>
                  {v.buyer_reaction && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reactionColor[v.buyer_reaction] ?? 'bg-gray-100 text-gray-700'}`}>
                      {v.buyer_reaction}
                    </span>
                  )}
                  {v.outcome && <Badge status={v.outcome} />}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                  <div>
                    <p className="text-slate-400 font-medium">Buyer</p>
                    <p className="font-medium text-slate-700">{v.buyer?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Visit Date</p>
                    <p>{new Date(v.visit_date).toLocaleDateString('en-IN')} {v.visit_time ?? ''}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Broker</p>
                    <p>{v.broker?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Price Discussed</p>
                    <p className="font-medium text-slate-800">{v.price_discussed ? formatCurrency(v.price_discussed) : '—'}</p>
                  </div>
                </div>
                {v.buyer_remarks && (
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">
                    &quot;{v.buyer_remarks}&quot;
                  </p>
                )}
              </div>
              <div className="flex items-start gap-2 shrink-0">
                {v.next_action_date && (
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 text-center">
                    <p className="text-slate-400">Next Action</p>
                    <p className="font-medium">{new Date(v.next_action_date).toLocaleDateString('en-IN')}</p>
                    <p className="text-slate-600 mt-0.5">{v.next_action}</p>
                  </div>
                )}
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <Eye size={12} />
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
