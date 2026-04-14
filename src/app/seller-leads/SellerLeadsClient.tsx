'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import type { SellerLead, SellerLeadStatus } from '@/types'

const STATUS_TABS: Array<SellerLeadStatus | 'All'> = [
  'All', 'New', 'Contacted', 'Property Verified', 'Video Shot', 'Listed', 'Negotiating', 'Sold', 'Withdrawn',
]

const columns = [
  { key: 'lead_id', header: 'Lead ID', sortable: true },
  { key: 'owner_name', header: 'Owner Name', sortable: true },
  { key: 'phone', header: 'Phone' },
  { key: 'property_location', header: 'Location', sortable: true },
  {
    key: 'asking_price', header: 'Asking Price',
    render: (row: SellerLead) => row.asking_price
      ? <span className="font-semibold text-slate-800">{formatCurrency(row.asking_price)}</span>
      : <span className="text-slate-400">—</span>,
  },
  { key: 'property_type', header: 'Type', render: (row: SellerLead) => row.property_type ?? '—' },
  { key: 'status', header: 'Status', render: (row: SellerLead) => <Badge status={row.status} /> },
  { key: 'follow_up_date', header: 'Follow Up', render: (row: SellerLead) => row.follow_up_date ?? '—' },
  { key: 'source', header: 'Source', render: (row: SellerLead) => row.source ?? '—' },
  {
    key: 'action', header: '',
    render: (row: SellerLead) => (
      <Link href={`/seller-leads/${row.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
        View
      </Link>
    ),
  },
]

interface Props {
  leads: SellerLead[]
  total: number
  isBroker: boolean
}

export default function SellerLeadsClient({ leads, total, isBroker }: Props) {
  const [activeTab, setActiveTab] = useState<SellerLeadStatus | 'All'>('All')

  const filtered = activeTab === 'All' ? leads : leads.filter(l => l.status === activeTab)

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Seller Leads"
        subtitle={isBroker ? `${total} leads you added` : `${total} total seller leads`}
        action={
          <Link href="/seller-leads/new" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <PlusCircle size={15} />
            Add Seller Lead
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
        searchKeys={['lead_id', 'owner_name', 'phone', 'property_location'] as never[]}
        emptyMessage="No seller leads found"
      />
    </div>
  )
}
