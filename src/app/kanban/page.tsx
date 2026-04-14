'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Kanban, Filter } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { formatCurrency, cn } from '@/lib/utils'
import { mockDeals, mockProperties, mockBrokers, mockBuyerLeads } from '@/lib/mock-data'
import type { Deal, DealStatus } from '@/types'

const propertyMap = Object.fromEntries(mockProperties.map((p) => [p.id, p]))
const brokerMap = Object.fromEntries(mockBrokers.map((b) => [b.broker_id, b.name]))
const buyerMap = Object.fromEntries(mockBuyerLeads.map((l) => [l.id, l.name]))

const COLUMNS: { status: DealStatus; bg: string; header: string; border: string }[] = [
  { status: 'Created',                bg: 'bg-slate-50',  header: 'bg-slate-100',  border: 'border-t-slate-400' },
  { status: 'Site Visit Done',        bg: 'bg-slate-50',  header: 'bg-slate-100',  border: 'border-t-blue-300' },
  { status: 'Negotiation Active',     bg: 'bg-yellow-50', header: 'bg-yellow-100', border: 'border-t-yellow-400' },
  { status: 'Token Paid',             bg: 'bg-blue-50',   header: 'bg-blue-100',   border: 'border-t-blue-500' },
  { status: 'MOU Signed',             bg: 'bg-purple-50', header: 'bg-purple-100', border: 'border-t-purple-500' },
  { status: 'Documents Verified',     bg: 'bg-indigo-50', header: 'bg-indigo-100', border: 'border-t-indigo-500' },
  { status: 'Loan Processing',        bg: 'bg-cyan-50',   header: 'bg-cyan-100',   border: 'border-t-cyan-500' },
  { status: 'Registration Scheduled', bg: 'bg-orange-50', header: 'bg-orange-100', border: 'border-t-orange-400' },
  { status: 'Registration Done',      bg: 'bg-teal-50',   header: 'bg-teal-100',   border: 'border-t-teal-500' },
  { status: 'Closed Won',             bg: 'bg-green-50',  header: 'bg-green-100',  border: 'border-t-green-500' },
  { status: 'Closed Lost',            bg: 'bg-red-50',    header: 'bg-red-100',    border: 'border-t-red-500' },
]

function daysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

// Spread mock deals across columns for demo
const spreadDeals: Deal[] = [
  { ...mockDeals[0], id: '1',  deal_id: 'DEAL-001', status: 'Token Paid',              deal_value: 1750000, buyer_broker_id: 'BRK-001', created_at: '2026-03-20T10:00:00Z' },
  { ...mockDeals[0], id: '2',  deal_id: 'DEAL-002', status: 'Created',                 deal_value: 2200000, buyer_broker_id: 'BRK-002', created_at: '2026-04-10T10:00:00Z' },
  { ...mockDeals[0], id: '3',  deal_id: 'DEAL-003', status: 'Negotiation Active',      deal_value: 4500000, buyer_broker_id: 'BRK-003', created_at: '2026-03-28T10:00:00Z' },
  { ...mockDeals[0], id: '4',  deal_id: 'DEAL-004', status: 'Site Visit Done',         deal_value: 3200000, buyer_broker_id: 'BRK-001', created_at: '2026-04-05T10:00:00Z' },
  { ...mockDeals[0], id: '5',  deal_id: 'DEAL-005', status: 'MOU Signed',              deal_value: 5800000, buyer_broker_id: 'BRK-002', created_at: '2026-03-15T10:00:00Z' },
  { ...mockDeals[0], id: '6',  deal_id: 'DEAL-006', status: 'Documents Verified',      deal_value: 1200000, buyer_broker_id: 'BRK-003', created_at: '2026-03-01T10:00:00Z' },
  { ...mockDeals[0], id: '7',  deal_id: 'DEAL-007', status: 'Loan Processing',         deal_value: 2900000, buyer_broker_id: 'BRK-001', created_at: '2026-02-20T10:00:00Z' },
  { ...mockDeals[0], id: '8',  deal_id: 'DEAL-008', status: 'Registration Scheduled',  deal_value: 3600000, buyer_broker_id: 'BRK-002', created_at: '2026-02-10T10:00:00Z' },
  { ...mockDeals[0], id: '9',  deal_id: 'DEAL-009', status: 'Closed Won',              deal_value: 4100000, buyer_broker_id: 'BRK-001', created_at: '2026-01-25T10:00:00Z' },
  { ...mockDeals[0], id: '10', deal_id: 'DEAL-010', status: 'Closed Lost',             deal_value: 1800000, buyer_broker_id: 'BRK-003', created_at: '2026-03-05T10:00:00Z' },
  { ...mockDeals[0], id: '11', deal_id: 'DEAL-011', status: 'Registration Done',       deal_value: 2700000, buyer_broker_id: 'BRK-002', created_at: '2026-02-01T10:00:00Z' },
  { ...mockDeals[0], id: '12', deal_id: 'DEAL-012', status: 'Created',                 deal_value: 6200000, buyer_broker_id: 'BRK-003', created_at: '2026-04-13T10:00:00Z' },
]

// ─── Deal Card ────────────────────────────────────────────────────────────────

interface CardProps {
  deal: Deal
  isDragging?: boolean
}

function DealCard({ deal, isDragging = false }: CardProps) {
  const prop = propertyMap[deal.property_id]
  const brokerName = deal.buyer_broker_id ? brokerMap[deal.buyer_broker_id] ?? deal.buyer_broker_id : '—'
  const buyerName = buyerMap[deal.buyer_lead_id] ?? 'Unknown'
  const days = daysSince(deal.created_at)
  const daysStale = days > 14

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-3 shadow-sm select-none',
        isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-blue-400 rotate-1'
          : 'hover:shadow-md hover:border-blue-300 transition-all duration-150',
      )}
    >
      {/* Land code (monospace, top) */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="font-bold text-xs text-blue-700 font-mono">
          {prop?.land_code ?? deal.property_id}
        </span>
        <span className="text-xs text-slate-400 shrink-0">{deal.deal_id}</span>
      </div>

      {/* Buyer name */}
      <p className="text-xs font-medium text-slate-800 mb-1 truncate">{buyerName}</p>

      {/* Deal value */}
      <p className="text-sm font-bold text-slate-900">{formatCurrency(deal.deal_value)}</p>

      {/* Broker pill + days badge */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full truncate max-w-[110px]">
          {brokerName}
        </span>
        <span
          className={cn(
            'text-xs font-semibold px-1.5 py-0.5 rounded shrink-0',
            daysStale ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500',
          )}
        >
          {days}d
        </span>
      </div>
    </div>
  )
}

// ─── Sortable Card ────────────────────────────────────────────────────────────

function SortableCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <DealCard deal={deal} isDragging={isDragging} />
    </div>
  )
}

// ─── Column (droppable) ───────────────────────────────────────────────────────

function KanbanColumn({
  col,
  cards,
}: {
  col: (typeof COLUMNS)[number]
  cards: Deal[]
}) {
  const { setNodeRef } = useSortable({
    id: col.status,
    data: { isColumn: true, status: col.status },
    disabled: true,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border border-slate-200 flex flex-col w-64 shrink-0 border-t-4',
        col.bg,
        col.border,
      )}
    >
      {/* Column Header */}
      <div className={cn('px-3 py-2.5 rounded-t-xl border-b border-slate-200', col.header)}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 leading-tight">{col.status}</span>
          <span className="bg-white text-slate-600 text-xs font-bold rounded-full px-2 py-0.5 min-w-[24px] text-center shadow-sm shrink-0">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={cards.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
          {cards.length === 0 && (
            <div className="flex-1 flex items-center justify-center min-h-[80px] border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-xs text-slate-300 text-center">Drop here</p>
            </div>
          )}
          {cards.map((deal) => (
            <SortableCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>

      {/* Column footer with total value */}
      {cards.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-200 rounded-b-xl">
          <p className="text-xs text-slate-500">
            Total:{' '}
            <span className="font-semibold text-slate-700">
              {formatCurrency(cards.reduce((s, d) => s + d.deal_value, 0))}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface KanbanPageProps {
  initialDeals?: Deal[]
}

export default function KanbanPage({ initialDeals = spreadDeals }: KanbanPageProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [brokerFilter, setBrokerFilter] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) ?? null : null

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (brokerFilter && deal.buyer_broker_id !== brokerFilter) return false
      if (minValue && deal.deal_value < Number(minValue)) return false
      if (maxValue && deal.deal_value > Number(maxValue)) return false
      return true
    })
  }, [deals, brokerFilter, minValue, maxValue])

  const dealsByStatus = useMemo(() => {
    const map: Record<string, Deal[]> = {}
    COLUMNS.forEach((col) => { map[col.status] = [] })
    filteredDeals.forEach((deal) => {
      if (map[deal.status]) map[deal.status].push(deal)
    })
    return map
  }, [filteredDeals])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeItemId = active.id as string
    const overId = over.id as string

    if (activeItemId === overId) return

    const activeDealItem = deals.find((d) => d.id === activeItemId)
    if (!activeDealItem) return

    // Determine target status: either dragged onto a column header or another card
    const overIsColumn = COLUMNS.some((c) => c.status === overId)
    const overDeal = deals.find((d) => d.id === overId)
    const targetStatus: DealStatus = overIsColumn
      ? (overId as DealStatus)
      : overDeal
        ? overDeal.status
        : activeDealItem.status

    if (activeDealItem.status === targetStatus) {
      // Reorder within same column
      setDeals((prev) => {
        const colDeals = prev.filter((d) => d.status === targetStatus)
        const oldIdx = colDeals.findIndex((d) => d.id === activeItemId)
        const newIdx = overDeal ? colDeals.findIndex((d) => d.id === overId) : colDeals.length - 1
        if (oldIdx === -1 || newIdx === -1) return prev
        const reordered = arrayMove(colDeals, oldIdx, newIdx)
        const rest = prev.filter((d) => d.status !== targetStatus)
        return [...rest, ...reordered]
      })
    } else {
      // Move to new column — update local state
      setDeals((prev) =>
        prev.map((d) =>
          d.id === activeItemId ? { ...d, status: targetStatus } : d,
        ),
      )
      // Call server action if available (no-op in demo mode)
      try {
        // @ts-ignore — optional server action
        if (typeof updateDealStatusAction === 'function') {
          // updateDealStatusAction(activeItemId, targetStatus)
        }
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deal Pipeline — Kanban"
        subtitle={`${filteredDeals.length} deals across ${COLUMNS.length} stages`}
        action={
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
            <Kanban size={13} />
            Drag &amp; drop enabled
          </span>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
        <Filter size={15} className="text-slate-400 shrink-0" />

        {/* Broker select */}
        <select
          value={brokerFilter}
          onChange={(e) => setBrokerFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
        >
          <option value="">All Brokers</option>
          {mockBrokers.map((b) => (
            <option key={b.broker_id} value={b.broker_id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Value range */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Deal Value:</span>
          <input
            type="number"
            placeholder="Min ₹"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(brokerFilter || minValue || maxValue) && (
          <button
            onClick={() => { setBrokerFilter(''); setMinValue(''); setMaxValue('') }}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                col={col}
                cards={dealsByStatus[col.status] ?? []}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeDeal ? (
            <div className="w-64 cursor-grabbing rotate-2 shadow-2xl">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
