'use client'

import { useState, useMemo, useRef } from 'react'
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
import { Kanban, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { formatCurrency, cn } from '@/lib/utils'
import type { Deal, DealStatus } from '@/types'

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

// ─── Deal Card ────────────────────────────────────────────────────────────────

interface CardProps {
  deal: Deal
  propertyMap: Record<string, { land_code: string }>
  brokerMap: Record<string, string>
  buyerMap: Record<string, string>
  isDragging?: boolean
}

function DealCard({ deal, propertyMap, brokerMap, buyerMap, isDragging = false }: CardProps) {
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
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="font-bold text-xs text-blue-700 font-mono">
          {prop?.land_code ?? deal.property_id}
        </span>
        <span className="text-xs text-slate-400 shrink-0">{deal.deal_id}</span>
      </div>

      <p className="text-xs font-medium text-slate-800 mb-1 truncate">{buyerName}</p>

      <p className="text-sm font-bold text-slate-900">{formatCurrency(deal.deal_value)}</p>

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

function SortableCard({
  deal,
  propertyMap,
  brokerMap,
  buyerMap,
}: {
  deal: Deal
  propertyMap: Record<string, { land_code: string }>
  brokerMap: Record<string, string>
  buyerMap: Record<string, string>
}) {
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
      <DealCard
        deal={deal}
        propertyMap={propertyMap}
        brokerMap={brokerMap}
        buyerMap={buyerMap}
        isDragging={isDragging}
      />
    </div>
  )
}

// ─── Column (droppable) ───────────────────────────────────────────────────────

function KanbanColumn({
  col,
  cards,
  propertyMap,
  brokerMap,
  buyerMap,
}: {
  col: (typeof COLUMNS)[number]
  cards: Deal[]
  propertyMap: Record<string, { land_code: string }>
  brokerMap: Record<string, string>
  buyerMap: Record<string, string>
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
      <div className={cn('px-3 py-2.5 rounded-t-xl border-b border-slate-200', col.header)}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 leading-tight">{col.status}</span>
          <span className="bg-white text-slate-600 text-xs font-bold rounded-full px-2 py-0.5 min-w-[24px] text-center shadow-sm shrink-0">
            {cards.length}
          </span>
        </div>
      </div>

      <SortableContext items={cards.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
          {cards.length === 0 && (
            <div className="flex-1 flex items-center justify-center min-h-[80px] border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-xs text-slate-300 text-center">Drop here</p>
            </div>
          )}
          {cards.map((deal) => (
            <SortableCard
              key={deal.id}
              deal={deal}
              propertyMap={propertyMap}
              brokerMap={brokerMap}
              buyerMap={buyerMap}
            />
          ))}
        </div>
      </SortableContext>

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

// ─── KanbanClient ─────────────────────────────────────────────────────────────

interface KanbanClientProps {
  initialDeals: Deal[]
  propertyMap: Record<string, { land_code: string }>
  brokerMap: Record<string, string>
  buyerMap: Record<string, string>
  brokerOptions: { broker_id: string; name: string }[]
}

export default function KanbanClient({
  initialDeals,
  propertyMap,
  brokerMap,
  buyerMap,
  brokerOptions,
}: KanbanClientProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [brokerFilter, setBrokerFilter] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [mobileColIdx, setMobileColIdx] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)

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

    const overIsColumn = COLUMNS.some((c) => c.status === overId)
    const overDeal = deals.find((d) => d.id === overId)
    const targetStatus: DealStatus = overIsColumn
      ? (overId as DealStatus)
      : overDeal
        ? overDeal.status
        : activeDealItem.status

    if (activeDealItem.status === targetStatus) {
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
      setDeals((prev) =>
        prev.map((d) =>
          d.id === activeItemId ? { ...d, status: targetStatus } : d,
        ),
      )
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

        <select
          value={brokerFilter}
          onChange={(e) => setBrokerFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
        >
          <option value="">All Brokers</option>
          {brokerOptions.map((b) => (
            <option key={b.broker_id} value={b.broker_id}>
              {b.name}
            </option>
          ))}
        </select>

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

      {/* Mobile view — status tabs + card list */}
      <div className="md:hidden space-y-3">
        {/* Tab scroll bar */}
        <div className="relative">
          <div ref={tabsRef} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {COLUMNS.map((col, i) => (
              <button
                key={col.status}
                onClick={() => setMobileColIdx(i)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                  mobileColIdx === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600',
                )}
              >
                {col.status}
                <span className={cn('ml-1', mobileColIdx === i ? 'opacity-80' : 'text-slate-400')}>
                  ({(dealsByStatus[COLUMNS[i].status] ?? []).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => setMobileColIdx(i => Math.max(0, i - 1))}
            disabled={mobileColIdx === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-30"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <span className="font-medium text-slate-700">{COLUMNS[mobileColIdx].status}</span>
          <button
            onClick={() => setMobileColIdx(i => Math.min(COLUMNS.length - 1, i + 1))}
            disabled={mobileColIdx === COLUMNS.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-30"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>

        {/* Cards for selected column */}
        <div className="space-y-2">
          {(dealsByStatus[COLUMNS[mobileColIdx].status] ?? []).length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-slate-400 text-sm">
              No deals in this stage
            </div>
          ) : (
            (dealsByStatus[COLUMNS[mobileColIdx].status] ?? []).map(deal => {
              const prop = propertyMap[deal.property_id]
              const brokerName = deal.buyer_broker_id ? brokerMap[deal.buyer_broker_id] ?? deal.buyer_broker_id : '—'
              const buyerName = buyerMap[deal.buyer_lead_id] ?? 'Unknown'
              const days = daysSince(deal.created_at)
              return (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-blue-700 font-mono">{prop?.land_code ?? deal.property_id}</span>
                    <span className="text-xs text-slate-400">{deal.deal_id}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-1">{buyerName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(deal.deal_value)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full max-w-[100px] truncate">{brokerName}</span>
                      <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded', days > 14 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500')}>
                        {days}d
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* Kanban Board — desktop only */}
      <div className="hidden md:block">
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
                  propertyMap={propertyMap}
                  brokerMap={brokerMap}
                  buyerMap={buyerMap}
                />
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeDeal ? (
              <div className="w-64 cursor-grabbing rotate-2 shadow-2xl">
                <DealCard
                  deal={activeDeal}
                  propertyMap={propertyMap}
                  brokerMap={brokerMap}
                  buyerMap={buyerMap}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
