'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import type { BuyerLead, BuyerLeadStatus } from '@/types'

const STATUS_TABS: Array<BuyerLeadStatus | 'All'> = [
  'All', 'New', 'Contacted', 'Requirement Understood', 'Property Matched',
  'Site Visit Scheduled', 'Site Visited', 'Negotiating', 'Token Paid',
  'MOU Signed', 'Converted', 'Lost',
]

const columns = [
  { key: 'lead_id', header: 'Lead ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'phone', header: 'Phone' },
  {
    key: 'budget',
    header: 'Budget',
    render: (row: BuyerLead) => {
      if (row.budget_min && row.budget_max) return <span className="font-semibold text-slate-800">{formatCurrency(row.budget_min)} – {formatCurrency(row.budget_max)}</span>
      if (row.budget_max) return <span className="font-semibold text-slate-800">{formatCurrency(row.budget_max)}</span>
      return <span className="text-slate-400">—</span>
    },
  },
  { key: 'preferred_location', header: 'Location', sortable: true, render: (row: BuyerLead) => row.preferred_location ?? '—' },
  { key: 'property_type_needed', header: 'Type Needed', render: (row: BuyerLead) => row.property_type_needed ?? '—' },
  {
    key: 'urgency', header: 'Urgency',
    render: (row: BuyerLead) => row.urgency ? (
      <span className={row.urgency === 'Immediate' ? 'text-xs font-medium text-red-600' : row.urgency === '3 months' ? 'text-xs font-medium text-yellow-600' : 'text-xs font-medium text-slate-500'}>
        {row.urgency}
      </span>
    ) : <span className="text-slate-400">—</span>,
  },
  { key: 'status', header: 'Status', render: (row: BuyerLead) => <Badge status={row.status} /> },
  { key: 'follow_up_date', header: 'Follow Up', render: (row: BuyerLead) => row.follow_up_date ?? '—' },
  {
    key: 'action', header: '',
    render: (row: BuyerLead) => (
      <Link href={`/buyer-leads/${row.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
        View
      </Link>
    ),
  },
]

interface Props {
  leads: BuyerLead[]
  total: number
  isBroker: boolean
}

export default function BuyerLeadsClient({ leads, total, isBroker }: Props) {
  const [activeTab, setActiveTab] = useState<BuyerLeadStatus | 'All'>('All')

  const filtered = activeTab === 'All' ? leads : leads.filter(l => l.status === activeTab)

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Buyer Leads"
        subtitle={isBroker ? `${total} leads you added` : `${total} total buyer leads`}
        action={
          <Link href="/buyer-leads/new" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <PlusCircle size={15} />
            Add Buyer Lead
          </Link>
        }
      />

      {isBroker && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
          Showing only your leads. Admin can see all leads.
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map(tab => {
          const count = tab === 'All' ? leads.length : leads.filter(l => l.status === tab).length
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {tab}
              <span className={`ml-1.5 text-xs ${activeTab === tab ? 'opacity-80' : 'text-slate-400'}`}>({count})</span>
            </button>
          )
        })}
      </div>

      <DataTable<Record<string, unknown>>
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        searchKeys={['lead_id', 'name', 'phone', 'preferred_location'] as never[]}
        emptyMessage="No buyer leads found"
      />
    </div>
  )
}
