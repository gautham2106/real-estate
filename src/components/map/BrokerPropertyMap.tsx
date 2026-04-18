'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  title?: string
  /** 'approximate' = 200m circle, no pin (broker view)
   *  'exact'       = precise pin + directions link (admin view) */
  mode?: 'approximate' | 'exact'
}

export default function BrokerPropertyMap({ lat, lng, title, mode = 'approximate' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: import('leaflet').Map | null = null

    async function init() {
      const L = (await import('leaflet')).default

      // @ts-expect-error webpack icon fix
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const container = containerRef.current
      if (!container) return

      map = L.map(container, { zoomControl: true }).setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (mode === 'approximate') {
        // 200 m radius circle — no exact pin
        L.circle([lat, lng], {
          radius: 200,
          color: '#2563eb',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
        }).addTo(map)

        // Pulse dot at center to indicate "inside here"
        L.circleMarker([lat, lng], {
          radius: 6,
          color: '#fff',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 0.9,
        }).addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px">
              ${title ? `<strong style="font-size:13px">${title}</strong><br>` : ''}
              <span style="color:#64748b">Property is within this 200 m area</span>
             </div>`,
          )
      } else {
        // Exact pin with directions link
        const icon = L.divIcon({
          html: `<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;min-width:160px">
              ${title ? `<strong style="font-size:13px">${title}</strong><br>` : ''}
              <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank"
                 style="color:#16a34a;font-size:11px">📍 Open in Google Maps</a>
             </div>`,
          )
          .openPopup()
      }
    }

    init()
    return () => { map?.remove() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div ref={containerRef} className="w-full h-full rounded-xl" />
    </>
  )
}
