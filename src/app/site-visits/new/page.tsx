'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { mockProperties, mockBuyerLeads, mockBrokers } from '@/lib/mock-data'

export default function NewSiteVisitPage() {
  const [form, setForm] = useState({
    property_id: '', buyer_id: '', visit_date: '', visit_time: '',
    broker_id: '', buyer_reaction: '', buyer_remarks: '', owner_remarks: '',
    price_discussed: '', objections: '', internal_note: '',
    next_action: '', next_action_date: '',
  })
  const [saved, setSaved] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-screen-md">
      <div className="flex items-center gap-3">
        <Link href="/site-visits" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Schedule Site Visit</h2>
          <p className="text-sm text-slate-500">Record a new property site visit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Visit Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Property *</label>
              <select required value={form.property_id} onChange={e => set('property_id', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select property...</option>
                {mockProperties.map(p => (
                  <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Buyer *</label>
              <select required value={form.buyer_id} onChange={e => set('buyer_id', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select buyer...</option>
                {mockBuyerLeads.map(b => (
                  <option key={b.id} value={b.id}>{b.lead_id} — {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Visit Date *</label>
              <input type="date" required value={form.visit_date} onChange={e => set('visit_date', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Visit Time</label>
              <input type="time" value={form.visit_time} onChange={e => set('visit_time', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Broker Arranged</label>
              <select value={form.broker_id} onChange={e => set('broker_id', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select broker...</option>
                {mockBrokers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Buyer Reaction</label>
              <select value={form.buyer_reaction} onChange={e => set('buyer_reaction', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select reaction...</option>
                {['Interested', 'Not Interested', 'Negotiating', 'Need Time'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Price Discussed (₹)</label>
              <input type="number" value={form.price_discussed} onChange={e => set('price_discussed', e.target.value)}
                placeholder="e.g. 1750000"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Objections</label>
              <input type="text" value={form.objections} onChange={e => set('objections', e.target.value)}
                placeholder="Any concerns raised..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Buyer Remarks</label>
            <textarea rows={2} value={form.buyer_remarks} onChange={e => set('buyer_remarks', e.target.value)}
              placeholder="What the buyer said about the property..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Owner Remarks</label>
            <textarea rows={2} value={form.owner_remarks} onChange={e => set('owner_remarks', e.target.value)}
              placeholder="Owner's response / flexibility..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Internal Note</label>
            <textarea rows={2} value={form.internal_note} onChange={e => set('internal_note', e.target.value)}
              placeholder="Admin-only observation..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Action</label>
              <input type="text" value={form.next_action} onChange={e => set('next_action', e.target.value)}
                placeholder="e.g. Negotiate price"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Action Date</label>
              <input type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Visit'}
          </button>
          <Link href="/site-visits"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
