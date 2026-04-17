'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import type { Property } from '@/types'

interface PropertiesTableProps {
  properties: Property[]
  isAdmin: boolean
  brokerEntries: [string, string][]
}

export default function PropertiesTable({ properties, isAdmin, brokerEntries }: PropertiesTableProps) {
  const brokerMap = Object.fromEntries(brokerEntries)

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

  const mobileCard = (row: Property) => (
    <Link href={`/properties/${row.id}`} className="block px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <span className="font-mono text-xs font-bold text-blue-700">{row.land_code}</span>
          <p className="font-semibold text-slate-800 text-sm mt-0.5">{row.title}</p>
        </div>
        <Badge status={row.status} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{row.type}</span>
          <span>{row.area} {row.area_unit}</span>
          {row.district && <span>📍 {row.district}</span>}
        </div>
        <span className="font-bold text-slate-800">{formatCurrency(row.price)}</span>
      </div>
      {isAdmin && row.owner_name && (
        <p className="text-xs text-slate-400 mt-1">Owner: {row.owner_name}{row.owner_phone ? ` · ${row.owner_phone}` : ''}</p>
      )}
    </Link>
  )

  return (
    <DataTable<Record<string, unknown>>
      data={properties as unknown as Record<string, unknown>[]}
      columns={columns as Parameters<typeof DataTable>[0]['columns']}
      searchKeys={['land_code', 'title', 'district', 'type'] as never[]}
      emptyMessage="No properties found"
      mobileCard={mobileCard as unknown as (row: Record<string, unknown>) => React.ReactNode}
    />
  )
}
