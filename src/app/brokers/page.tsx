'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  Handshake,
  DollarSign,
  PlusCircle,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency, tierIcon, cn } from '@/lib/utils'
import { mockBrokers } from '@/lib/mock-data'
import type { Broker, BrokerStatus } from '@/types'

const totalBrokers = mockBrokers.length
const activeBrokers = mockBrokers.filter((b) => b.status === 'Active').length
const totalDealsClosed = mockBrokers.reduce((s, b) => s + (b.deals_closed ?? 0), 0)
const totalCommissionPaid = mockBrokers.reduce((s, b) => s + (b.total_commission_earned ?? 0), 0)

const columns = [
  { key: 'broker_id', header: 'Broker ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'phone', header: 'Phone' },
  {
    key: 'tier_level',
    header: 'Tier',
    render: (row: Broker) => (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        row.tier_level === 'Elite' ? 'bg-purple-100 text-purple-800' :
        row.tier_level === 'Star' ? 'bg-yellow-100 text-yellow-800' :
        row.tier_level === 'Coordinator' ? 'bg-indigo-100 text-indigo-800' :
        row.tier_level === 'Active' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-700'
      )}>
        <span>{tierIcon(row.tier_level)}</span>
        {row.tier_level}
      </span>
    ),
  },
  {
    key: 'deals_closed',
    header: 'Deals Closed',
    sortable: true,
    render: (row: Broker) => (
      <span className="font-semibold text-slate-800">{row.deals_closed ?? 0}</span>
    ),
  },
  {
    key: 'total_commission_earned',
    header: 'Commission Earned',
    sortable: true,
    render: (row: Broker) => (
      <span className="text-green-700 font-medium">
        {formatCurrency(row.total_commission_earned ?? 0)}
      </span>
    ),
  },
  {
    key: 'active_leads_count',
    header: 'Active Leads',
    render: (row: Broker) => row.active_leads_count ?? 0,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: Broker) => <Badge status={row.status} />,
  },
  {
    key: 'joined_date',
    header: 'Joined',
    render: (row: Broker) => new Date(row.joined_date).toLocaleDateString('en-IN'),
  },
  {
    key: 'login_active',
    header: 'Login',
    render: (row: Broker) => (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        row.login_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
      )}>
        {row.login_active ? 'ON' : 'OFF'}
      </span>
    ),
  },
]

const brokerStatuses: BrokerStatus[] = ['Active', 'Inactive', 'Blacklisted']

export default function BrokersPage() {
  const [activeTab, setActiveTab] = useState<BrokerStatus | 'All'>('All')

  const filtered =
    activeTab === 'All'
      ? mockBrokers
      : mockBrokers.filter((b) => b.status === activeTab)

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Brokers"
        subtitle={`${totalBrokers} brokers registered`}
        action={
          <Link
            href="/brokers/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            + Add Broker
          </Link>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Brokers"
          value={totalBrokers}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Active"
          value={activeBrokers}
          icon={UserCheck}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Total Deals Closed"
          value={totalDealsClosed}
          icon={Handshake}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Total Commission Paid"
          value={formatCurrency(totalCommissionPaid)}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...brokerStatuses] as const).map((status) => (
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
                ({mockBrokers.filter((b) => b.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Brokers Table */}
      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={['broker_id', 'name', 'phone'] as (keyof Broker)[]}
        emptyMessage="No brokers found for the selected filter."
      />
    </div>
  )
}
