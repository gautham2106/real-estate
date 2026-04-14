'use client'

import { useState } from 'react'
import { Bell, CheckCircle, Clock, AlertTriangle, Zap, FileWarning, IndianRupee, UserMinus, Building2, Timer } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { mockAlerts } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Alert, AlertType } from '@/types'

const alertTypeIcon: Record<AlertType, React.ReactNode> = {
  'Exclusivity Expiring': <AlertTriangle size={16} className="text-orange-500" />,
  'Follow Up Due': <Clock size={16} className="text-blue-500" />,
  'Deal Stuck': <Zap size={16} className="text-yellow-500" />,
  'Document Missing': <FileWarning size={16} className="text-red-500" />,
  'New Lead': <UserMinus size={16} className="text-purple-500" />,
  'Commission Due': <IndianRupee size={16} className="text-green-500" />,
  'Broker Inactive': <UserMinus size={16} className="text-gray-500" />,
  'No Enquiry': <Building2 size={16} className="text-slate-500" />,
}

const alertTypeBg: Record<AlertType, string> = {
  'Exclusivity Expiring': 'border-l-orange-400 bg-orange-50',
  'Follow Up Due': 'border-l-blue-400 bg-blue-50',
  'Deal Stuck': 'border-l-yellow-400 bg-yellow-50',
  'Document Missing': 'border-l-red-400 bg-red-50',
  'New Lead': 'border-l-purple-400 bg-purple-50',
  'Commission Due': 'border-l-green-400 bg-green-50',
  'Broker Inactive': 'border-l-gray-400 bg-gray-50',
  'No Enquiry': 'border-l-slate-400 bg-slate-50',
}

const TABS: (AlertType | 'All')[] = [
  'All', 'Exclusivity Expiring', 'Follow Up Due', 'Deal Stuck',
  'New Lead', 'Document Missing', 'Commission Due',
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [activeTab, setActiveTab] = useState<AlertType | 'All'>('All')
  const [showDone, setShowDone] = useState(false)

  const active = alerts.filter(a => !a.is_done)
  const done = alerts.filter(a => a.is_done)

  const filtered = activeTab === 'All'
    ? active
    : active.filter(a => a.type === activeTab)

  const markDone = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_done: true } : a))

  const snooze = (id: string, days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, snoozed_until: d.toISOString() } : a))
  }

  const followUps = active.filter(a => a.type === 'Follow Up Due').length
  const expiring = active.filter(a => a.type === 'Exclusivity Expiring').length
  const stuck = active.filter(a => a.type === 'Deal Stuck').length

  return (
    <div className="space-y-6 max-w-screen-lg">
      <PageHeader title="Alerts & Reminders" subtitle="System-generated alerts for your attention" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: active.length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Follow-Ups Today', value: followUps, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Expiring Exclusivity', value: expiring, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Stuck Deals', value: stuck, color: 'text-yellow-700', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-slate-200`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
            <p className="text-slate-500 font-medium">All clear! No alerts in this category.</p>
          </div>
        ) : (
          filtered.map(alert => (
            <div key={alert.id} className={cn(
              'bg-white rounded-xl border border-l-4 border-slate-200 p-4 flex items-start gap-4',
              alertTypeBg[alert.type as AlertType] ?? 'border-l-slate-400 bg-white'
            )}>
              <div className="mt-0.5 shrink-0">
                {alertTypeIcon[alert.type as AlertType] ?? <Bell size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-medium">
                        {alert.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(alert.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Snooze */}
                    <div className="relative group">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Timer size={12} />
                        Snooze
                      </button>
                      <div className="absolute right-0 top-full mt-1 z-10 hidden group-focus-within:flex group-hover:flex flex-col bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                        {[1, 3, 7].map(d => (
                          <button
                            key={d}
                            onClick={() => snooze(alert.id, d)}
                            className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                          >
                            {d} day{d > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => markDone(alert.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={12} />
                      Mark Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Done section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowDone(!showDone)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <span>Completed alerts ({done.length})</span>
          <span>{showDone ? '▲' : '▼'}</span>
        </button>
        {showDone && done.map(alert => (
          <div key={alert.id} className="px-5 py-3 border-t border-slate-100 flex items-center gap-3 opacity-60">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <p className="text-sm text-slate-600 line-through">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
