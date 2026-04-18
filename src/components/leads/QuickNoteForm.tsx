'use client'

import { useState, useTransition } from 'react'
import { addNoteAction } from '@/app/actions/notes'

interface QuickNoteFormProps {
  leadId: string
  leadType: 'buyer' | 'seller'
  leadName: string
}

export default function QuickNoteForm({ leadId, leadType, leadName }: QuickNoteFormProps) {
  const [text, setText] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    startTransition(async () => {
      const result = await addNoteAction(leadId, leadType, text)
      if (!result.error) {
        setText('')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    })
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Log a call, note, or update for ${leadName}…`}
          rows={2}
          className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          {isPending ? 'Saving…' : 'Add Note'}
        </button>
      </form>

      {showToast && (
        <div className="absolute bottom-full mb-2 left-0 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md">
          Note saved!
        </div>
      )}
    </div>
  )
}
