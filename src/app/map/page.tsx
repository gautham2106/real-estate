'use client'

import { useState } from 'react'
import { MapPin, MessageCircle, Share2, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { mockProperties } from '@/lib/mock-data'
import type { PropertyType, PropertyStatus } from '@/types'

const statusDot: Record<string, string> = {
  'Available': 'bg-green-500',
  'Negotiating': 'bg-orange-400',
  'Token Received': 'bg-orange-500',
  'MOU Signed': 'bg-blue-400',
  'Sold': 'bg-blue-600',
  'On Hold': 'bg-gray-400',
}

const ALL_TYPES: PropertyType[] = ['Plot', 'House', 'Farm', 'Commercial']

export default function PublicMapPage() {
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'All'>('All')
  const [priceMax, setPriceMax] = useState(10000000)
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = mockProperties.filter(p => {
    if (typeFilter !== 'All' && p.type !== typeFilter) return false
    if (p.price > priceMax) return false
    return true
  })

  const selectedProp = filtered.find(p => p.id === selected)

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      alert('Map link copied!')
    }
  }

  return (
    <div className="space-y-4 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Public Property Map</h2>
          <p className="text-sm text-slate-500">{filtered.length} properties available · Shareable public view</p>
        </div>
        <button onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Share2 size={14} />
          Share Map
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap bg-white rounded-xl border border-slate-200 p-3">
        <Filter size={15} className="text-slate-400" />
        <div className="flex gap-1.5">
          {(['All', ...ALL_TYPES] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t as typeof typeFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-slate-500">Max price:</span>
          <select value={priceMax} onChange={e => setPriceMax(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={1000000}>Under ₹10L</option>
            <option value={2500000}>Under ₹25L</option>
            <option value={5000000}>Under ₹50L</option>
            <option value={10000000}>Under ₹1Cr</option>
            <option value={99999999}>Any price</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Map Placeholder */}
        <div className="lg:col-span-3 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden" style={{ minHeight: '480px' }}>
          <div className="h-full flex flex-col items-center justify-center p-8 text-center relative">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />
            <MapPin size={48} className="text-blue-400 mb-4" />
            <h3 className="font-bold text-slate-700 text-lg mb-1">Google Maps Integration</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Set <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the live map with property pins.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id === selected ? null : p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected === p.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusDot[p.status] ?? 'bg-gray-400'}`} />
                  {p.land_code}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              {[
                { color: 'bg-green-500', label: 'Available' },
                { color: 'bg-orange-400', label: 'Negotiating' },
                { color: 'bg-blue-600', label: 'Sold' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property List Panel */}
        <div className="lg:col-span-2 space-y-3 overflow-y-auto" style={{ maxHeight: '540px' }}>
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => setSelected(p.id === selected ? null : p.id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                selected === p.id ? 'border-blue-500 shadow-md ring-1 ring-blue-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot[p.status] ?? 'bg-gray-400'}`} />
                  <span className="font-mono text-xs text-blue-700">{p.land_code}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{p.type}</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-1">{p.title}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                <div><span className="text-slate-400">Area:</span> {p.area} {p.area_unit}</div>
                <div><span className="text-slate-400">Price:</span> <span className="font-semibold text-slate-800">{formatCurrency(p.price)}</span></div>
                <div><span className="text-slate-400">Location:</span> {p.village}, {p.district}</div>
                {p.facing && <div><span className="text-slate-400">Facing:</span> {p.facing}</div>}
              </div>
              <div className="flex gap-1.5 text-xs">
                {p.road_access && p.road_access !== 'No' && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200">Road ✓</span>
                )}
                {p.water && p.water !== 'No' && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">Water ✓</span>
                )}
                {p.electricity && (
                  <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">Power ✓</span>
                )}
              </div>
              <a
                href={`https://wa.me/919876543210?text=Hi, I'm interested in property ${p.land_code} — ${p.title}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle size={13} />
                WhatsApp Enquiry
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="text-center py-3 text-xs text-slate-400">
        Powered by <span className="font-bold text-blue-600">Bluesquare Real Estate</span> · All listings subject to availability
      </div>
    </div>
  )
}
