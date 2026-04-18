'use client'

import { useState, useRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Property } from '@/types'
import Badge from '@/components/ui/Badge'

interface Props { properties: Property[] }

const FACING_LABEL: Record<string, string> = { N: 'North', S: 'South', E: 'East', W: 'West' }

function PropertyCard({ property, index }: { property: Property; index: number }) {
  const photos = property.photo_urls ?? []
  const hasShape = property.side_a && property.side_b && property.side_c && property.side_d

  return (
    <div
      className="brochure-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md"
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      {/* Photo strip */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 h-48 overflow-hidden">
          <img
            src={photos[0]}
            alt="main"
            className="col-span-2 w-full h-full object-cover"
          />
          <div className="flex flex-col gap-0.5">
            {photos.slice(1, 3).map((url, i) => (
              <img key={i} src={url} alt="" className="w-full flex-1 object-cover" />
            ))}
            {photos.length === 1 && <div className="flex-1 bg-slate-100" />}
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <span className="text-4xl opacity-30">🏞</span>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                #{String(index + 1).padStart(2, '0')} · {property.land_code}
              </span>
              <Badge status={property.type} />
              <Badge status={property.status} />
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-tight">{property.title}</h3>
            {property.address && (
              <p className="text-xs text-slate-500 mt-0.5">{property.address}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-black text-blue-700">{formatCurrency(property.price)}</p>
            <p className="text-xs text-slate-500">{property.area} {property.area_unit}</p>
          </div>
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Facing', value: FACING_LABEL[property.facing ?? ''] ?? property.facing ?? '—' },
            { label: 'Road', value: property.road_access ? 'Yes' : '—' },
            { label: 'Water', value: property.water ? 'Yes' : '—' },
            { label: 'Electricity', value: property.electricity ? 'Yes' : 'No' },
            { label: 'DTCP', value: property.dtcp_approved ?? '—' },
            { label: 'Legal', value: property.legal_status ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>

        {/* Shape measurements */}
        {hasShape && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] text-blue-400 uppercase tracking-wide mb-1">Plot Measurements (ft)</p>
            <div className="flex gap-4 text-xs font-semibold text-blue-800">
              <span>Front: {property.side_a}′</span>
              <span>Back: {property.side_c}′</span>
              <span>Right: {property.side_b}′</span>
              <span>Left: {property.side_d}′</span>
            </div>
            <p className="text-[10px] text-blue-400 mt-0.5">
              Perimeter: {(property.side_a! + property.side_b! + property.side_c! + property.side_d!)}′
            </p>
          </div>
        )}

        {/* Location chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {property.district && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
              📍 {property.district}
            </span>
          )}
          {property.village && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
              {property.village}
            </span>
          )}
          {property.survey_number && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
              Survey: {property.survey_number}
            </span>
          )}
        </div>

        {/* GPS map link */}
        {property.gps_lat && property.gps_lng && (
          <p className="text-xs text-blue-600">
            📌 GPS: {property.gps_lat.toFixed(5)}, {property.gps_lng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Footer stripe */}
      <div className="bg-blue-700 px-5 py-2 flex items-center justify-between">
        <span className="text-white text-xs font-bold tracking-wide">BLUESQUARE REALTY</span>
        <span className="text-blue-200 text-xs">bluesquare.in · +91 98765 43210</span>
      </div>
    </div>
  )
}

export default function BrochureClient({ properties }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  const filtered = properties.filter(p =>
    !filter ||
    p.title.toLowerCase().includes(filter.toLowerCase()) ||
    p.land_code.toLowerCase().includes(filter.toLowerCase()) ||
    p.district?.toLowerCase().includes(filter.toLowerCase()) ||
    p.type.toLowerCase().includes(filter.toLowerCase())
  )

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectAll = () => setSelected(new Set(filtered.map(p => p.id)))
  const clearAll = () => setSelected(new Set())

  const selectedProps = properties.filter(p => selected.has(p.id))

  function handlePrint() {
    window.print()
  }

  const whatsappText = selectedProps.map((p, i) =>
    `*${i + 1}. ${p.title}*\n` +
    `${p.land_code} · ${p.type} · ${p.area} ${p.area_unit}\n` +
    `Price: ${formatCurrency(p.price)}\n` +
    (p.district ? `Location: ${p.district}${p.village ? ', ' + p.village : ''}\n` : '') +
    (p.gps_lat && p.gps_lng ? `📍 https://maps.google.com/?q=${p.gps_lat},${p.gps_lng}\n` : '')
  ).join('\n---\n')

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `*Bluesquare Realty — Property Listings*\n\n${whatsappText}\n\nContact us for site visits!`
  )}`

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #brochure-print, #brochure-print * { visibility: visible; }
          #brochure-print {
            position: absolute; left: 0; top: 0; width: 100%;
          }
          .brochure-card { margin-bottom: 24px; }
          .no-print { display: none !important; }
          #brochure-print { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; }
        }
      `}</style>

      <div className="max-w-screen-xl space-y-6">
        {/* Controls — no-print */}
        <div className="no-print space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Property Brochure / Catalog</h1>
              <p className="text-sm text-slate-500 mt-0.5">Select properties to print or share as a catalog</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selected.size > 0 && (
                <>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    📤 Share {selected.size} via WhatsApp
                  </a>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    🖨 Print / Save PDF ({selected.size})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter + select controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by title, code, district, type…"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
            />
            <button onClick={selectAll} className="text-xs text-blue-600 hover:underline font-medium">
              Select All ({filtered.length})
            </button>
            {selected.size > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:underline font-medium">
                Clear ({selected.size})
              </button>
            )}
            <span className="text-xs text-slate-400">{selected.size} selected</span>
          </div>

          {/* Property selector grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(p => {
              const isSelected = selected.has(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  {p.photo_urls?.[0] ? (
                    <img src={p.photo_urls[0]} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 flex items-center justify-center text-2xl">🏞</div>
                  )}
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-slate-400">{p.land_code}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.area} {p.area_unit} · {formatCurrency(p.price)}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selected.size === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              Select properties above to generate the brochure
            </p>
          )}
        </div>

        {/* Print area — visible on screen when properties selected, always visible in print */}
        {selected.size > 0 && (
          <div id="brochure-print" ref={printRef} className="no-screen-padding">
            {/* Print header */}
            <div className="print-header col-span-2 mb-4" style={{ gridColumn: '1 / -1' }}>
              <div className="text-center pb-4 border-b-2 border-blue-700 mb-6">
                <h1 className="text-2xl font-black text-blue-800">BLUESQUARE REALTY</h1>
                <p className="text-slate-500 text-sm">Property Catalog · {formatDate(new Date())}</p>
                <p className="text-slate-500 text-sm">{selected.size} Properties Selected</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedProps.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
