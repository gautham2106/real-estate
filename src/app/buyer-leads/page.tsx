'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import { mockBuyerLeads, mockBrokers } from '@/lib/mock-data'
import type { BuyerLead, BuyerLeadStatus } from '@/types'

const brokerMap = Object.fromEntries(mockBrokers.map((b) => [b.broker_id, b.name]))

const STATUS_TABS: Array<BuyerLeadStatus | 'All'> = [
  'All',
  'New',
  'Contacted',
  'Requirement Understood',
  'Property Matched',
  'Site Visit Scheduled',
  'Site Visited',
  'Negotiating',
  'Token Paid',
  'MOU Signed',
  'Converted',
  'Lost',
]

const columns = [
  { key: 'lead_id', header: 'Lead ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'phone', header: 'Phone' },
  {
    key: 'budget',
    header: 'Budget',
    render: (row: BuyerLead) => {
      if (row.budget_min && row.budget_max) {
        return (
          <span className="font-semibold text-slate-800">
            {formatCurrency(row.budget_min)} – {formatCurrency(row.budget_max)}
          </span>
        )
      }
      if (row.budget_max) return <span className="font-semibold text-slate-800">{formatCurrency(row.budget_max)}</span>
      return <span className="text-slate-400">—</span>
    },
  },
  {
    key: 'preferred_location',
    header: 'Preferred Location',
    sortable: true,
    render: (row: BuyerLead) => row.preferred_location ?? '—',
  },
  {
    key: 'property_type_needed',
    header: 'Property Type',
    render: (row: BuyerLead) => row.property_type_needed ?? '—',
  },
  {
    key: 'purpose',
    header: 'Purpose',
    render: (row: BuyerLead) => row.purpose ?? '—',
  },
  {
    key: 'urgency',
    header: 'Urgency',
    render: (row: BuyerLead) =>
      row.urgency ? (
        <span
          className={
            row.urgency === 'Immediate'
              ? 'text-xs font-medium text-red-600'
              : row.urgency === '3 months'
              ? 'text-xs font-medium text-yellow-600'
              : 'text-xs font-medium text-slate-500'
          }
        >
          {row.urgency}
        </span>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: BuyerLead) => <Badge status={row.status} />,
  },
  {
    key: 'follow_up_date',
    header: 'Follow Up Date',
    render: (row: BuyerLead) => row.follow_up_date ?? '—',
  },
  {
    key: 'added_by_broker_id',
    header: 'Added By',
    render: (row: BuyerLead) =>
      row.added_by_broker_id ? brokerMap[row.added_by_broker_id] ?? row.added_by_broker_id : '—',
  },
  {
    key: 'action',
    header: 'Action',
    render: (row: BuyerLead) => (
      <Link
        href={`/buyer-leads/${row.id}`}
        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
      >
        View
      </Link>
    ),
  },
]

export default function BuyerLeadsPage() {
  const [activeTab, setActiveTab] = useState<BuyerLeadStatus | 'All'>('All')

  const filtered =
    activeTab === 'All'
      ? mockBuyerLeads
      : mockBuyerLeads.filter((l) => l.status === activeTab)

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Buyer Leads"
        subtitle={`${mockBuyerLeads.length} total buyer leads`}
        action={
          <Link
            href="/buyer-leads/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            Add Buyer Lead
          </Link>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count =
            tab === 'All'
              ? mockBuyerLeads.length
              : mockBuyerLeads.filter((l) => l.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs ${activeTab === tab ? 'opacity-80' : 'text-slate-400'}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <DataTable<Record<string, unknown>>
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        searchKeys={['lead_id', 'name', 'phone', 'preferred_location'] as never[]}
        emptyMessage="No buyer leads found for this status"
      />
    </div>
  )
}
