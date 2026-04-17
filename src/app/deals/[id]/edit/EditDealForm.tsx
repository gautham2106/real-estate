'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Deal, Property, BuyerLead, SellerLead, Broker } from '@/types'
import { updateDealAction } from '@/app/actions/deals'
import { formatCurrency } from '@/lib/utils'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

interface Props {
  deal: Deal
  properties: Property[]
  buyers: BuyerLead[]
  sellers: SellerLead[]
  brokers: Broker[]
}

export default function EditDealForm({ deal, properties, buyers, sellers, brokers }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dealValue, setDealValue] = useState(deal.deal_value)
  const [buyerPct, setBuyerPct] = useState(deal.buyer_commission_pct)
  const [sellerPct, setSellerPct] = useState(deal.seller_commission_pct)

  const commission = useMemo(() => {
    const total = dealValue * (buyerPct + sellerPct) / 100
    const buyerBroker = dealValue * 1.25 / 100
    const sellerBroker = dealValue * 1.25 / 100
    const net = total - buyerBroker - sellerBroker
    return { total, buyerBroker, sellerBroker, net }
  }, [dealValue, buyerPct, sellerPct])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await updateDealAction(deal.id, new FormData(e.currentTarget))
    setSaving(false)
    if (result?.error) { setError(result.error); return }
    router.push(`/deals/${deal.id}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/deals/${deal.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft size={14} /> Back to Deal
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Edit Deal — {deal.deal_id}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parties */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Parties</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Property" required>
              <select name="property_id" className={inputCls} defaultValue={deal.property_id} required>
                <option value="">— Select Property —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.land_code} — {p.title}</option>)}
              </select>
            </Field>
            <Field label="Buyer" required>
              <select name="buyer_lead_id" className={inputCls} defaultValue={deal.buyer_lead_id} required>
                <option value="">— Select Buyer —</option>
                {buyers.map(b => <option key={b.id} value={b.id}>{b.name} ({b.phone})</option>)}
              </select>
            </Field>
            <Field label="Seller Lead (optional)">
              <select name="seller_lead_id" className={inputCls} defaultValue={deal.seller_lead_id ?? ''}>
                <option value="">— None —</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.owner_name} — {s.property_location}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Brokers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Brokers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'buyer_broker_id', label: 'Buyer Broker', val: deal.buyer_broker_id },
              { name: 'seller_broker_id', label: 'Seller Broker', val: deal.seller_broker_id },
              { name: 'referral_broker_id', label: 'Referral Broker', val: deal.referral_broker_id },
            ].map(f => (
              <Field key={f.name} label={f.label}>
                <select name={f.name} className={inputCls} defaultValue={f.val ?? ''}>
                  <option value="">— None —</option>
                  {brokers.map(b => <option key={b.id} value={b.id}>{b.broker_id} — {b.name}</option>)}
                </select>
              </Field>
            ))}
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Financials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Deal Value (₹)" required>
              <input name="deal_value" type="number" className={inputCls} value={dealValue}
                onChange={e => setDealValue(Number(e.target.value))} required />
            </Field>
            <Field label="Buyer Commission %">
              <input name="buyer_commission_pct" type="number" step="0.1" className={inputCls}
                value={buyerPct} onChange={e => setBuyerPct(Number(e.target.value))} />
            </Field>
            <Field label="Seller Commission %">
              <input name="seller_commission_pct" type="number" step="0.1" className={inputCls}
                value={sellerPct} onChange={e => setSellerPct(Number(e.target.value))} />
            </Field>
          </div>
          {/* Live preview */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Total Commission', value: commission.total, color: 'text-blue-700' },
              { label: 'Buyer Broker', value: commission.buyerBroker, color: 'text-slate-600' },
              { label: 'Seller Broker', value: commission.sellerBroker, color: 'text-slate-600' },
              { label: 'Your Net', value: commission.net, color: 'text-green-700 font-bold' },
            ].map(r => (
              <div key={r.label}>
                <p className="text-xs text-slate-400">{r.label}</p>
                <p className={`text-sm font-semibold ${r.color}`}>{formatCurrency(r.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Token / Payments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Token & Payments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Token Amount (₹)">
              <input name="token_amount" type="number" className={inputCls} defaultValue={deal.token_amount ?? ''} />
            </Field>
            <Field label="Token Date">
              <input name="token_date" type="date" className={inputCls} defaultValue={deal.token_date ?? ''} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <textarea name="notes" className={inputCls} rows={3} defaultValue={deal.notes ?? ''} />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href={`/deals/${deal.id}`} className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
