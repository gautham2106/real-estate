'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { mockProperties, mockBuyerLeads, mockBrokers } from '@/lib/mock-data'

interface Props {
  initialBuyerId?: string
  initialPropertyId?: string
}

export default function NewSiteVisitForm({ initialBuyerId, initialPropertyId }: Props) {
  const [form, setForm] = useState({
    property_id: initialPropertyId ?? '',
    buyer_id: initialBuyerId ?? '',
    visit_date: '', visit_time: '',
    broker_id: '', buyer_reaction: '', buyer_remarks: '', owner_remarks: '',
    price_discussed: '', objections: '', internal_note: '',
    next_action: '', next_action_date: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    const { createSiteVisitAction } = await import('@/app/actions/site-visits')
    const result = await createSiteVisitAction(formData)
    if (result?.error) {
      setServerError(result.error)
      setSubmitting(false)
    }
  }

  const preFillBuyer = initialBuyerId
    ? mockBuyerLeads.find(b => b.id === initialBuyerId)
    : null
  const preFillProperty = initialPropertyId
    ? mockProperties.find(p => p.id === initialPropertyId)
    : null

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-6 max-w-screen-md">
      <div className="flex items-center gap-3">
        <Link href="/site-visits" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Log Site Visit</h2>
          <p className="text-sm text-slate-500">Record a property site visit with full outcome details</p>
        </div>
      </div>

      {/* Pre-fill banner */}
      {(preFillBuyer || preFillProperty) && (
        <div className="flex flex-wrap gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800">
          <span className="font-medium">Pre-filled:</span>
          {preFillBuyer && <span>Buyer — <strong>{preFillBuyer.name}</strong></span>}
          {preFillBuyer && preFillProperty && <span>·</span>}
          {preFillProperty && <span>Property — <strong>{preFillProperty.land_code} {preFillProperty.title}</strong></span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Visit Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Property *</label>
              <select required name="property_id" value={form.property_id} onChange={e => set('property_id', e.target.value)} className={inputCls}>
                <option value="">Select property…</option>
                {mockProperties.map(p => (
                  <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Buyer *</label>
              <select required name="buyer_id" value={form.buyer_id} onChange={e => set('buyer_id', e.target.value)} className={inputCls}>
                <option value="">Select buyer…</option>
                {mockBuyerLeads.map(b => (
                  <option key={b.id} value={b.id}>{b.lead_id} — {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Visit Date *</label>
              <input type="date" required name="visit_date" value={form.visit_date} onChange={e => set('visit_date', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Visit Time</label>
              <input type="time" name="visit_time" value={form.visit_time} onChange={e => set('visit_time', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Broker Arranged</label>
              <select name="broker_id" value={form.broker_id} onChange={e => set('broker_id', e.target.value)} className={inputCls}>
                <option value="">Select broker…</option>
                {mockBrokers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Buyer Reaction</label>
              <select name="buyer_reaction" value={form.buyer_reaction} onChange={e => set('buyer_reaction', e.target.value)} className={inputCls}>
                <option value="">Select reaction…</option>
                {['Interested', 'Not Interested', 'Negotiating', 'Need Time'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Price Discussed (₹)</label>
              <input type="number" name="price_discussed" value={form.price_discussed} onChange={e => set('price_discussed', e.target.value)}
                placeholder="e.g. 1750000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Objections</label>
              <input type="text" name="objections" value={form.objections} onChange={e => set('objections', e.target.value)}
                placeholder="Any concerns raised…" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Buyer Remarks</label>
            <textarea rows={2} name="buyer_remarks" value={form.buyer_remarks} onChange={e => set('buyer_remarks', e.target.value)}
              placeholder="What the buyer said about the property…"
              className={inputCls + ' resize-none'} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Owner Remarks</label>
            <textarea rows={2} name="owner_remarks" value={form.owner_remarks} onChange={e => set('owner_remarks', e.target.value)}
              placeholder="Owner's response / flexibility…"
              className={inputCls + ' resize-none'} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Internal Note <span className="text-slate-400 font-normal">(admin only)</span></label>
            <textarea rows={2} name="internal_note" value={form.internal_note} onChange={e => set('internal_note', e.target.value)}
              placeholder="Admin-only observation…"
              className={inputCls + ' resize-none'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Action</label>
              <input type="text" name="next_action" value={form.next_action} onChange={e => set('next_action', e.target.value)}
                placeholder="e.g. Negotiate price" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Action Date</label>
              <input type="date" name="next_action_date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{serverError}</div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            <Save size={15} />
            {submitting ? 'Saving…' : 'Save Visit'}
          </button>
          <Link href="/site-visits" className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
