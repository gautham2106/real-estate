import Link from 'next/link'
import { Building2, CheckCircle, TrendingUp, PlusCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import { getUserRole } from '@/lib/auth'
import { getProperties } from '@/lib/dal'
import { mockProperties, mockBrokers } from '@/lib/mock-data'
import type { Property } from '@/types'

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

const brokerMap = Object.fromEntries(mockBrokers.map((b) => [b.broker_id, b.name]))

export default async function PropertiesPage() {
  const [role, properties] = await Promise.all([
    getUserRole(),
    isDemoMode ? Promise.resolve(mockProperties) : getProperties(),
  ])
  const isAdmin = role === 'admin'

  const available = properties.filter(p => p.status === 'Available').length
  const negotiatingOrSold = properties.filter(p => p.status === 'Negotiating' || p.status === 'Sold').length

  const columns = [
    { key: 'land_code', header: 'Land Code', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'area', header: 'Area', render: (row: Property) => `${row.area} ${row.area_unit}` },
    { key: 'price', header: 'Price', render: (row: Property) => <span className="font-semibold text-slate-800">{formatCurrency(row.price)}</span> },
    { key: 'status', header: 'Status', render: (row: Property) => <Badge status={row.status} /> },
    { key: 'district', header: 'District', render: (row: Property) => row.district ?? '—' },
    {
      key: 'assigned_broker_id', header: 'Broker',
      render: (row: Property) => row.assigned_broker_id ? brokerMap[row.assigned_broker_id] ?? row.assigned_broker_id : '—',
    },
    // Owner details: admin only
    ...(isAdmin ? [
      { key: 'owner_name', header: 'Owner', render: (row: Property) => row.owner_name ?? '—' },
      { key: 'owner_phone', header: 'Owner Phone', render: (row: Property) => row.owner_phone ?? '—' },
    ] : []),
    {
      key: 'action', header: '',
      render: (row: Property) => (
        <Link href={`/properties/${row.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Properties & Land"
        subtitle={`${properties.length} properties in the system`}
        action={
          isAdmin ? (
            <Link href="/properties/new" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <PlusCircle size={15} />
              Add Property
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Properties" value={properties.length} subtitle="All listings" icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard title="Available" value={available} subtitle="Ready to sell" icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="Negotiating / Sold" value={negotiatingOrSold} subtitle="Active pipeline" icon={TrendingUp} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
          Owner contact details are visible to admins only.
        </div>
      )}

      <DataTable<Record<string, unknown>>
        data={properties as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        searchKeys={['land_code', 'title', 'district', 'type'] as never[]}
        emptyMessage="No properties found"
      />
    </div>
  )
}
