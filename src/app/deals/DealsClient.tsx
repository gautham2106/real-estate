'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Handshake,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  PlusCircle,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import type { Deal, DealStatus } from '@/types'

const allStatuses: DealStatus[] = [
  'Created',
  'Site Visit Done',
  'Negotiation Active',
  'Token Paid',
  'MOU Signed',
  'Documents Verified',
  'Loan Processing',
  'Registration Scheduled',
  'Registration Done',
  'Closed Won',
  'Closed Lost',
]

interface DealsClientProps {
  deals: Deal[]
  propertyMap: Record<string, string>
  brokerMap: Record<string, string>
}

export default function DealsClient({ deals, propertyMap, brokerMap }: DealsClientProps) {
  const [activeTab, setActiveTab] = useState<DealStatus | 'All'>('All')

  const totalDeals = deals.length
  const activeDeals = deals.filter(
    (d) => !['Closed Won', 'Closed Lost'].includes(d.status)
  ).length
  const closedWon = deals.filter((d) => d.status === 'Closed Won').length
  const totalPipeline = deals.reduce((sum, d) => sum + d.deal_value, 0)

  const filtered =
    activeTab === 'All'
      ? deals
      : deals.filter((d) => d.status === activeTab)

  const columns = [
    { key: 'deal_id', header: 'Deal ID', sortable: true },
    { key: 'deal_title', header: 'Title', sortable: true },
    {
      key: 'property_id',
      header: 'Property',
      render: (row: Deal) => (
        <span className="font-mono text-xs text-blue-700">
          {propertyMap[row.property_id] ?? row.property_id}
        </span>
      ),
    },
    {
      key: 'buyer_broker_id',
      header: 'Buyer Broker',
      render: (row: Deal) =>
        row.buyer_broker_id ? brokerMap[row.buyer_broker_id] ?? row.buyer_broker_id : '—',
    },
    {
      key: 'seller_broker_id',
      header: 'Seller Broker',
      render: (row: Deal) =>
        row.seller_broker_id ? brokerMap[row.seller_broker_id] ?? row.seller_broker_id : '—',
    },
    {
      key: 'deal_value',
      header: 'Deal Value',
      sortable: true,
      render: (row: Deal) => (
        <span className="font-semibold text-slate-800">{formatCurrency(row.deal_value)}</span>
      ),
    },
    {
      key: 'total_commission',
      header: 'Commission (4%)',
      render: (row: Deal) => (
        <span className="text-blue-700 font-medium">
          {formatCurrency(row.total_commission ?? row.deal_value * 0.04)}
        </span>
      ),
    },
    {
      key: 'your_net',
      header: 'Your Net',
      render: (row: Deal) => (
        <span className="text-green-700 font-semibold">
          {formatCurrency(row.your_net ?? 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Deal) => <Badge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: Deal) => new Date(row.created_at).toLocaleDateString('en-IN'),
    },
  ]

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Deals"
        subtitle={`${totalDeals} deals in the system`}
        action={
          <Link
            href="/deals/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            + New Deal
          </Link>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Deals"
          value={totalDeals}
          icon={Handshake}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Active"
          value={activeDeals}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Closed Won"
          value={closedWon}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Total Pipeline Value"
          value={formatCurrency(totalPipeline)}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...allStatuses] as const).map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {status}
            {status !== 'All' && (
              <span className="ml-1 opacity-70">
                ({deals.filter((d) => d.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deals Table */}
      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['deal_id', 'deal_title'] as (keyof Deal)[]}
        emptyMessage="No deals found for the selected status."
      />
    </div>
  )
}
