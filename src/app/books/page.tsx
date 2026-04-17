import Link from 'next/link'
import { BookOpen, PlusCircle, Package, TrendingUp, Archive } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/lib/utils'
import { getBooks } from '@/lib/dal'
import type { Book } from '@/types'

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

export default async function BooksPage() {
  const books = await getBooks()

  const totalValue = books.reduce((s, b) => s + (b.total_value ?? 0), 0)
  const activeCount = books.filter((b) => b.status === 'Active').length
  const totalProps = books.reduce((s, b) => s + (b.total_properties ?? 0), 0)

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
        <StatCard title="Total Books" value={books.length} icon={BookOpen} iconColor="text-blue-600" iconBg="bg-blue-100" />
        <StatCard title="Active Books" value={activeCount} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-100" />
        <StatCard title="Total Properties" value={totalProps} icon={Package} iconColor="text-purple-600" iconBg="bg-purple-100" />
        <StatCard title="Combined Value" value={formatCurrency(totalValue)} icon={Archive} iconColor="text-amber-600" iconBg="bg-amber-100" />
      </div>

      <DataTable<Book>
        data={books}
        columns={columns}
        searchKeys={['book_name', 'book_id', 'description']}
        emptyMessage="No books found."
      />
    </div>
  )
}
