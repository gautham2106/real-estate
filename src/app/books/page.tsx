import Link from 'next/link'
import { BookOpen, PlusCircle, Package, TrendingUp, Archive } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/utils'
import { getBooks } from '@/lib/dal'
import BooksClient from './BooksClient'

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

      <BooksClient books={books} />
    </div>
  )
}
