'use client'

import { useState } from 'react'
import { Search, Printer, Share2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Property } from '@/types'
import Badge from '@/components/ui/Badge'

const FACING_LABEL: Record<string, string> = { N: 'North', S: 'South', E: 'East', W: 'West' }

function areaMapUrl(p: Property): string {
  const q = [p.village, p.taluk, p.district].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

function PropertyCard({ property, index }: { property: Property; index: number }) {
  const photos = property.photo_urls ?? []
  const hasShape = property.side_a && property.side_b && property.side_c && property.side_d

  return (
    <div
      className="brochure-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col"
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      {/* Photo strip */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-px h-44 overflow-hidden bg-slate-200 shrink-0">
          <img src={photos[0]} alt="main" className="col-span-2 w-full h-full object-cover" />
          <div className="flex flex-col gap-px">
            {photos.slice(1, 3).map((url, i) => (
              <img key={i} src={url} alt="" className="w-full flex-1 object-cover" />
            ))}
            {photos.length === 1 && <div className="flex-1 bg-slate-100" />}
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
          <span className="text-4xl opacity-30">🏞</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header: code + title + price */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                #{String(index + 1).padStart(2, '0')} · {property.land_code}
              </span>
              <Badge status={property.type} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{property.title}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-blue-700 leading-tight">{formatCurrency(property.price)}</p>
            <p className="text-xs text-slate-500">{property.area} {property.area_unit}</p>
          </div>
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { label: 'Facing', value: FACING_LABEL[property.facing ?? ''] ?? property.facing ?? '—' },
            { label: 'Road', value: property.road_access && property.road_access !== 'No' ? 'Yes' : '—' },
            { label: 'Water', value: property.water && property.water !== 'No' ? 'Yes' : '—' },
            { label: 'Electricity', value: property.electricity ? 'Yes' : 'No' },
            { label: 'DTCP', value: property.dtcp_approved ?? '—' },
            { label: 'Legal', value: property.legal_status ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
              <p className="text-[11px] font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>

        {/* Shape measurements */}
        {hasShape && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-[9px] text-blue-400 uppercase tracking-wide mb-1">Plot Measurements (ft)</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-semibold text-blue-800">
              <span>Front: {property.side_a}′</span>
              <span>Back: {property.side_c}′</span>
              <span>Right: {property.side_b}′</span>
              <span>Left: {property.side_d}′</span>
            </div>
            <p className="text-[9px] text-blue-400 mt-0.5">
              Perimeter: {property.side_a! + property.side_b! + property.side_c! + property.side_d!}′
            </p>
          </div>
        )}

        {/* Location chips — district / taluk / village / survey; NO landmark, NO exact GPS */}
        <div className="flex flex-wrap gap-1 mb-2">
          {property.district && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px]">
              📍 {property.district}
            </span>
          )}
          {property.taluk && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px]">
              {property.taluk}
            </span>
          )}
          {property.village && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px]">
              {property.village}
            </span>
          )}
          {property.survey_number && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px]">
              Survey: {property.survey_number}
            </span>
          )}
        </div>

        {/* GPS verified badge — area-level link only, no exact coordinates */}
        {property.gps_lat && property.gps_lng && (
          <a
            href={areaMapUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 self-start mt-auto"
          >
            📍 GPS Verified · View Area Map
          </a>
        )}
      </div>

      {/* Branded footer stripe */}
      <div className="bg-blue-700 px-4 py-2 flex items-center justify-between shrink-0">
        <span className="text-white text-[11px] font-bold tracking-wider">BLUESQUARE REALTY</span>
        <span className="text-blue-200 text-[10px]">bluesquare.in · +91 98765 43210</span>
      </div>
    </div>
  )
}

export default function BrochureClient({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')

  const filtered = properties.filter(p =>
    !filter ||
    p.title.toLowerCase().includes(filter.toLowerCase()) ||
    p.land_code.toLowerCase().includes(filter.toLowerCase()) ||
    (p.district ?? '').toLowerCase().includes(filter.toLowerCase()) ||
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

  // WhatsApp message — area-level location only, no exact coords, no landmark
  const whatsappText = [
    '*Bluesquare Realty — Property Listings*',
    '',
    ...selectedProps.map((p, i) => {
      const locationParts = [p.village, p.taluk, p.district].filter(Boolean)
      const locationLine = locationParts.length > 0 ? `📍 ${locationParts.join(', ')}\n` : ''
      const areaLink = p.gps_lat && p.gps_lng
        ? `🗺 Area Map: ${areaMapUrl(p)}\n`
        : ''
      return (
        `*${i + 1}. ${p.title}*\n` +
        `${p.land_code} · ${p.type} · ${p.area} ${p.area_unit}\n` +
        `💰 ${formatCurrency(p.price)}\n` +
        locationLine +
        (p.facing ? `🧭 ${FACING_LABEL[p.facing] ?? p.facing} facing\n` : '') +
        areaLink
      )
    }),
    '---',
    'Contact us to schedule a site visit.',
  ].join('\n')

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

  return (
    <>
      {/* Print styles — professional A4 2-column layout */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm 12mm 16mm 12mm; }
          body * { visibility: hidden; }
          #brochure-print, #brochure-print * { visibility: visible; }
          #brochure-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
          .no-print { display: none !important; }
          .brochure-card {
            break-inside: avoid;
            page-break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          .brochure-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 14px !important;
          }
          .brochure-print-header {
            display: block !important;
            text-align: center;
            border-bottom: 2.5px solid #1d4ed8;
            padding-bottom: 10px;
            margin-bottom: 18px;
          }
        }
        @media screen {
          .brochure-print-header { display: none; }
        }
      `}</style>

      <div className="max-w-screen-xl space-y-6">

        {/* ── Controls (hidden in print) ── */}
        <div className="no-print space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Property Brochure / Catalog</h1>
              <p className="text-sm text-slate-500 mt-0.5">Select properties to print or share as a catalog</p>
            </div>
            {selected.size > 0 && (
              <div className="flex gap-2 flex-wrap">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Share2 size={15} />
                  Share {selected.size} via WhatsApp
                </a>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Printer size={15} />
                  Print / Save PDF ({selected.size})
                </button>
              </div>
            )}
          </div>

          {/* Filter + select controls */}
          <div className="flex items-center gap-3 flex-wrap bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter by title, code, district, type…"
                className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-72"
              />
            </div>
            <button onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Select All ({filtered.length})
            </button>
            {selected.size > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-medium">
                Clear All
              </button>
            )}
            <span className="ml-auto text-xs text-slate-400">{selected.size} selected · {filtered.length} shown</span>
          </div>

          {/* Thumbnail grid selector */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(p => {
                const isSelected = selected.has(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
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
                        <p className="text-xs text-slate-500">{p.type} · {p.area} {p.area_unit}</p>
                        <p className="text-xs font-bold text-blue-700 mt-0.5">{formatCurrency(p.price)}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-10 text-center text-slate-400 text-sm">
              No properties match your filter
            </div>
          )}

          {selected.size === 0 && filtered.length > 0 && (
            <p className="text-sm text-slate-400 text-center py-2">
              Select properties above to preview and generate the brochure
            </p>
          )}
        </div>

        {/* ── Brochure preview + print area ── */}
        {selected.size > 0 && (
          <div id="brochure-print">
            {/* Print-only page header */}
            <div className="brochure-print-header mb-6">
              <h1 className="text-2xl font-black text-blue-800 tracking-wide">BLUESQUARE REALTY</h1>
              <p className="text-slate-500 text-sm mt-1">
                Property Catalog &nbsp;·&nbsp;
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                &nbsp;·&nbsp; {selected.size} {selected.size === 1 ? 'Property' : 'Properties'}
              </p>
            </div>

            <div className="brochure-grid grid grid-cols-1 md:grid-cols-2 gap-6">
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
