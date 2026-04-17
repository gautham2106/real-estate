'use client'

import { useEffect } from 'react'
import type { Property } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  properties: Property[]
  selected: string | null
  onSelect: (id: string | null) => void
}

const statusColor: Record<string, string> = {
  'Available': '#22c55e',
  'Negotiating': '#f97316',
  'Token Received': '#f97316',
  'MOU Signed': '#60a5fa',
  'Sold': '#2563eb',
  'On Hold': '#94a3b8',
}

export default function PropertyMap({ properties, selected, onSelect }: Props) {
  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    let map: import('leaflet').Map | null = null

    async function initMap() {
      const L = (await import('leaflet')).default

      // Fix default marker icon paths broken by Webpack
      // @ts-expect-error leaflet types
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const container = document.getElementById('leaflet-map')
      if (!container) return

      // Centre on Tamil Nadu if no GPS properties
      const geoProps = properties.filter(p => p.gps_lat && p.gps_lng)
      const center: [number, number] = geoProps.length > 0
        ? [geoProps[0].gps_lat!, geoProps[0].gps_lng!]
        : [11.1271, 78.6569]

      map = L.map(container, { zoomControl: true }).setView(center, geoProps.length > 1 ? 9 : 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      geoProps.forEach(p => {
        const color = statusColor[p.status] ?? '#94a3b8'
        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            width:12px;height:12px;
            border-radius:50%;
            border:2px solid white;
            box-shadow:0 1px 3px rgba(0,0,0,0.4);
          "></div>`,
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })

        const marker = L.marker([p.gps_lat!, p.gps_lng!], { icon })
          .addTo(map!)
          .bindPopup(`
            <div style="min-width:180px;font-family:sans-serif">
              <p style="font-size:11px;color:#64748b;margin:0">${p.land_code}</p>
              <p style="font-weight:600;font-size:13px;margin:2px 0 4px">${p.title}</p>
              <p style="font-size:12px;color:#1d4ed8;font-weight:600;margin:0">${formatCurrency(p.price)}</p>
              <p style="font-size:11px;color:#64748b;margin:2px 0">${p.area} ${p.area_unit} · ${p.status}</p>
              ${p.gps_lat && p.gps_lng ? `<a href="https://www.google.com/maps?q=${p.gps_lat},${p.gps_lng}" target="_blank" style="font-size:11px;color:#16a34a">📍 Get Directions</a>` : ''}
            </div>
          `)

        marker.on('click', () => onSelect(p.id === selected ? null : p.id))
      })

      // Fit bounds if multiple GPS properties
      if (geoProps.length > 1) {
        const bounds = L.latLngBounds(geoProps.map(p => [p.gps_lat!, p.gps_lng!]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    initMap()

    return () => {
      map?.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div id="leaflet-map" className="w-full h-full rounded-xl" />
      {properties.filter(p => p.gps_lat && p.gps_lng).length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 rounded-xl pointer-events-none">
          <p className="text-slate-500 text-sm font-medium">No GPS coordinates set</p>
          <p className="text-slate-400 text-xs mt-1">Add GPS lat/lng to properties to show pins</p>
        </div>
      )}
    </div>
  )
}
