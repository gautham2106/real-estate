import Link from 'next/link'
import { getProperties, getBuyerLeads, getSellerLeads, getDeals, getBrokers } from '@/lib/dal'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = (q ?? '').toLowerCase().trim()

  if (!query) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-slate-800">Global Search</h1>
        <form method="get" action="/search">
          <div className="flex gap-2">
            <input
              name="q"
              type="text"
              autoFocus
              placeholder="Search leads, properties, deals, brokers…"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
        <p className="text-sm text-slate-400 text-center">
          Search across all leads, properties, deals, and brokers in one place.
        </p>
      </div>
    )
  }

  const [properties, buyers, sellers, deals, brokers] = await Promise.all([
    getProperties(),
    getBuyerLeads(),
    getSellerLeads(),
    getDeals(),
    getBrokers(),
  ])

  const matchedProperties = properties.filter(p =>
    p.title?.toLowerCase().includes(query) ||
    p.land_code?.toLowerCase().includes(query) ||
    p.address?.toLowerCase().includes(query) ||
    p.district?.toLowerCase().includes(query) ||
    p.village?.toLowerCase().includes(query) ||
    p.owner_name?.toLowerCase().includes(query)
  )

  const matchedBuyers = buyers.filter(b =>
    b.name?.toLowerCase().includes(query) ||
    b.phone?.toLowerCase().includes(query) ||
    b.preferred_location?.toLowerCase().includes(query)
  )

  const matchedSellers = sellers.filter(s =>
    s.owner_name?.toLowerCase().includes(query) ||
    s.phone?.toLowerCase().includes(query) ||
    s.property_location?.toLowerCase().includes(query)
  )

  const matchedDeals = deals.filter(d =>
    d.deal_id?.toLowerCase().includes(query) ||
    d.status?.toLowerCase().includes(query)
  )

  const matchedBrokers = brokers.filter(b =>
    b.name?.toLowerCase().includes(query) ||
    b.phone?.toLowerCase().includes(query) ||
    b.area_coverage?.toLowerCase().includes(query) ||
    b.email?.toLowerCase().includes(query)
  )

  const total = matchedProperties.length + matchedBuyers.length + matchedSellers.length + matchedDeals.length + matchedBrokers.length

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-slate-800">Search Results</h1>
        <form method="get" action="/search" className="flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Search again…"
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm w-64"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      <p className="text-sm text-slate-500">
        <strong className="text-slate-800">{total}</strong> result{total !== 1 ? 's' : ''} for &ldquo;<strong>{q}</strong>&rdquo;
      </p>

      {total === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500 text-sm">No matches found. Try a different keyword.</p>
          <Link href="/search" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Clear search</Link>
        </div>
      )}

      {matchedProperties.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Properties ({matchedProperties.length})
          </h2>
          <div className="space-y-2">
            {matchedProperties.map(p => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">{p.land_code}</span>
                    <Badge status={p.type} />
                    <Badge status={p.status} />
                  </div>
                  <p className="font-medium text-slate-800 group-hover:text-blue-700 truncate">{p.title}</p>
                  {p.address && <p className="text-xs text-slate-400 truncate">{p.address}</p>}
                </div>
                <span className="font-semibold text-slate-700 text-sm shrink-0">{formatCurrency(p.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedBuyers.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Buyer Leads ({matchedBuyers.length})
          </h2>
          <div className="space-y-2">
            {matchedBuyers.map(b => (
              <Link
                key={b.id}
                href={`/buyer-leads/${b.id}`}
                className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-blue-700">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.phone} · {b.preferred_location ?? '—'}</p>
                </div>
                <Badge status={b.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedSellers.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Seller Leads ({matchedSellers.length})
          </h2>
          <div className="space-y-2">
            {matchedSellers.map(s => (
              <Link
                key={s.id}
                href={`/seller-leads/${s.id}`}
                className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-blue-700">{s.owner_name}</p>
                  <p className="text-xs text-slate-400">{s.phone} · {s.property_location ?? '—'}</p>
                </div>
                <Badge status={s.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedDeals.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Deals ({matchedDeals.length})
          </h2>
          <div className="space-y-2">
            {matchedDeals.map(d => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-blue-700 font-mono text-sm">{d.deal_id}</p>
                  <p className="text-xs text-slate-400">{d.property_id}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-slate-700 text-sm">{formatCurrency(d.deal_value)}</span>
                  <Badge status={d.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedBrokers.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Brokers ({matchedBrokers.length})
          </h2>
          <div className="space-y-2">
            {matchedBrokers.map(b => (
              <Link
                key={b.broker_id}
                href={`/brokers/${b.broker_id}`}
                className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-blue-700">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.phone} · {b.area_coverage ?? b.email}</p>
                </div>
                <Badge status={b.tier_level} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
