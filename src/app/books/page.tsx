'use client'

import Link from 'next/link'
import { BookOpen, PlusCircle, Package, TrendingUp, Archive } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import { mockBooks } from '@/lib/mock-data'
import type { Book } from '@/types'

// Augment mock data with more entries for a richer demo
const allBooks: Book[] = [
  ...mockBooks,
  {
    id: '2', book_id: 'BK-002', book_name: 'Namakkal Commercial Portfolio',
    description: 'Commercial plots and properties in Namakkal town',
    property_ids: ['3'], total_properties: 1, total_value: 3200000,
    status: 'Active', created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '3', book_id: 'BK-003', book_name: 'Salem Road Farm Lands',
    description: 'Agricultural land along Salem highway corridor',
    property_ids: ['2'], total_properties: 1, total_value: 4500000,
    status: 'Open', created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '4', book_id: 'BK-004', book_name: 'Q1 2025 Closed Properties',
    description: 'Archive of all properties sold in Q1 2025',
    property_ids: [], total_properties: 7, total_value: 14500000,
    status: 'Archived', created_at: '2025-04-01T00:00:00Z',
  },
]

const totalValue = allBooks.reduce((s, b) => s + (b.total_value ?? 0), 0)
const activeCount = allBooks.filter((b) => b.status === 'Active').length
const totalProps = allBooks.reduce((s, b) => s + (b.total_properties ?? 0), 0)

const columns = [
  { key: 'book_id', header: 'Book ID', sortable: true,
    render: (row: Book) => <span className="font-mono text-xs text-blue-700">{row.book_id}</span> },
  { key: 'book_name', header: 'Name', sortable: true,
    render: (row: Book) => <span className="font-medium text-slate-800">{row.book_name}</span> },
  { key: 'description', header: 'Description',
    render: (row: Book) => <span className="text-xs text-slate-500">{row.description ?? '—'}</span> },
  { key: 'total_properties', header: 'Properties',
    render: (row: Book) => (
      <span className="text-center font-semibold text-slate-700">{row.total_properties ?? 0}</span>
    ) },
  { key: 'total_value', header: 'Total Value',
    render: (row: Book) => (
      <span className="font-semibold text-slate-800">{formatCurrency(row.total_value ?? 0)}</span>
    ) },
  { key: 'status', header: 'Status',
    render: (row: Book) => <Badge status={row.status} /> },
  { key: 'created_at', header: 'Created',
    render: (row: Book) => new Date(row.created_at).toLocaleDateString('en-IN') },
  { key: 'actions', header: '',
    render: (row: Book) => (
      <div className="flex items-center gap-2">
        <button className="text-xs text-blue-600 hover:underline">View</button>
        <button className="text-xs text-slate-400 hover:text-slate-600">Edit</button>
      </div>
    ) },
]

export default function BooksPage() {
  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader
        title="Books & Files"
        subtitle="Grouped property portfolios and deal books"
        action={
          <Link
            href="/books/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            + Create Book
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={allBooks.length} icon={BookOpen} iconColor="text-blue-600" iconBg="bg-blue-100" />
        <StatCard title="Active Books" value={activeCount} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-100" />
        <StatCard title="Total Properties" value={totalProps} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-100" />
        <StatCard title="Combined Value" value={formatCurrency(totalValue)} icon={Archive} iconColor="text-amber-600" iconBg="bg-amber-100" />
      </div>

      <DataTable<Book>
        data={allBooks}
        columns={columns}
        searchKeys={['book_name', 'book_id', 'description']}
        emptyMessage="No books found."
      />
    </div>
  )
}
