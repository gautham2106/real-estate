'use client'

import { useEffect, useRef } from 'react'

interface ShapePreviewProps {
  sideA: number  // front (road-facing)
  sideB: number  // right
  sideC: number  // back
  sideD: number  // left
  facing?: string
  unit?: string
}

// Compute exact quadrilateral vertices given 4 side lengths.
// Convention: A = front (bottom), B = right, C = back (top), D = left.
// Fix P0=(0,0) bottom-left, P1=(A,0) bottom-right, P2=(A,B) top-right (B goes straight up),
// then solve for P3 = (x3,y3) such that |P3|=D and |P3-P2|=C.
function solveQuadrilateral(A: number, B: number, C: number, D: number) {
  // From constraints: x3²+y3²=D² and (x3-A)²+(y3-B)²=C²
  // Expanding and subtracting: 2A·x3 + 2B·y3 = A²+B²+D²-C²
  const K = A * A + B * B + D * D - C * C
  // (A²+B²)·y3² - K·B·y3 + K²/4 - A²·D² = 0
  const qa = A * A + B * B
  const qb = -K * B
  const qc = (K * K) / 4 - A * A * D * D
  const disc = qb * qb - 4 * qa * qc

  if (disc < 0 || qa === 0) {
    // Degenerate — fall back to parallelogram-like shape
    return { x3: 0, y3: D }
  }

  const sqrtDisc = Math.sqrt(disc)
  const y3a = (-qb + sqrtDisc) / (2 * qa)
  const y3b = (-qb - sqrtDisc) / (2 * qa)

  // Pick the y3 that gives a shape that looks like a real plot (y3 > 0, x3 reasonable)
  let x3: number, y3: number
  const x3a = (K / 2 - B * y3a) / A
  const x3b = (K / 2 - B * y3b) / A

  // Prefer solution where y3 > 0 and x3 is closest to 0 (less skewed left side)
  if (y3a > 0 && y3b > 0) {
    // Pick the one with x3 closer to 0 (more upright left side)
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

function angleDeg(
  a: { x: number; y: number },
  v: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const v1x = a.x - v.x, v1y = a.y - v.y
  const v2x = b.x - v.x, v2y = b.y - v.y
  const dot = v1x * v2x + v1y * v2y
  const mag = Math.sqrt(v1x * v1x + v1y * v1y) * Math.sqrt(v2x * v2x + v2y * v2y)
  if (mag === 0) return 0
  return Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI)
}

function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  v: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
  radius: number
) {
  const dir1 = Math.atan2(a.y - v.y, a.x - v.x)
  const dir2 = Math.atan2(b.y - v.y, b.x - v.x)
  let diff = dir2 - dir1
  while (diff < -Math.PI) diff += 2 * Math.PI
  while (diff > Math.PI) diff -= 2 * Math.PI
  ctx.beginPath()
  ctx.arc(v.x, v.y, radius, dir1, dir2, diff < 0)
  ctx.strokeStyle = 'rgba(100,116,139,0.5)'
  ctx.lineWidth = 1
  ctx.stroke()
}

function perp(
  from: { x: number; y: number },
  to: { x: number; y: number },
  outward: number // +1 = left of direction, -1 = right
): { nx: number; ny: number } {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { nx: (-dy / len) * outward, ny: (dx / len) * outward }
}

export default function ShapePreview({
  sideA, sideB, sideC, sideD, facing, unit = 'ft',
}: ShapePreviewProps) {
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
      ctx.fillText('Enter all 4 side measurements', W / 2, H / 2 - 8)
      ctx.fillText('to preview exact plot shape', W / 2, H / 2 + 8)
      return
    }

    const A = sideA, B = sideB, C = sideC, D = sideD
    const { x3, y3 } = solveQuadrilateral(A, B, C, D)

    // Bounding box in math coords (y up)
    const xMin = Math.min(0, x3)
    const xMax = Math.max(A, x3)
    const yMax = Math.max(B, y3)
    const shapeW = xMax - xMin
    const shapeH = yMax

    const pad = 48
    const scaleX = (W - pad * 2) / shapeW
    const scaleY = (H - pad * 2) / shapeH
    const scale = Math.min(scaleX, scaleY)

    // Screen origin: bottom-left of bounding box
    const originX = pad + (-xMin) * scale
    const originY = H - pad

    // Convert math (x,y) → screen (sx, sy): y flips
    const sx = (x: number) => originX + x * scale
    const sy = (y: number) => originY - y * scale

    const p0 = { x: sx(0), y: sy(0) }
    const p1 = { x: sx(A), y: sy(0) }
    const p2 = { x: sx(A), y: sy(B) }
    const p3 = { x: sx(x3), y: sy(y3) }

    // ── Grid / ground shadow ──────────────────────────────────────────────────
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    // ── Plot fill ─────────────────────────────────────────────────────────────
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.closePath()
    ctx.fillStyle = 'rgba(219,234,254,0.55)'
    ctx.fill()

    // ── Side B (right), C (back), D (left) ───────────────────────────────────
    ctx.setLineDash([])
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1.5

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.lineTo(p0.x, p0.y)
    ctx.stroke()

    // ── Front side A — thick blue (road) ─────────────────────────────────────
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineWidth = 3
    ctx.stroke()

    // ── Road indicator below front ────────────────────────────────────────────
    const roadY = Math.max(p0.y, p1.y) + 9
    ctx.beginPath()
    ctx.moveTo(Math.min(p0.x, p1.x) - 6, roadY)
    ctx.lineTo(Math.max(p0.x, p1.x) + 6, roadY)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // ── Corner dots ───────────────────────────────────────────────────────────
    ;[p0, p1, p2, p3].forEach(pt => {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#2563eb'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // ── Angle arcs ────────────────────────────────────────────────────────────
    const arcR = Math.max(12, Math.min(22, scale * 0.15))
    drawAngleArc(ctx, p0, p1, p3, arcR)
    drawAngleArc(ctx, p1, p0, p2, arcR)
    drawAngleArc(ctx, p2, p1, p3, arcR)
    drawAngleArc(ctx, p3, p2, p0, arcR)

    // ── Corner angle text ─────────────────────────────────────────────────────
    const angP0 = angleDeg(p1, p0, p3)
    const angP1 = angleDeg(p0, p1, p2)
    const angP2 = angleDeg(p1, p2, p3)
    const angP3 = angleDeg(p2, p3, p0)

    ctx.font = '9px system-ui'
    ctx.fillStyle = '#475569'
    ctx.textAlign = 'center'

    // Offset each label toward the interior (centroid direction)
    const cx = (p0.x + p1.x + p2.x + p3.x) / 4
    const cy = (p0.y + p1.y + p2.y + p3.y) / 4
    const angleLabelOffset = arcR + 9

    ;([
      [p0, angP0], [p1, angP1], [p2, angP2], [p3, angP3],
    ] as [{ x: number; y: number }, number][]).forEach(([pt, ang]) => {
      const dx = cx - pt.x, dy = cy - pt.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const lx = pt.x + (dx / len) * angleLabelOffset
      const ly = pt.y + (dy / len) * angleLabelOffset
      ctx.fillText(`${ang}°`, lx, ly)
    })

    // ── Side dimension labels ─────────────────────────────────────────────────
    ctx.font = 'bold 10px system-ui'
    ctx.fillStyle = '#1e3a8a'
    const labelOff = 14

    // A — front (below)
    const { nx: nAx, ny: nAy } = perp(p0, p1, -1) // below the line (outward downward)
    const midA = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
    ctx.textAlign = 'center'
    ctx.fillText(`${A} ${unit}`, midA.x + nAx * labelOff, midA.y + nAy * labelOff)

    // B — right side
    const { nx: nBx, ny: nBy } = perp(p1, p2, -1)
    const midB = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    const angleB = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    ctx.save()
    ctx.translate(midB.x + nBx * labelOff, midB.y + nBy * labelOff)
    ctx.rotate(angleB + Math.PI / 2)
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
    ctx.fillText(`${D} ${unit}`, 0, 0)
    ctx.restore()

    // ── Compass ───────────────────────────────────────────────────────────────
    if (facing) {
      const compassX = W - 24, compassY = 24
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#1d4ed8'
      ctx.fillText(facing, compassX, compassY + 4)
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(compassX, compassY, 12, 0, Math.PI * 2)
      ctx.stroke()
    }

    // ── "FRONT / ROAD" label ──────────────────────────────────────────────────
    ctx.font = '8px system-ui'
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'center'
    ctx.fillText('ROAD FACING', midA.x, midA.y + nAy * labelOff + 10)

  }, [sideA, sideB, sideC, sideD, facing, allSet, unit])

  const perimeter = sideA + sideB + sideC + sideD

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-slate-600 self-start">Exact Plot Shape</p>
      <canvas
        ref={canvasRef}
        width={260}
        height={210}
        className="rounded-xl border border-slate-200 bg-slate-50 w-full max-w-[260px]"
      />
      {allSet && (
        <div className="flex gap-3 text-xs text-slate-500 self-start">
          <span>Perimeter: <strong className="text-slate-700">{perimeter} {unit}</strong></span>
          <span>·</span>
          <span>Diagonal ≈ <strong className="text-slate-700">{Math.round(Math.sqrt(sideA * sideA + sideB * sideB))} {unit}</strong></span>
        </div>
      )}
    </div>
  )
}
