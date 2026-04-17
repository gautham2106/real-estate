'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import type { Book } from '@/types'

const columns = [
  { key: 'book_id', header: 'Book ID', sortable: true,
    render: (row: Book) => <span className="font-mono text-xs text-blue-700">{row.book_id}</span> },
  { key: 'book_name', header: 'Name', sortable: true,
    render: (row: Book) => <span className="font-medium text-slate-800">{row.book_name}</span> },
  { key: 'description', header: 'Description',
    render: (row: Book) => <span className="text-xs text-slate-500">{row.description ?? '—'}</span> },
  { key: 'total_properties', header: 'Properties',
    render: (row: Book) => <span className="text-center font-semibold text-slate-700">{row.total_properties ?? 0}</span> },
  { key: 'total_value', header: 'Total Value',
    render: (row: Book) => <span className="font-semibold text-slate-800">{formatCurrency(row.total_value ?? 0)}</span> },
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

const mobileCard = (row: Book) => (
  <Link href="#" className="block px-4 py-3 hover:bg-slate-50 transition-colors">
    <div className="flex items-start justify-between gap-2 mb-1.5">
      <div>
        <span className="font-mono text-xs font-bold text-blue-700">{row.book_id}</span>
        <p className="font-semibold text-slate-800 text-sm mt-0.5">{row.book_name}</p>
      </div>
      <Badge status={row.status} />
    </div>
    <div className="flex items-center justify-between text-xs mt-1">
      <div className="text-slate-500">
        {row.description && <p className="mb-0.5">{row.description}</p>}
        <span>{row.total_properties ?? 0} properties</span>
      </div>
      <span className="font-bold text-slate-800">{formatCurrency(row.total_value ?? 0)}</span>
    </div>
  </Link>
)

export default function BooksClient({ books }: { books: Book[] }) {
  return (
    <DataTable<Book>
      data={books}
      columns={columns}
      searchKeys={['book_name', 'book_id', 'description']}
      emptyMessage="No books found."
      mobileCard={mobileCard}
    />
  )
}
