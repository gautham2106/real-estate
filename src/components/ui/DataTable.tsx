'use client'

import { useState } from 'react'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T extends object> {
  data: T[]
  columns: Column<T>[]
  searchKeys?: (keyof T)[]
  emptyMessage?: string
  mobileCard?: (row: T) => React.ReactNode
}

export default function DataTable<T extends object>({
  data, columns, searchKeys, emptyMessage = 'No records found', mobileCard,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = data.filter((row) => {
    if (!search || !searchKeys) return true
    return searchKeys.some((k) =>
      String((row as Record<string | symbol, unknown>)[k as string | symbol] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  })

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '')
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    : filtered

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const getCellValue = (row: T, key: string): unknown =>
    key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k]
      return undefined
    }, row)

  const searchBar = searchKeys && (
    <div className="p-4 border-b border-slate-100">
      <div className="relative w-full sm:w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  const countBar = (
    <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
      {sorted.length} record{sorted.length !== 1 ? 's' : ''}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {searchBar}

      {/* Mobile card view */}
      {mobileCard && (
        <div className="md:hidden">
          {sorted.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400 text-sm">{emptyMessage}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sorted.map((row, i) => <div key={i}>{mobileCard(row)}</div>)}
            </div>
          )}
          {countBar}
        </div>
      )}

      {/* Desktop table */}
      <div className={mobileCard ? 'hidden md:block' : ''}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap ${col.width ?? ''} ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                    onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortKey === String(col.key) && (
                        sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {col.render ? col.render(row) : String(getCellValue(row, String(col.key)) ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {countBar}
      </div>
    </div>
  )
}
