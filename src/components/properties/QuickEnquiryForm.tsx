'use client'

import { useState, useTransition } from 'react'
import { logEnquiryAction } from '@/app/actions/enquiry'

interface QuickEnquiryFormProps {
  propertyId: string
  propertyTitle: string
}

export default function QuickEnquiryForm({ propertyId, propertyTitle }: QuickEnquiryFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    startTransition(async () => {
      const result = await logEnquiryAction(propertyId, name, phone, notes)
      if (result.success) {
        setName('')
        setPhone('')
        setNotes('')
        setIsOpen(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    })
  }

  return (
    <div className="relative">
      {showToast && (
        <div className="absolute top-full mt-2 right-0 z-10 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
          Enquiry logged! Buyer lead created.
        </div>
      )}

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          📞 Log Enquiry
        </button>
      ) : (
        <div className="absolute right-0 top-full mt-2 z-10 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Log Enquiry</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-slate-500 -mt-1">{propertyTitle}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Enquirer Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Brief note about the enquiry…"
                rows={2}
                className="w-full resize-none border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending || !name.trim() || !phone.trim()}
                className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Saving…' : 'Log Enquiry'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
