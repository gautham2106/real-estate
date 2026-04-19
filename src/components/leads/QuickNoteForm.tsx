'use client'

import { useState, useTransition } from 'react'
import { addNoteAction } from '@/app/actions/notes'

const INTERACTION_TYPES = [
  'Call', 'WhatsApp', 'Meeting', 'Email', 'Site Visit Inquiry', 'Proposal Sent', 'Other',
] as const

export const INTERACTION_TYPE_COLORS: Record<string, string> = {
  'Call':                'bg-blue-100 text-blue-700',
  'WhatsApp':            'bg-green-100 text-green-700',
  'Meeting':             'bg-purple-100 text-purple-700',
  'Email':               'bg-slate-100 text-slate-600',
  'Site Visit Inquiry':  'bg-orange-100 text-orange-700',
  'Proposal Sent':       'bg-teal-100 text-teal-700',
  'Other':               'bg-gray-100 text-gray-600',
}

interface QuickNoteFormProps {
  leadId: string
  leadType: 'buyer' | 'seller'
  leadName: string
}

export default function QuickNoteForm({ leadId, leadType, leadName }: QuickNoteFormProps) {
  const [text, setText] = useState('')
  const [interactionType, setInteractionType] = useState<string>('Call')
  const [showToast, setShowToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    startTransition(async () => {
      const result = await addNoteAction(leadId, leadType, text, interactionType)
      if (!result.error) {
        setText('')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    })
  }

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700 mb-3">Log Interaction</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Interaction type pill selector */}
        <div className="flex flex-wrap gap-1.5">
          {INTERACTION_TYPES.map(t => {
            const isActive = interactionType === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setInteractionType(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? `${INTERACTION_TYPE_COLORS[t]} border-current shadow-sm`
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`What happened on this ${interactionType.toLowerCase()} with ${leadName}…`}
            rows={2}
            className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            {isPending ? 'Saving…' : 'Log'}
          </button>
        </div>
      </form>

      {showToast && (
        <div className="absolute bottom-full mb-2 left-0 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md">
          Interaction logged!
        </div>
      )}
    </div>
  )
}
