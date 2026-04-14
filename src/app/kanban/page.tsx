'use client'

import { useState, useMemo } from 'react'
import { Kanban, Filter } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatCurrency, cn } from '@/lib/utils'
import { mockDeals, mockProperties, mockBrokers, mockBuyerLeads } from '@/lib/mock-data'
import type { Deal, DealStatus } from '@/types'

const propertyMap = Object.fromEntries(mockProperties.map((p) => [p.id, p]))
const brokerMap = Object.fromEntries(mockBrokers.map((b) => [b.broker_id, b.name]))
const buyerMap = Object.fromEntries(mockBuyerLeads.map((l) => [l.id, l.name]))

const COLUMNS: { status: DealStatus; bg: string; header: string }[] = [
  { status: 'Created',               bg: 'bg-slate-50',  header: 'bg-slate-100' },
  { status: 'Site Visit Done',       bg: 'bg-slate-50',  header: 'bg-slate-100' },
  { status: 'Negotiation Active',    bg: 'bg-yellow-50', header: 'bg-yellow-100' },
  { status: 'Token Paid',            bg: 'bg-blue-50',   header: 'bg-blue-100' },
  { status: 'MOU Signed',            bg: 'bg-purple-50', header: 'bg-purple-100' },
  { status: 'Documents Verified',    bg: 'bg-indigo-50', header: 'bg-indigo-100' },
  { status: 'Loan Processing',       bg: 'bg-cyan-50',   header: 'bg-cyan-100' },
  { status: 'Registration Scheduled',bg: 'bg-orange-50', header: 'bg-orange-100' },
  { status: 'Registration Done',     bg: 'bg-teal-50',   header: 'bg-teal-100' },
  { status: 'Closed Won',            bg: 'bg-green-50',  header: 'bg-green-100' },
  { status: 'Closed Lost',           bg: 'bg-red-50',    header: 'bg-red-100' },
]

function daysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

// Spread mock deals across columns for demo since we only have 1
const spreadDeals: Deal[] = [
  { ...mockDeals[0], id: '1',  deal_id: 'DEAL-001', status: 'Token Paid',              deal_value: 1750000, created_at: '2026-03-20T10:00:00Z' },
  { ...mockDeals[0], id: '2',  deal_id: 'DEAL-002', status: 'Created',                 deal_value: 2200000, buyer_broker_id: 'BRK-002', created_at: '2026-04-10T10:00:00Z' },
  { ...mockDeals[0], id: '3',  deal_id: 'DEAL-003', status: 'Negotiation Active',      deal_value: 4500000, buyer_broker_id: 'BRK-003', created_at: '2026-03-28T10:00:00Z' },
  { ...mockDeals[0], id: '4',  deal_id: 'DEAL-004', status: 'Site Visit Done',         deal_value: 3200000, buyer_broker_id: 'BRK-001', created_at: '2026-04-05T10:00:00Z' },
  { ...mockDeals[0], id: '5',  deal_id: 'DEAL-005', status: 'MOU Signed',              deal_value: 5800000, buyer_broker_id: 'BRK-002', created_at: '2026-03-15T10:00:00Z' },
  { ...mockDeals[0], id: '6',  deal_id: 'DEAL-006', status: 'Documents Verified',      deal_value: 1200000, buyer_broker_id: 'BRK-003', created_at: '2026-03-01T10:00:00Z' },
  { ...mockDeals[0], id: '7',  deal_id: 'DEAL-007', status: 'Loan Processing',         deal_value: 2900000, buyer_broker_id: 'BRK-001', created_at: '2026-02-20T10:00:00Z' },
  { ...mockDeals[0], id: '8',  deal_id: 'DEAL-008', status: 'Registration Scheduled',  deal_value: 3600000, buyer_broker_id: 'BRK-002', created_at: '2026-02-10T10:00:00Z' },
  { ...mockDeals[0], id: '9',  deal_id: 'DEAL-009', status: 'Closed Won',              deal_value: 4100000, buyer_broker_id: 'BRK-001', created_at: '2026-01-25T10:00:00Z' },
  { ...mockDeals[0], id: '10', deal_id: 'DEAL-010', status: 'Closed Lost',             deal_value: 1800000, buyer_broker_id: 'BRK-003', created_at: '2026-03-05T10:00:00Z' },
  { ...mockDeals[0], id: '11', deal_id: 'DEAL-011', status: 'Registration Done',       deal_value: 2700000, buyer_broker_id: 'BRK-002', created_at: '2026-02-01T10:00:00Z' },
  { ...mockDeals[0], id: '12', deal_id: 'DEAL-012', status: 'Created',                 deal_value: 6200000, buyer_broker_id: 'BRK-003', created_at: '2026-04-13T10:00:00Z' },
]

export default function KanbanPage() {
  const [brokerFilter, setBrokerFilter] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [clickedDeal, setClickedDeal] = useState<string | null>(null)

  const filteredDeals = useMemo(() => {
    return spreadDeals.filter((deal) => {
      if (brokerFilter && deal.buyer_broker_id !== brokerFilter) return false
      if (minValue && deal.deal_value < Number(minValue)) return false
      if (maxValue && deal.deal_value > Number(maxValue)) return false
      return true
    })
  }, [brokerFilter, minValue, maxValue])

  const dealsByStatus = useMemo(() => {
    const map: Record<string, Deal[]> = {}
    COLUMNS.forEach((col) => { map[col.status] = [] })
    filteredDeals.forEach((deal) => {
      if (map[deal.status]) map[deal.status].push(deal)
    })
    return map
  }, [filteredDeals])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deal Pipeline — Kanban"
        subtitle={`${filteredDeals.length} deals across ${COLUMNS.length} stages`}
        action={
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
            <Kanban size={13} />
            Drag &amp; drop coming soon
          </span>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
        <Filter size={15} className="text-slate-400 shrink-0" />
        <select
          value={brokerFilter}
          onChange={(e) => setBrokerFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
        >
          <option value="">All Brokers</option>
          {mockBrokers.map((b) => (
            <option key={b.broker_id} value={b.broker_id}>{b.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Deal Value:</span>
          <input
            type="number"
            placeholder="Min ₹"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(brokerFilter || minValue || maxValue) && (
          <button
            onClick={() => { setBrokerFilter(''); setMinValue(''); setMaxValue('') }}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {COLUMNS.map((col) => {
            const cards = dealsByStatus[col.status] ?? []
            return (
              <div
                key={col.status}
                className={cn('rounded-xl border border-slate-200 flex flex-col w-64 shrink-0', col.bg)}
              >
                {/* Column Header */}
                <div className={cn('px-3 py-2.5 rounded-t-xl border-b border-slate-200', col.header)}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 leading-tight">{col.status}</span>
                    <span className="bg-white text-slate-600 text-xs font-bold rounded-full px-2 py-0.5 min-w-[24px] text-center shadow-sm">
                      {cards.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
                  {cards.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-slate-300 text-center">No deals</p>
                    </div>
                  )}
                  {cards.map((deal) => {
                    const prop = propertyMap[deal.property_id]
                    const brokerName = deal.buyer_broker_id ? brokerMap[deal.buyer_broker_id] ?? deal.buyer_broker_id : '—'
                    const buyerName = buyerMap[deal.buyer_lead_id] ?? 'Unknown'
                    const days = daysSince(deal.created_at)
                    return (
                      <div
                        key={deal.id}
                        onClick={() => setClickedDeal(deal.deal_id)}
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-150 active:scale-95"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="font-bold text-xs text-blue-700 font-mono">
                            {prop?.land_code ?? deal.property_id}
                          </span>
                          <Badge status={deal.status} />
                        </div>
                        <p className="text-xs font-medium text-slate-800 mb-1">{buyerName}</p>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(deal.deal_value)}</p>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 truncate">{brokerName}</span>
                          <span className={cn(
                            'text-xs font-medium px-1.5 py-0.5 rounded',
                            days > 30 ? 'bg-red-100 text-red-700' :
                            days > 14 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-500'
                          )}>
                            {days}d
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Column footer with total value */}
                {cards.length > 0 && (
                  <div className="px-3 py-2 border-t border-slate-200 rounded-b-xl">
                    <p className="text-xs text-slate-500">
                      Total: <span className="font-semibold text-slate-700">
                        {formatCurrency(cards.reduce((s, d) => s + d.deal_value, 0))}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Click feedback */}
      {clickedDeal && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 flex items-center gap-3">
          <span>Selected: <strong>{clickedDeal}</strong></span>
          <button onClick={() => setClickedDeal(null)} className="text-slate-300 hover:text-white">✕</button>
        </div>
      )}
    </div>
  )
}
