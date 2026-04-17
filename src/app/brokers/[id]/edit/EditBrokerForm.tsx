'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Broker, BrokerStatus } from '@/types'
import { updateBrokerAction } from '@/app/actions/brokers'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full'
const selectCls = inputCls

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

interface Props {
  broker: Broker
  allBrokers: Broker[]
}

export default function EditBrokerForm({ broker, allBrokers }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await updateBrokerAction(broker.id, new FormData(e.currentTarget))
    setSaving(false)
    if (result?.error) { setError(result.error); return }
    router.push(`/brokers/${broker.id}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/brokers/${broker.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Broker
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Edit Broker — {broker.name}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input name="name" className={inputCls} defaultValue={broker.name} required />
            </Field>
            <Field label="Phone" required>
              <input name="phone" className={inputCls} defaultValue={broker.phone} required />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" className={inputCls} defaultValue={broker.whatsapp ?? ''} placeholder="Same as phone if same" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" className={inputCls} defaultValue={broker.email} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Area Coverage">
                <input name="area_coverage" className={inputCls} defaultValue={broker.area_coverage ?? ''} placeholder="e.g. Rasipuram, Namakkal" />
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Network</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'recruited_by_id', label: 'Recruited By', val: broker.recruited_by_id },
              { name: 'co_sponsor_1_id', label: 'Co-Sponsor 1', val: broker.co_sponsor_1_id },
              { name: 'co_sponsor_2_id', label: 'Co-Sponsor 2', val: broker.co_sponsor_2_id },
            ].map(f => (
              <Field key={f.name} label={f.label}>
                <select name={f.name} className={selectCls} defaultValue={f.val ?? ''}>
                  <option value="">— None —</option>
                  {allBrokers.filter(b => b.id !== broker.id).map(b => (
                    <option key={b.id} value={b.id}>{b.broker_id} — {b.name}</option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Payment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Account">
              <input name="bank_account" className={inputCls} defaultValue={broker.bank_account ?? ''} placeholder="Account number" />
            </Field>
            <Field label="UPI ID">
              <input name="upi_id" className={inputCls} defaultValue={broker.upi_id ?? ''} placeholder="e.g. broker@upi" />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Status & Notes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Status">
              <select name="status" className={selectCls} defaultValue={broker.status}>
                {(['Active', 'Inactive', 'Blacklisted'] as BrokerStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Login Active">
              <select name="login_active" className={selectCls} defaultValue={broker.login_active ? 'true' : 'false'}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <textarea name="notes" className={inputCls} rows={3} defaultValue={broker.notes ?? ''} placeholder="Internal notes..." />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href={`/brokers/${broker.id}`} className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
