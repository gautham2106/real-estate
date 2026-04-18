'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ShapePreviewProps {
  sideA: number  // front (road-facing)
  sideB: number  // right
  sideC: number  // back
  sideD: number  // left
  facing?: string
  unit?: string
}

function solveQuadrilateral(A: number, B: number, C: number, D: number) {
  const K = A * A + B * B + D * D - C * C
  const qa = A * A + B * B
  const qb = -K * B
  const qc = (K * K) / 4 - A * A * D * D
  const disc = qb * qb - 4 * qa * qc

  if (disc < 0 || qa === 0) return { x3: 0, y3: D }

  const sqrtDisc = Math.sqrt(disc)
  const y3a = (-qb + sqrtDisc) / (2 * qa)
  const y3b = (-qb - sqrtDisc) / (2 * qa)
  const x3a = (K / 2 - B * y3a) / A
  const x3b = (K / 2 - B * y3b) / A

  let x3: number, y3: number
  if (y3a > 0 && y3b > 0) {
    y3 = Math.abs(x3a) <= Math.abs(x3b) ? y3a : y3b
    x3 = Math.abs(x3a) <= Math.abs(x3b) ? x3a : x3b
  } else if (y3a > 0) {
    y3 = y3a; x3 = x3a
  } else if (y3b > 0) {
    y3 = y3b; x3 = x3b
  } else {
    y3 = Math.max(y3a, y3b)
    x3 = y3 === y3a ? x3a : x3b
  }
  return { x3, y3 }
}

function angleDeg(a: { x: number; y: number }, v: { x: number; y: number }, b: { x: number; y: number }): number {
  const v1x = a.x - v.x, v1y = a.y - v.y
  const v2x = b.x - v.x, v2y = b.y - v.y
  const dot = v1x * v2x + v1y * v2y
  const mag = Math.sqrt(v1x * v1x + v1y * v1y) * Math.sqrt(v2x * v2x + v2y * v2y)
  if (mag === 0) return 0
  return Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI)
}

function drawAngleArc(ctx: CanvasRenderingContext2D, v: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }, radius: number) {
  const dir1 = Math.atan2(a.y - v.y, a.x - v.x)
  const dir2 = Math.atan2(b.y - v.y, b.x - v.x)
  let diff = dir2 - dir1
  while (diff < -Math.PI) diff += 2 * Math.PI
  while (diff > Math.PI) diff -= 2 * Math.PI
  ctx.beginPath()
  ctx.arc(v.x, v.y, radius, dir1, dir2, diff < 0)
  ctx.strokeStyle = 'rgba(100,116,139,0.5)'
  ctx.lineWidth = Math.max(1, radius * 0.07)
  ctx.stroke()
}

function perp(from: { x: number; y: number }, to: { x: number; y: number }, outward: number) {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { nx: (-dy / len) * outward, ny: (dx / len) * outward }
}

function drawPlot(
  canvas: HTMLCanvasElement,
  A: number, B: number, C: number, D: number,
  facing: string | undefined,
  unit: string,
  large: boolean
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)

  const { x3, y3 } = solveQuadrilateral(A, B, C, D)
  const xMin = Math.min(0, x3)
  const xMax = Math.max(A, x3)
  const shapeW = xMax - xMin
  const shapeH = Math.max(B, y3)

  const pad = large ? 72 : 52
  const scale = Math.min((W - pad * 2) / shapeW, (H - pad * 2) / shapeH)
  const originX = pad + (-xMin) * scale
  const originY = H - pad

  const sx = (x: number) => originX + x * scale
  const sy = (y: number) => originY - y * scale

  const p0 = { x: sx(0), y: sy(0) }
  const p1 = { x: sx(A), y: sy(0) }
  const p2 = { x: sx(A), y: sy(B) }
  const p3 = { x: sx(x3), y: sy(y3) }

  // Background
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'
  ctx.lineWidth = 1
  const gridStep = large ? 60 : 40
  for (let gx = 0; gx < W; gx += gridStep) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
  for (let gy = 0; gy < H; gy += gridStep) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke() }

  // Plot shadow
  ctx.save()
  ctx.shadowColor = 'rgba(59,130,246,0.18)'
  ctx.shadowBlur = large ? 18 : 10
  ctx.shadowOffsetY = large ? 5 : 3
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.closePath()
  ctx.fillStyle = 'rgba(219,234,254,0.7)'
  ctx.fill()
  ctx.restore()

  // Plot border lines (B, C, D)
  ctx.setLineDash([])
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = large ? 2.5 : 1.8
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.lineTo(p0.x, p0.y)
  ctx.stroke()

  // Front side A — thick (road)
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.strokeStyle = '#1d4ed8'
  ctx.lineWidth = large ? 5 : 3.5
  ctx.stroke()

  // Road stripe below front
  const roadY = Math.max(p0.y, p1.y) + (large ? 12 : 8)
  ctx.beginPath()
  ctx.moveTo(Math.min(p0.x, p1.x) - 8, roadY)
  ctx.lineTo(Math.max(p0.x, p1.x) + 8, roadY)
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = large ? 3 : 2
  ctx.setLineDash([6, 4])
  ctx.stroke()
  ctx.setLineDash([])

  // Road label
  const midA = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
  const { nx: nAx, ny: nAy } = perp(p0, p1, -1)
  const labelOff = large ? 20 : 15
  ctx.font = `${large ? 10 : 8}px system-ui`
  ctx.fillStyle = '#64748b'
  ctx.textAlign = 'center'
  ctx.fillText('ROAD FACING', midA.x + nAx * labelOff, midA.y + nAy * labelOff + (large ? 14 : 10))

  // Corner dots
  const dotR = large ? 5 : 3.5
  ;[p0, p1, p2, p3].forEach(pt => {
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2)
    ctx.fillStyle = '#2563eb'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = large ? 2 : 1.5
    ctx.stroke()
  })

  // Angle arcs
  const arcR = large ? Math.max(20, Math.min(36, scale * 0.18)) : Math.max(14, Math.min(24, scale * 0.15))
  drawAngleArc(ctx, p0, p1, p3, arcR)
  drawAngleArc(ctx, p1, p0, p2, arcR)
  drawAngleArc(ctx, p2, p1, p3, arcR)
  drawAngleArc(ctx, p3, p2, p0, arcR)

  // Angle labels
  const angP0 = angleDeg(p1, p0, p3)
  const angP1 = angleDeg(p0, p1, p2)
  const angP2 = angleDeg(p1, p2, p3)
  const angP3 = angleDeg(p2, p3, p0)
  const cx = (p0.x + p1.x + p2.x + p3.x) / 4
  const cy = (p0.y + p1.y + p2.y + p3.y) / 4
  const angOff = arcR + (large ? 14 : 10)

  ctx.font = `${large ? 12 : 9}px system-ui`
  ctx.fillStyle = '#475569'
  ctx.textAlign = 'center'
  ;([
    [p0, angP0], [p1, angP1], [p2, angP2], [p3, angP3],
  ] as [{ x: number; y: number }, number][]).forEach(([pt, ang]) => {
    const dx = cx - pt.x, dy = cy - pt.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    ctx.fillText(`${ang}°`, pt.x + (dx / len) * angOff, pt.y + (dy / len) * angOff)
  })

  // Side dimension labels
  const dimFont = large ? 'bold 14px system-ui' : 'bold 10px system-ui'
  ctx.fillStyle = '#1e3a8a'

  // A — front
  ctx.font = dimFont
  ctx.textAlign = 'center'
  ctx.fillText(`${A} ${unit}`, midA.x + nAx * labelOff, midA.y + nAy * labelOff)

  // B — right side
  const { nx: nBx, ny: nBy } = perp(p1, p2, -1)
  const midB = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
  const angleB = Math.atan2(p2.y - p1.y, p2.x - p1.x)
  ctx.save()
  ctx.translate(midB.x + nBx * labelOff, midB.y + nBy * labelOff)
  ctx.rotate(angleB + Math.PI / 2)
  ctx.font = dimFont
  ctx.fillStyle = '#1e3a8a'
  ctx.fillText(`${B} ${unit}`, 0, 0)
  ctx.restore()

  // C — back
  const { nx: nCx, ny: nCy } = perp(p2, p3, -1)
  const midC = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 }
  const angleC = Math.atan2(p3.y - p2.y, p3.x - p2.x)
  ctx.save()
  ctx.translate(midC.x + nCx * labelOff, midC.y + nCy * labelOff)
  const rotC = angleC > Math.PI / 2 || angleC < -Math.PI / 2 ? angleC + Math.PI : angleC
  ctx.rotate(rotC)
  ctx.font = dimFont
  ctx.fillStyle = '#1e3a8a'
  ctx.fillText(`${C} ${unit}`, 0, 0)
  ctx.restore()

  // D — left side
  const { nx: nDx, ny: nDy } = perp(p3, p0, -1)
  const midD = { x: (p3.x + p0.x) / 2, y: (p3.y + p0.y) / 2 }
  const angleD = Math.atan2(p0.y - p3.y, p0.x - p3.x)
  ctx.save()
  ctx.translate(midD.x + nDx * labelOff, midD.y + nDy * labelOff)
  const rotD = angleD > Math.PI / 2 || angleD < -Math.PI / 2 ? angleD + Math.PI : angleD
  ctx.rotate(rotD)
  ctx.font = dimFont
  ctx.fillStyle = '#1e3a8a'
  ctx.fillText(`${D} ${unit}`, 0, 0)
  ctx.restore()

  // Compass badge
  if (facing) {
    const compassX = W - (large ? 40 : 28)
    const compassY = large ? 40 : 26
    const r = large ? 20 : 14
    ctx.beginPath()
    ctx.arc(compassX, compassY, r, 0, Math.PI * 2)
    ctx.fillStyle = '#eff6ff'
    ctx.fill()
    ctx.strokeStyle = '#93c5fd'
    ctx.lineWidth = large ? 2 : 1.5
    ctx.stroke()
    ctx.font = `bold ${large ? 13 : 10}px system-ui`
    ctx.fillStyle = '#1d4ed8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(facing, compassX, compassY)
    ctx.textBaseline = 'alphabetic'
  }
}

export default function ShapePreview({
  sideA, sideB, sideC, sideD, facing, unit = 'ft',
}: ShapePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [showModal, setShowModal] = useState(false)
  const allSet = sideA > 0 && sideB > 0 && sideC > 0 && sideD > 0

  const redraw = useCallback((canvas: HTMLCanvasElement | null, large: boolean) => {
    if (!canvas || !allSet) return
    drawPlot(canvas, sideA, sideB, sideC, sideD, facing, unit, large)
  }, [sideA, sideB, sideC, sideD, facing, unit, allSet])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!allSet) {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Enter all 4 side measurements', canvas.width / 2, canvas.height / 2 - 8)
      ctx.fillText('to preview exact plot shape', canvas.width / 2, canvas.height / 2 + 8)
      return
    }
    redraw(canvas, false)
  }, [redraw, allSet])

  useEffect(() => {
    if (showModal) {
      setTimeout(() => redraw(modalCanvasRef.current, true), 10)
    }
  }, [showModal, redraw])

  const perimeter = sideA + sideB + sideC + sideD

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-between w-full">
        <p className="text-xs font-semibold text-slate-600">Exact Plot Shape</p>
        {allSet && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            View Large ↗
          </button>
        )}
      </div>
      <div
        className={`relative w-full max-w-[280px] ${allSet ? 'cursor-zoom-in' : ''}`}
        onClick={() => allSet && setShowModal(true)}
        title={allSet ? 'Click to view full size' : undefined}
      >
        <canvas
          ref={canvasRef}
          width={280}
          height={220}
          className="rounded-xl border border-slate-200 bg-slate-50 w-full"
        />
        {allSet && (
          <div className="absolute bottom-2 right-2 bg-white/80 rounded-md px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200">
            click to expand
          </div>
        )}
      </div>
      {allSet && (
        <div className="flex gap-3 text-xs text-slate-500 self-start flex-wrap">
          <span>Perimeter: <strong className="text-slate-700">{perimeter} {unit}</strong></span>
          <span>·</span>
          <span>Sides: <strong className="text-slate-700">{sideA}×{sideB}×{sideC}×{sideD} {unit}</strong></span>
        </div>
      )}

      {/* Full-screen modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Plot Shape Diagram</h3>
                <p className="text-xs text-slate-500">
                  Front: {sideA} {unit} · Right: {sideB} {unit} · Back: {sideC} {unit} · Left: {sideD} {unit}
                  {facing ? ` · Facing: ${facing}` : ''}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-light"
              >
                ×
              </button>
            </div>
            <canvas
              ref={modalCanvasRef}
              width={600}
              height={480}
              className="w-full rounded-xl border border-slate-200 bg-slate-50"
            />
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span><strong className="text-slate-800">Perimeter:</strong> {perimeter} {unit}</span>
              <span><strong className="text-slate-800">Front (Road):</strong> {sideA} {unit}</span>
              <span><strong className="text-slate-800">Back:</strong> {sideC} {unit}</span>
              <span><strong className="text-slate-800">Right:</strong> {sideB} {unit}</span>
              <span><strong className="text-slate-800">Left:</strong> {sideD} {unit}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Corner angles calculated from actual measurements. Thick blue line = road-facing front.
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
