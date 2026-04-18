'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Bell, CheckCircle, Clock, AlertTriangle, Zap, FileWarning,
  IndianRupee, UserMinus, Building2, Timer, ExternalLink, ChevronDown,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import { markAlertDoneAction, snoozeAlertAction } from '@/app/actions/alerts'
import type { Alert, AlertType } from '@/types'

// ─── Lookup helpers ───────────────────────────────────────────────────────────

function alertLink(alert: Alert): string | null {
  if (!alert.related_id) return null
  switch (alert.related_type) {
    case 'property': return `/properties/${alert.related_id}`
    case 'buyer_lead': return `/buyer-leads/${alert.related_id}`
    case 'seller_lead': return `/seller-leads/${alert.related_id}`
    case 'deal': return `/deals/${alert.related_id}`
    case 'broker': return `/brokers/${alert.related_id}`
    default: return null
  }
}

const alertTypeIcon: Record<AlertType, React.ReactNode> = {
  'Exclusivity Expiring': <AlertTriangle size={16} className="text-orange-500" />,
  'Follow Up Due':        <Clock        size={16} className="text-blue-500" />,
  'Deal Stuck':           <Zap          size={16} className="text-yellow-500" />,
  'Document Missing':     <FileWarning  size={16} className="text-red-500" />,
  'New Lead':             <UserMinus    size={16} className="text-purple-500" />,
  'Commission Due':       <IndianRupee  size={16} className="text-green-500" />,
  'Broker Inactive':      <UserMinus    size={16} className="text-gray-500" />,
  'No Enquiry':           <Building2    size={16} className="text-slate-500" />,
}

const alertTypeBg: Record<AlertType, string> = {
  'Exclusivity Expiring': 'border-l-orange-400 bg-orange-50',
  'Follow Up Due':        'border-l-blue-400 bg-blue-50',
  'Deal Stuck':           'border-l-yellow-400 bg-yellow-50',
  'Document Missing':     'border-l-red-400 bg-red-50',
  'New Lead':             'border-l-purple-400 bg-purple-50',
  'Commission Due':       'border-l-green-400 bg-green-50',
  'Broker Inactive':      'border-l-gray-400 bg-gray-50',
  'No Enquiry':           'border-l-slate-400 bg-slate-50',
}

const TABS: (AlertType | 'All')[] = [
  'All', 'Follow Up Due', 'Exclusivity Expiring', 'Deal Stuck',
  'New Lead', 'Document Missing', 'Commission Due',
]

// ─── Single alert row ─────────────────────────────────────────────────────────

function AlertRow({ alert, onDone, onSnooze }: {
  alert: Alert
  onDone: (id: string) => void
  onSnooze: (id: string, days: number) => void
}) {
  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const viewUrl = alertLink(alert)

  return (
    <div className={cn(
      'bg-white rounded-xl border border-l-4 border-slate-200 p-4',
      alertTypeBg[alert.type as AlertType] ?? 'border-l-slate-400 bg-white',
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {alertTypeIcon[alert.type as AlertType] ?? <Bell size={16} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 leading-snug">{alert.message}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-medium">
              {alert.type}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(alert.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            {viewUrl && (
              <Link
                href={viewUrl}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View <ExternalLink size={10} />
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Snooze */}
          <div className="relative">
            <button
              onClick={() => setSnoozeOpen(v => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Timer size={12} />
              <span className="hidden sm:inline">Snooze</span>
              <ChevronDown size={10} />
            </button>
            {snoozeOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                {[1, 3, 7].map(d => (
                  <button
                    key={d}
                    onClick={() => { onSnooze(alert.id, d); setSnoozeOpen(false) }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                  >
                    {d} day{d > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mark Done */}
          <button
            onClick={() => onDone(alert.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={12} />
            <span className="hidden sm:inline">Done</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface AlertsClientProps {
  initialAlerts: Alert[]
}

export default function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [activeTab, setActiveTab] = useState<AlertType | 'All'>('All')
  const [showDone, setShowDone] = useState(false)
  const [showSnoozed, setShowSnoozed] = useState(false)
  const [, startTransition] = useTransition()

  const now = new Date()

  const active  = alerts.filter(a => !a.is_done && (!a.snoozed_until || new Date(a.snoozed_until) <= now))
  const snoozed = alerts.filter(a => !a.is_done && a.snoozed_until && new Date(a.snoozed_until) > now)
  const done    = alerts.filter(a => a.is_done)

  const filtered = activeTab === 'All'
    ? active
    : active.filter(a => a.type === activeTab)

  function handleDone(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_done: true } : a))
    startTransition(() => { markAlertDoneAction(id) })
  }

  function handleSnooze(id: string, days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, snoozed_until: d.toISOString() } : a))
    startTransition(() => { snoozeAlertAction(id, days) })
  }

  const followUps = active.filter(a => a.type === 'Follow Up Due').length
  const expiring  = active.filter(a => a.type === 'Exclusivity Expiring').length
  const stuck     = active.filter(a => a.type === 'Deal Stuck').length

  return (
    <div className="space-y-6 max-w-screen-lg">
      <PageHeader
        title="Alerts & Reminders"
        subtitle="System-generated alerts that need your attention"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts',       value: active.length,  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
          { label: 'Follow-Ups Today',    value: followUps,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
          { label: 'Expiring Exclusivity',value: expiring,       color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
          { label: 'Snoozed',             value: snoozed.length, color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg} border ${s.border}`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
            )}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 opacity-70">
                ({active.filter(a => a.type === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Alerts */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">All clear — no alerts in this category.</p>
            {snoozed.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">{snoozed.length} alert{snoozed.length > 1 ? 's' : ''} snoozed</p>
            )}
          </div>
        ) : (
          filtered.map(alert => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onDone={handleDone}
              onSnooze={handleSnooze}
            />
          ))
        )}
      </div>

      {/* Snoozed section */}
      {snoozed.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowSnoozed(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Timer size={14} className="text-slate-400" />
              Snoozed alerts ({snoozed.length})
            </span>
            <ChevronDown size={14} className={cn('transition-transform', showSnoozed && 'rotate-180')} />
          </button>
          {showSnoozed && snoozed.map(alert => {
            const until = new Date(alert.snoozed_until!)
            const viewUrl = alertLink(alert)
            return (
              <div key={alert.id} className="px-5 py-3 border-t border-slate-100 flex items-center gap-3 opacity-75">
                <Timer size={14} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 truncate">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Snoozed until {until.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {viewUrl && (
                    <Link href={viewUrl} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                      View <ExternalLink size={10} />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDone(alert.id)}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed alerts */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowDone(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            Completed alerts ({done.length})
          </span>
          <ChevronDown size={14} className={cn('transition-transform', showDone && 'rotate-180')} />
        </button>
        {showDone && done.map(alert => {
          const viewUrl = alertLink(alert)
          return (
            <div key={alert.id} className="px-5 py-3 border-t border-slate-100 flex items-center gap-3 opacity-55">
              <CheckCircle size={14} className="text-green-500 shrink-0" />
              <p className="text-sm text-slate-500 line-through flex-1 truncate">{alert.message}</p>
              {viewUrl && (
                <Link href={viewUrl} className="text-xs text-slate-400 hover:text-blue-500 shrink-0">
                  <ExternalLink size={11} />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
