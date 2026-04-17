'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BuyerLead } from '@/types'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const selectCls = inputCls

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide pb-2 mb-4 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  )
}

export default function EditBuyerLeadForm({ lead, leadId }: { lead: BuyerLead; leadId: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const { updateBuyerLeadAction } = await import('@/app/actions/leads')
    const result = await updateBuyerLeadAction(leadId, formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-3">
        <p className="text-green-700 font-semibold text-lg">Lead updated successfully!</p>
        <div className="flex justify-center gap-3 mt-2">
          <Link href={`/buyer-leads/${leadId}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            View Lead
          </Link>
          <Link href="/buyer-leads" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            All Leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-lg space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href={`/buyer-leads/${leadId}`} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Back to Lead
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Edit Buyer Lead</h1>
          <p className="text-sm text-slate-500">{lead.lead_id} — {lead.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Name *">
              <input name="name" className={inputCls} defaultValue={lead.name} required />
            </Field>
            <Field label="Phone *">
              <input name="phone" className={inputCls} defaultValue={lead.phone} required />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" className={inputCls} defaultValue={lead.whatsapp ?? ''} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" className={inputCls} defaultValue={lead.email ?? ''} />
            </Field>
          </div>
        </Section>

        <Section title="Requirements">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Budget Min (₹)">
              <input name="budget_min" type="number" className={inputCls} defaultValue={lead.budget_min ?? ''} />
            </Field>
            <Field label="Budget Max (₹)">
              <input name="budget_max" type="number" className={inputCls} defaultValue={lead.budget_max ?? ''} />
            </Field>
            <Field label="Preferred Location">
              <input name="preferred_location" className={inputCls} defaultValue={lead.preferred_location ?? ''} />
            </Field>
            <Field label="Property Type Needed">
              <select name="property_type_needed" className={selectCls} defaultValue={lead.property_type_needed ?? ''}>
                <option value="">— Any —</option>
                {['Plot','House','Farm','Commercial'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Area Required">
              <input name="area_required" className={inputCls} defaultValue={lead.area_required ?? ''} placeholder="e.g. 2400 sqft" />
            </Field>
            <Field label="Purpose">
              <select name="purpose" className={selectCls} defaultValue={lead.purpose ?? ''}>
                <option value="">— Select —</option>
                {['Investment','Construction','Agriculture'].map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Urgency">
              <select name="urgency" className={selectCls} defaultValue={lead.urgency ?? ''}>
                <option value="">— Select —</option>
                {['Immediate','3 months','6 months'].map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Loan Required">
              <select name="loan_required" className={selectCls} defaultValue={lead.loan_required ? 'true' : 'false'}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <Field label="Loan Amount (₹)">
              <input name="loan_amount" type="number" className={inputCls} defaultValue={lead.loan_amount ?? ''} />
            </Field>
          </div>
        </Section>

        <Section title="Follow-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Source">
              <select name="source" className={selectCls} defaultValue={lead.source ?? ''}>
                <option value="">— Select —</option>
                {['Instagram','Facebook','WhatsApp','Referral','Walk-in'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Follow-up Date">
              <input name="follow_up_date" type="date" className={inputCls} defaultValue={lead.follow_up_date ?? ''} />
            </Field>
          </div>
        </Section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <Link href={`/buyer-leads/${leadId}`} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
