'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MapPin, Share2, Check, Navigation } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Property } from '@/types'

const BrokerPropertyMap = dynamic(
  () => import('@/components/map/BrokerPropertyMap'),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" /> },
)

interface Props {
  property: Property
  role: 'admin' | 'broker' | null
}

function buildWhatsAppText(property: Property): string {
  const location = [property.village, property.taluk, property.district].filter(Boolean).join(', ')
  const price = formatCurrency(property.price)
  const ppsf = property.price_per_sqft ? ` | ₹${property.price_per_sqft}/sqft` : ''

  const lines = [
    `🏡 *${property.land_code} — ${property.title}*`,
    location ? `📍 ${location}` : null,
    '',
    `📐 *${property.area} ${property.area_unit}*  (${property.type} · ${property.classification})`,
    `💰 *${price}*${ppsf}`,
    '',
    property.facing ? `🧭 Facing: ${property.facing}` : null,
    property.road_access && property.road_access !== 'No'
      ? `🛣️ Road Access: ${property.road_access}` : null,
    property.water && property.water !== 'No'
      ? `💧 Water: ${property.water}` : null,
    property.electricity ? `⚡ Electricity: Yes` : null,
    property.dtcp_approved === 'Yes' ? `✅ DTCP Approved` : null,
    property.legal_status === 'Clear' ? `📋 Legal Status: Clear` : null,
    '',
    `_Interested? Contact us for site visit & exact location._`,
  ].filter(l => l !== null).join('\n')

  return lines
}

export default function PropertyLocationSection({ property, role }: Props) {
  const [copied, setCopied] = useState(false)
  const isAdmin = role === 'admin'
  const hasGps = !!(property.gps_lat && property.gps_lng)

  const whatsappText = buildWhatsAppText(property)
  const waUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

  async function copyText() {
    await navigator.clipboard.writeText(whatsappText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Map */}
      <div className="relative h-64 sm:h-80">
        {hasGps ? (
          <>
            <BrokerPropertyMap
              lat={property.gps_lat!}
              lng={property.gps_lng!}
              title={property.title}
              mode={isAdmin ? 'exact' : 'approximate'}
            />
            {/* Badge overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <MapPin size={11} className="text-blue-500" />
                {isAdmin ? 'Exact location' : 'Property within 200 m of this circle'}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2">
            <MapPin size={28} className="text-slate-300" />
            <p className="text-sm text-slate-400">No GPS coordinates set</p>
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</p>
          <p className="text-sm text-slate-700 mt-0.5">
            {[property.village, property.taluk, property.district].filter(Boolean).join(', ') || 'Not specified'}
          </p>
          {isAdmin && property.address && (
            <p className="text-xs text-slate-400 mt-0.5">{property.address}</p>
          )}
          {!isAdmin && (
            <p className="text-xs text-slate-400 mt-0.5">Exact address available after site visit confirmation</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Admin: exact Google Maps link */}
          {isAdmin && hasGps && (
            <a
              href={`https://www.google.com/maps?q=${property.gps_lat},${property.gps_lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Navigation size={13} />
              Get Directions
            </a>
          )}

          {/* Copy text */}
          <button
            onClick={copyText}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors"
          >
            {copied ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
            {copied ? 'Copied!' : 'Copy Details'}
          </button>

          {/* WhatsApp share */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share via WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
