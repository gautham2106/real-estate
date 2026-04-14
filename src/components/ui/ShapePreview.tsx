'use client'

import { useEffect, useRef } from 'react'

interface ShapePreviewProps {
  sideA: number
  sideB: number
  sideC: number
  sideD: number
  unit?: string
}

export default function ShapePreview({ sideA, sideB, sideC, sideD, unit = 'ft' }: ShapePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const allSet = sideA > 0 && sideB > 0 && sideC > 0 && sideD > 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    if (!allSet) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Enter all 4 measurements', W / 2, H / 2 - 8)
      ctx.fillText('to preview shape', W / 2, H / 2 + 8)
      return
    }

    // Scale sides to fit canvas with padding
    const pad = 36
    const scaleX = (W - pad * 2) / Math.max(sideA, sideC)
    const scaleY = (H - pad * 2) / Math.max(sideB, sideD)
    const scale = Math.min(scaleX, scaleY)

    const a = sideA * scale
    const b = sideB * scale
    const c = sideC * scale
    const d = sideD * scale

    // Start from top-left, going clockwise
    const startX = (W - a) / 2
    const startY = pad

    const p0 = { x: startX, y: startY }             // top-left
    const p1 = { x: startX + a, y: startY }         // top-right (after side A)
    const p2 = { x: startX + a, y: startY + b }     // bottom-right (after side B)
    const p3 = { x: startX + a - c, y: startY + b } // bottom-left (after side C)
    // p3 back to p0 is side D

    // Draw filled shape
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.closePath()
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'
    ctx.fill()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()

    // Corner dots
    const corners = [p0, p1, p2, p3]
    corners.forEach(pt => {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#3b82f6'
      ctx.fill()
    })

    // Side labels
    ctx.fillStyle = '#1e40af'
    ctx.font = 'bold 10px system-ui'
    ctx.textAlign = 'center'

    // A (top)
    ctx.fillText(`${sideA}${unit}`, (p0.x + p1.x) / 2, p0.y - 10)
    // B (right)
    ctx.save()
    ctx.translate(p1.x + 14, (p1.y + p2.y) / 2)
    ctx.rotate(Math.PI / 2)
    ctx.fillText(`${sideB}${unit}`, 0, 0)
    ctx.restore()
    // C (bottom)
    ctx.fillText(`${sideC}${unit}`, (p2.x + p3.x) / 2, p2.y + 14)
    // D (left)
    ctx.save()
    ctx.translate(Math.min(p0.x, p3.x) - 14, (p0.y + p3.y) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`${sideD}${unit}`, 0, 0)
    ctx.restore()

  }, [sideA, sideB, sideC, sideD, allSet, unit])

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-slate-500 self-start">Shape Preview</p>
      <canvas
        ref={canvasRef}
        width={220}
        height={180}
        className="rounded-xl border border-slate-200 bg-slate-50"
      />
      {allSet && (
        <p className="text-xs text-slate-400">
          {sideA}×{sideB} (approx {Math.round(sideA * sideB)} sq{unit})
        </p>
      )}
    </div>
  )
}
