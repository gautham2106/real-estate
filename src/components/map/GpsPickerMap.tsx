'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lat: string
  lng: string
  onPick: (lat: number, lng: number) => void
}

export default function GpsPickerMap({ lat, lng, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)

  useEffect(() => {
    let map: import('leaflet').Map | null = null

    async function init() {
      const L = (await import('leaflet')).default

      // Fix default marker icon Webpack issue
      // @ts-expect-error leaflet types
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const container = containerRef.current
      if (!container) return

      const initLat = lat ? parseFloat(lat) : 11.1271
      const initLng = lng ? parseFloat(lng) : 78.6569
      const hasPin = !!(lat && lng)

      map = L.map(container, { zoomControl: true }).setView([initLat, initLng], hasPin ? 15 : 8)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Place initial pin if coordinates exist
      if (hasPin) {
        markerRef.current = L.marker([initLat, initLng], { draggable: true }).addTo(map)
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng()
          onPick(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)))
        })
      }

      // Click to drop/move pin
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng
        const roundLat = parseFloat(clickLat.toFixed(6))
        const roundLng = parseFloat(clickLng.toFixed(6))

        if (markerRef.current) {
          markerRef.current.setLatLng([roundLat, roundLng])
        } else {
          markerRef.current = L.marker([roundLat, roundLng], { draggable: true }).addTo(map!)
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current!.getLatLng()
            onPick(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)))
          })
        }
        onPick(roundLat, roundLng)
      })
    }

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external lat/lng changes (e.g. manual input) → move marker
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return
    const L_marker = markerRef.current
    const parsedLat = parseFloat(lat)
    const parsedLng = parseFloat(lng)
    if (isNaN(parsedLat) || isNaN(parsedLng)) return

    async function syncPin() {
      const L = (await import('leaflet')).default
      if (!mapRef.current) return
      if (L_marker) {
        L_marker.setLatLng([parsedLat, parsedLng])
      } else {
        markerRef.current = L.marker([parsedLat, parsedLng], { draggable: true }).addTo(mapRef.current)
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng()
          onPick(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)))
        })
      }
      mapRef.current.setView([parsedLat, parsedLng], Math.max(mapRef.current.getZoom(), 15))
    }
    syncPin()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div ref={containerRef} className="w-full h-full rounded-lg" />
    </>
  )
}
