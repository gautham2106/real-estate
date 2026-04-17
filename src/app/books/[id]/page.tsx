import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DeleteButton from '@/components/ui/DeleteButton'
import { getBookById, getProperties } from '@/lib/dal'
import { getUserRole } from '@/lib/auth'
import { deleteBookAction } from '@/app/actions/books'
import { formatCurrency } from '@/lib/utils'

export default async function BookDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [book, allProperties, role] = await Promise.all([
    getBookById(id),
    getProperties(),
    getUserRole(),
  ])
  if (!book) notFound()

  const linkedProperties = allProperties.filter(p => book.property_ids?.includes(p.id))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/books" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Books
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={22} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{book.book_name}</h1>
                <Badge status={book.status} />
              </div>
              <p className="text-sm text-slate-500 font-mono">{book.book_id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/books/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Edit
            </Link>
            {role === 'admin' && (
              <DeleteButton onDelete={deleteBookAction.bind(null, id)} redirectTo="/books" />
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Properties</p>
          <p className="text-2xl font-bold text-blue-700">{book.total_properties ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Value</p>
          <p className="text-lg font-bold text-slate-800">{formatCurrency(book.total_value ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Created</p>
          <p className="text-sm font-medium text-slate-700">{new Date(book.created_at).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      {book.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-2">Description</h3>
          <p className="text-sm text-slate-600">{book.description}</p>
        </div>
      )}

      {/* Properties */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-700">Properties in this Book</h3>
          <Link href="/properties" className="text-xs text-blue-600 hover:underline">+ Add from Properties</Link>
        </div>
        {linkedProperties.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">No properties linked yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {linkedProperties.map(p => (
              <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div>
                  <span className="font-mono text-xs text-blue-700 font-semibold">{p.land_code}</span>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.area} {p.area_unit} · {p.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(p.price)}</p>
                  <Badge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
