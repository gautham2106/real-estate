'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { SiteVisit, Property, BuyerLead, Broker } from '@/types'
import { updateSiteVisitAction } from '@/app/actions/site-visits'
import { formatCurrency } from '@/lib/utils'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  )
}

interface Props {
  visit: SiteVisit
  properties: Property[]
  buyers: BuyerLead[]
  brokers: Broker[]
}

export default function EditSiteVisitForm({ visit, properties, buyers, brokers }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await updateSiteVisitAction(visit.id, new FormData(e.currentTarget))
    setSaving(false)
    if (result?.error) { setError(result.error); return }
    router.push(`/site-visits/${visit.id}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/site-visits/${visit.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Visit
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Edit Site Visit — {visit.visit_id}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Visit Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Property">
              <select name="property_id" className={inputCls} defaultValue={visit.property_id} required>
                {properties.map(p => <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>)}
              </select>
            </Field>
            <Field label="Buyer">
              <select name="buyer_id" className={inputCls} defaultValue={visit.buyer_id} required>
                {buyers.map(b => <option key={b.id} value={b.id}>{b.name} ({b.phone})</option>)}
              </select>
            </Field>
            <Field label="Visit Date">
              <input name="visit_date" type="date" className={inputCls} defaultValue={visit.visit_date.split('T')[0]} required />
            </Field>
            <Field label="Visit Time">
              <input name="visit_time" type="time" className={inputCls} defaultValue={visit.visit_time ?? ''} />
            </Field>
            <Field label="Broker">
              <select name="broker_id" className={inputCls} defaultValue={visit.broker_id ?? ''}>
                <option value="">— None —</option>
                {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Price Discussed (₹)">
              <input name="price_discussed" type="number" className={inputCls} defaultValue={visit.price_discussed ?? ''} placeholder="e.g. 1500000" />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Outcome & Feedback</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Buyer Reaction">
              <select name="buyer_reaction" className={inputCls} defaultValue={visit.buyer_reaction ?? ''}>
                <option value="">— Not set —</option>
                {['Interested', 'Not Interested', 'Negotiating', 'Need Time'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Outcome">
              <select name="outcome" className={inputCls} defaultValue={visit.outcome ?? ''}>
                <option value="">— Not set —</option>
                <option value="Progressed">Progressed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Buyer Remarks">
                <textarea name="buyer_remarks" className={inputCls} rows={2} defaultValue={visit.buyer_remarks ?? ''} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Objections">
                <textarea name="objections" className={inputCls} rows={2} defaultValue={visit.objections ?? ''} placeholder="Any price/location/legal concerns?" />
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Next Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Next Action">
              <input name="next_action" className={inputCls} defaultValue={visit.next_action ?? ''} placeholder="e.g. Send quotation, Schedule follow-up" />
            </Field>
            <Field label="Next Action Date">
              <input name="next_action_date" type="date" className={inputCls} defaultValue={visit.next_action_date ?? ''} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Internal Note">
                <textarea name="internal_note" className={inputCls} rows={2} defaultValue={visit.internal_note ?? ''} placeholder="Private notes visible only to admin/brokers..." />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href={`/site-visits/${visit.id}`} className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
