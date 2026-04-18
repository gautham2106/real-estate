'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

type CalEvent = {
  id: string
  date: string
  type: 'visit' | 'followup'
  title: string
  subtitle: string
  href: string
  color: string
  overdue?: boolean
}

interface CalendarClientProps {
  events: CalEvent[]
  today: string
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay() // 0=Sun
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarClient({ events, today }: CalendarClientProps) {
  const todayDate = new Date(today)
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(today)
  const [filter, setFilter] = useState<'all' | 'visit' | 'followup'>('all')

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = (day: number) => `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    const evs = eventsByDate[selectedDate] ?? []
    return filter === 'all' ? evs : evs.filter(e => e.type === filter)
  }, [selectedDate, eventsByDate, filter])

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.date >= today && (filter === 'all' || e.type === filter))
      .slice(0, 15)
  }, [events, today, filter])

  return (
    <div className="max-w-screen-lg space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-500" />
          <h1 className="text-xl font-bold text-slate-800">Calendar</h1>
        </div>
        <div className="flex gap-2">
          {(['all', 'visit', 'followup'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'visit' ? 'Site Visits' : 'Follow-ups'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <h2 className="font-semibold text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const ds = dateStr(day)
              const dayEvents = (eventsByDate[ds] ?? []).filter(e => filter === 'all' || e.type === filter)
              const isToday = ds === today
              const isSelected = ds === selectedDate
              const hasOverdue = dayEvents.some(e => e.overdue)

              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDate(ds)}
                  className={`relative min-h-[44px] p-1 rounded-lg text-xs transition-colors flex flex-col items-center ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                      ? 'bg-blue-50 border border-blue-300 text-blue-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className={`font-medium ${isSelected ? 'text-white' : ''}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((_, ei) => (
                        <span
                          key={ei}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : hasOverdue ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-500">Site Visit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-slate-500">Overdue Follow-up</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Selected day events */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">
              {selectedDate === today ? 'Today' : selectedDate ?? 'Select a date'}
              {selectedEvents.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">({selectedEvents.length})</span>
              )}
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No events on this day</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(ev => (
                  <Link
                    key={ev.id}
                    href={ev.href}
                    className={`block border rounded-lg px-3 py-2 text-xs hover:opacity-80 transition-opacity ${ev.color}`}
                  >
                    <p className="font-semibold">{ev.title}</p>
                    <p className="opacity-70">{ev.subtitle}</p>
                    {ev.overdue && <p className="text-red-600 font-medium mt-0.5">⚠ Overdue</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(ev => (
                  <Link
                    key={ev.id}
                    href={ev.href}
                    className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-1 px-1 rounded transition-colors"
                  >
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${ev.type === 'visit' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{ev.title}</p>
                      <p className="text-[11px] text-slate-400">{ev.date} · {ev.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
