'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle, Calendar, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setFollowUpDateAction } from '@/app/actions/leads'
import type { FollowUpItem } from '@/lib/dal'

interface Props {
  items: FollowUpItem[]
}

function FollowUpRow({ item }: { item: FollowUpItem }) {
  const [done, setDone] = useState(false)
  const [reschedule, setReschedule] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [isPending, startTransition] = useTransition()

  const href = item.type === 'buyer' ? `/buyer-leads/${item.id}` : `/seller-leads/${item.id}`

  function handleReschedule() {
    if (!newDate) return
    setDone(true)
    startTransition(() => {
      setFollowUpDateAction(item.id, item.type, newDate)
    })
  }

  if (done) return null

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
        {item.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={href} className="text-sm font-semibold text-slate-800 hover:text-blue-600 truncate block">
          {item.name}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{item.lead_id}</span>
          <span className="text-xs text-slate-300">·</span>
          <span className={cn(
            'text-xs font-medium px-1.5 py-0.5 rounded-full',
            item.type === 'buyer' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
          )}>
            {item.type === 'buyer' ? 'Buyer' : 'Seller'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {reschedule ? (
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="text-xs border border-slate-200 rounded px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={handleReschedule}
              disabled={!newDate || isPending}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Set
            </button>
            <button onClick={() => setReschedule(false)} className="text-xs text-slate-400 hover:text-slate-600 px-1">
              ✕
            </button>
          </div>
        ) : (
          <>
            <a
              href={`tel:${item.phone}`}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
              title={`Call ${item.phone}`}
            >
              <Phone size={13} />
            </a>
            <button
              onClick={() => setReschedule(true)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-500 hover:text-orange-600 transition-colors"
              title="Reschedule follow-up"
            >
              <Calendar size={13} />
            </button>
            <button
              onClick={() => {
                setDone(true)
                // Clear follow-up by setting a future date — effectively marks as handled
                startTransition(() => {
                  const nextWeek = new Date()
                  nextWeek.setDate(nextWeek.getDate() + 7)
                  setFollowUpDateAction(item.id, item.type, nextWeek.toISOString().split('T')[0])
                })
              }}
              className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
              title="Mark as called"
            >
              <CheckCircle size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function FollowUpsPanel({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle size={28} className="text-green-400 mb-2" />
        <p className="text-sm text-slate-500 font-medium">No follow-ups due today</p>
        <p className="text-xs text-slate-400 mt-0.5">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div>
      {items.map(item => (
        <FollowUpRow key={`${item.type}-${item.id}`} item={item} />
      ))}
    </div>
  )
}
